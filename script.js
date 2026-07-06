/* ══════════════════════════════════════════════════════════════
   INK & TIDE — interactions
   ══════════════════════════════════════════════════════════════ */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─────────────────────────────────────────────────────────────
   1. WebGL fluid backdrop
   A GPU ripple field: two ping-pong height buffers run a damped
   wave equation; pointer + scroll inject drops; a final pass
   shades the surface into dark water lit by the white sun.
   Falls back silently to the CSS ground if WebGL is unavailable.
   ───────────────────────────────────────────────────────────── */
(function fluid() {
  const canvas = document.getElementById('fluid');
  if (!canvas || reduceMotion) return;

  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false });
  if (!gl) return;

  // Simulation grid (kept small — it's a backdrop, and it scales up on screen)
  const SIM = 256;

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  function shader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); }
    return s;
  }
  function program(vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, shader(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    return p;
  }

  const VERT = `
    attribute vec2 p;
    varying vec2 uv;
    void main(){ uv = p*0.5+0.5; gl_Position = vec4(p,0.,1.); }`;

  // Wave-propagation pass: reads prev + current height, writes next height
  const SIM_FRAG = `
    precision highp float;
    varying vec2 uv;
    uniform sampler2D cur;   // current height (r) + velocity in g
    uniform vec2 texel;
    uniform vec2 drop;       // drop position (uv)
    uniform float dropOn;    // strength
    void main(){
      vec4 c = texture2D(cur, uv);
      float h = c.r;
      float v = c.g;
      float l = texture2D(cur, uv - vec2(texel.x,0.)).r;
      float r = texture2D(cur, uv + vec2(texel.x,0.)).r;
      float u = texture2D(cur, uv - vec2(0.,texel.y)).r;
      float d = texture2D(cur, uv + vec2(0.,texel.y)).r;
      float lap = (l + r + u + d) * 0.25 - h;
      v += lap * 1.9;          // wave speed
      v *= 0.986;              // damping
      h += v;
      // inject drop
      float dd = distance(uv, drop);
      h += dropOn * smoothstep(0.035, 0.0, dd);
      gl_FragColor = vec4(h, v, 0., 1.);
    }`;

  // Shade pass: turn the height field into lit dark water
  const SHADE_FRAG = `
    precision highp float;
    varying vec2 uv;
    uniform sampler2D cur;
    uniform vec2 texel;
    uniform vec2 res;
    void main(){
      // normal from height gradient
      float l = texture2D(cur, uv - vec2(texel.x,0.)).r;
      float r = texture2D(cur, uv + vec2(texel.x,0.)).r;
      float u = texture2D(cur, uv - vec2(0.,texel.y)).r;
      float d = texture2D(cur, uv + vec2(0.,texel.y)).r;
      vec3 n = normalize(vec3(l - r, u - d, 0.14));

      // deep-water base, biased blue
      vec3 deep    = vec3(0.020, 0.031, 0.051);
      vec3 shallow = vec3(0.043, 0.094, 0.145);
      vec3 base = mix(deep, shallow, uv.y*0.6 + 0.2);

      // white sun, top-right
      vec3 sunDir = normalize(vec3(0.55, 0.5, 0.65));
      float spec = pow(max(dot(n, sunDir), 0.0), 22.0);
      float caustic = pow(max(dot(n, sunDir), 0.0), 3.0) * 0.10;

      // soft sun glow in the corner
      float glow = smoothstep(0.9, 0.0, distance(uv, vec2(0.9, 0.92)));

      vec3 col = base + caustic * vec3(0.4,0.55,0.7);
      col += spec * vec3(1.0);                 // white caustic glints
      col += glow * 0.05 * vec3(0.8,0.9,1.0);
      gl_FragColor = vec4(col, 1.0);
    }`;

  const simProg = program(VERT, SIM_FRAG);
  const shadeProg = program(VERT, SHADE_FRAG);

  // The wave sim stores signed velocity, so it needs float/half-float
  // textures. Without them the field can't hold negatives — bail to the
  // CSS water ground (body.no-fluid) rather than render garbage.
  const halfExt = gl.getExtension('OES_texture_half_float');
  const floatExt = gl.getExtension('OES_texture_float');
  const TYPE = floatExt ? gl.FLOAT
             : halfExt ? halfExt.HALF_FLOAT_OES
             : null;
  if (TYPE === null) { document.body.classList.add('no-fluid'); return; }
  // linear filtering on float textures is its own extension; ignore if absent
  gl.getExtension('OES_texture_float_linear');
  gl.getExtension('OES_texture_half_float_linear');

  function makeTarget() {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SIM, SIM, 0, gl.RGBA, TYPE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { tex, fb };
  }

  let a = makeTarget();
  let b = makeTarget();

  // if the float FBO isn't renderable, bail to the CSS water ground
  gl.bindFramebuffer(gl.FRAMEBUFFER, a.fb);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    document.body.classList.add('no-fluid');
    return;
  }

  function bindQuad(prog) {
    const loc = gl.getAttribLocation(prog, 'p');
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  }

  const uSim = {
    cur: gl.getUniformLocation(simProg, 'cur'),
    texel: gl.getUniformLocation(simProg, 'texel'),
    drop: gl.getUniformLocation(simProg, 'drop'),
    dropOn: gl.getUniformLocation(simProg, 'dropOn'),
  };
  const uShade = {
    cur: gl.getUniformLocation(shadeProg, 'cur'),
    texel: gl.getUniformLocation(shadeProg, 'texel'),
    res: gl.getUniformLocation(shadeProg, 'res'),
  };

  let drop = { x: 0.5, y: 0.5, on: 0 };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
  }
  resize();
  addEventListener('resize', resize);

  // pointer + touch inject drops
  let lastX = 0, lastY = 0;
  function pointer(clientX, clientY, strength) {
    const x = clientX / innerWidth;
    const y = 1.0 - clientY / innerHeight;
    const moved = Math.hypot(x - lastX, y - lastY);
    drop = { x, y, on: Math.min(0.5, 0.12 + moved * (strength || 4)) };
    lastX = x; lastY = y;
  }
  addEventListener('pointermove', e => pointer(e.clientX, e.clientY), { passive: true });
  addEventListener('pointerdown', e => pointer(e.clientX, e.clientY, 14), { passive: true });
  addEventListener('scroll', () => { drop = { x: 0.5, y: 0.5, on: 0.03 }; }, { passive: true });

  // ambient current — a slow wandering drop so the water never sits dead still
  let t = 0;
  function ambient() {
    t += 0.008;
    return { x: 0.5 + 0.35 * Math.sin(t * 0.7), y: 0.55 + 0.3 * Math.cos(t), on: 0.02 };
  }

  const texel = [1 / SIM, 1 / SIM];

  function step(injection) {
    gl.viewport(0, 0, SIM, SIM);
    gl.bindFramebuffer(gl.FRAMEBUFFER, b.fb);
    gl.useProgram(simProg);
    bindQuad(simProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, a.tex);
    gl.uniform1i(uSim.cur, 0);
    gl.uniform2fv(uSim.texel, texel);
    gl.uniform2f(uSim.drop, injection.x, injection.y);
    gl.uniform1f(uSim.dropOn, injection.on);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    [a, b] = [b, a]; // swap
  }

  function render() {
    // two sim substeps per frame for smoother propagation
    step(drop.on > 0.001 ? drop : ambient());
    drop.on *= 0.6;
    step(ambient());

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(shadeProg);
    bindQuad(shadeProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, a.tex);
    gl.uniform1i(uShade.cur, 0);
    gl.uniform2fv(uShade.texel, texel);
    gl.uniform2f(uShade.res, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(render);
  }
  render();
})();

