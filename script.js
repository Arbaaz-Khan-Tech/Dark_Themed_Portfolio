document.addEventListener('DOMContentLoaded', () => {
    const navLogo = document.querySelector('.nav-logo');
    const mobileMenu = document.querySelector('.mobile-menu');
    const body = document.body;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.classList.add('mobile-menu-overlay');
    body.appendChild(overlay);

    // Toggle menu function
    const toggleMenu = () => {
        console.log('Toggle menu called'); // Debug log
        mobileMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    };

    // Event listener for AR button
    navLogo.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Button clicked'); // Debug log
        if (window.innerWidth <= 768) {
            toggleMenu();
        }
    });

    // Close menu when clicking overlay
    overlay.addEventListener('click', toggleMenu);

    // Close menu when clicking menu items
    const menuItems = document.querySelectorAll('.mobile-nav-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            toggleMenu();
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            toggleMenu();
        }
    });

    // Add this to your existing script.js
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.counter');
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-target'));
                    let count = 0;
                    const updateCount = () => {
                        const increment = target / 30; // Adjust speed here
                        if (count < target) {
                            count += increment;
                            counter.innerText = Math.ceil(count);
                            setTimeout(updateCount, 50);
                        } else {
                            counter.innerText = target;
                        }
                    };
                    updateCount();
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Start observing the stats container
    const statsContainer = document.querySelector('.stats-container');
    if (statsContainer) {
        counterObserver.observe(statsContainer);
    }
}); 






document.addEventListener('DOMContentLoaded', function() {
    // Tab Navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');
            
            // Add active class to corresponding pane
            const targetPane = document.querySelector(`#${btn.dataset.tab}`);
        
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });

    // Achievements Carousel
    const achievements = document.querySelectorAll('.achievement-item');
    let currentIndex = 0;

    function updateActiveAchievement() {
        achievements.forEach(item => item.classList.remove('active'));
        achievements[currentIndex].classList.add('active');
        
        currentIndex = (currentIndex + 1) % achievements.length;
    }

    // Initial activation
    updateActiveAchievement();

    // Update active achievement every 6 seconds
    setInterval(updateActiveAchievement, 6000);
});




// Initialize EmailJS with your User ID
emailjs.init('eXZW_cUfs6X9opAaK');

// Handle form submission
const form = document.querySelector('#contact-form');
const successPopup = document.querySelector('#successPopup');

form.addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = {
        from_name: document.getElementById('name').value,
        from_email: document.getElementById('email').value,
        message: document.getElementById('message').value,
        to_name: 'Arbaaz',
    };

    const submitButton = form.querySelector('.submit-btn');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = '$ sending_message...';

    emailjs
        .send(
            'service_0ji8ryh',
            'template_2u9zmlw',
            formData
        )
        .then((response) => {
            console.log('SUCCESS!', response.status, response.text);
            successPopup.classList.add('active');
            form.reset();
            
            // Auto close popup after 2 seconds
            setTimeout(() => {
                successPopup.classList.remove('active');
            }, 2000);
        })
        .catch((error) => {
            console.error('FAILED...', error);
            alert('Failed to send message. Please try again.');
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        });
});

// Add this to your existing script.js
function updateTime() {
    const timeElement = document.getElementById('current-time');
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    timeElement.textContent = time;
}

// Update time every second
setInterval(updateTime, 1000);
updateTime(); // Initial call

// Theme toggle functionality (if needed)
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', function() {
    this.classList.toggle('active');
    // Add your theme switching logic here
});

// Matrix Cursor Trail Effect
