document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav__toggle');
    const navMenu = document.querySelector('.nav__menu');
    const navLinks = document.querySelectorAll('.nav__link');

    // Toggle mobile menu
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        navToggle.setAttribute('aria-expanded', 
            navToggle.classList.contains('active'));
    });

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Project tooltip logic
    const tooltip = document.getElementById('project-tooltip');
    document.querySelectorAll('.project').forEach(project => {
        project.addEventListener('mousemove', e => {
            const desc = project.getAttribute('data-desc');
            tooltip.textContent = desc;
            tooltip.style.display = 'block';
            // Position tooltip above the cursor, but not off the top of the viewport
            const tooltipHeight = tooltip.offsetHeight || 60;
            let top = e.clientY - tooltipHeight - 16;
            if (top < 0) top = e.clientY + 24;
            tooltip.style.left = (e.clientX + 20) + 'px';
            tooltip.style.top = top + 'px';
        });
        project.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    });

    // No JS needed for achievements overlay effect now

    // Initialize EmailJS with your User ID
    emailjs.init('eXZW_cUfs6X9opAaK'); // Replace with your actual EmailJS User ID

    // Handle form submission
    const form = document.querySelector('#contact-form');

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission behavior

        // Get form data
        const formData = {
            from_name: document.getElementById('name').value, // Matches {{from_name}} in the template
            from_email: document.getElementById('email').value, // Matches {{from_email}} in the template
            message: document.getElementById('message').value, // Matches {{message}} in the template
            to_name: 'Arbaaz Khan', // Personalize as needed
        };

        // Display loading state
        const submitButton = form.querySelector('.submit-btn');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        // Send the email using EmailJS
        emailjs
            .send(
                'service_0ji8ryh', // Replace with your EmailJS Service ID
                'template_2u9zmlw', // Replace with your EmailJS Template ID
                formData
            )
            .then((response) => {
                // Show success popup
                const popup = document.getElementById('successPopup');
                popup.classList.add('show');
                setTimeout(() => {
                    popup.classList.remove('show');
                }, 1000);
                form.reset(); // Reset the form
            })
            .catch((error) => {
                console.error('FAILED...', error);
                alert('Failed to send message. Please try again.');
            })
            .finally(() => {
                // Restore button state
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            });
    });
}); 