/* ─────────────────────────────────────────────────────────────
   2. Boot / dive-in
   ───────────────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  const boot = document.getElementById('boot');
  if (!boot) return;
  setTimeout(() => boot.classList.add('done'), reduceMotion ? 200 : 1900);
});

/* ─────────────────────────────────────────────────────────────
   3. Reveal on scroll + count-up stats
   ───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
      if (e.target.hasAttribute('data-count')) countUp(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  document.querySelectorAll('[data-count]').forEach(el => io.observe(el));

  function countUp(el) {
    if (reduceMotion) { el.textContent = el.dataset.count; return; }
    const target = parseInt(el.dataset.count, 10);
    const dur = 1100;
    const start = performance.now();
    (function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }
});

/* ─────────────────────────────────────────────────────────────
   4. Nav — scrolled state, smooth anchors, mobile burger
   ───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  const burger = document.querySelector('.nav__burger');
  const links = document.querySelector('.nav__links');
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('active');
    links.classList.toggle('active', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  document.querySelectorAll('[data-scroll-to]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (!id || !id.startsWith('#')) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      burger.classList.remove('active');
      links.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
});

/* ─────────────────────────────────────────────────────────────
   5. Work tooltip
   ───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const tip = document.createElement('div');
  tip.className = 'work-tooltip';
  document.body.appendChild(tip);

  document.querySelectorAll('.work__item[data-desc]').forEach(item => {
    item.addEventListener('mousemove', e => {
      tip.textContent = item.dataset.desc;
      tip.classList.add('show');
      const h = tip.offsetHeight || 80;
      let top = e.clientY - h - 18;
      if (top < 8) top = e.clientY + 24;
      let left = e.clientX + 20;
      if (left + 320 > innerWidth) left = e.clientX - 320;
      tip.style.left = left + 'px';
      tip.style.top = top + 'px';
    });
    item.addEventListener('mouseleave', () => tip.classList.remove('show'));
  });
});

/* ─────────────────────────────────────────────────────────────
   6. Contact form (EmailJS) — unchanged behavior
   ───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof emailjs === 'undefined') return;
  emailjs.init('eXZW_cUfs6X9opAaK');

  const form = document.querySelector('#contact-form');
  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = {
      from_name: document.getElementById('name').value,
      from_email: document.getElementById('email').value,
      message: document.getElementById('message').value,
      to_name: 'Arbaaz Khan',
    };
    const submitButton = form.querySelector('.submit-btn');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';

    emailjs.send('service_0ji8ryh', 'template_2u9zmlw', formData)
      .then(() => {
        const popup = document.getElementById('successPopup');
        popup.classList.add('show');
        setTimeout(() => popup.classList.remove('show'), 3000);
        form.reset();
      })
      .catch((error) => {
        console.error('FAILED…', error);
        alert('Failed to send message. Please try again.');
      })
      .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      });
  });
});
