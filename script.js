document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Hamburger menu toggle
    hamburger.addEventListener('click', () => {
        navbar.classList.toggle('active');
    });

    // Navigation active state
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            navbar.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && navbar.classList.contains('active')) {
            navbar.classList.remove('active');
        }
    });

    // Typewriter effect
    const typewriter = document.getElementById('typewriter');
    const roles = [
        'Cybersecurity Enthusiast',
        'Ethical Hacker',
        'Web Developer'
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            typewriter.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typewriter.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentRole.length) {
            isDeleting = true;
            typingSpeed = 1000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typingSpeed = 500;
        }

        setTimeout(type, typingSpeed);
    }

    type();
});


document.addEventListener('DOMContentLoaded', () => {
    const socialContainer = document.querySelector('.social-container');
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop) {
            // Scrolling down
            socialContainer.classList.add('hidden');
        } else {
            // Scrolling up
            socialContainer.classList.remove('hidden');
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, false);
});






















// ----------------------------------------------projects------------------------------------------

// document.addEventListener('DOMContentLoaded', () => {
//     const projectsGrid = document.querySelector('.projects-grid');
//     const prevBtn = document.querySelector('.project-nav.prev');
//     const nextBtn = document.querySelector('.project-nav.next');
//     const dots = document.querySelectorAll('.dot');
//     const cards = document.querySelectorAll('.project-card');
    
//     let currentIndex = 0;
//     const cardsPerView = window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;
//     const totalSlides = Math.ceil(cards.length / cardsPerView);

//     // Update dots
//     const updateDots = (index) => {
//         dots.forEach((dot, i) => {
//             dot.classList.toggle('active', i === index);
//         });
//     };

//     // Scroll to index
//     const scrollToIndex = (index) => {
//         const cardWidth = cards[0].offsetWidth + 32; // Including gap
//         projectsGrid.scrollTo({
//             left: index * cardWidth * cardsPerView,
//             behavior: 'smooth'
//         });
//         currentIndex = index;
//         updateDots(index);
//     };

//     // Next button click
//     nextBtn.addEventListener('click', () => {
//         if (currentIndex < totalSlides - 1) {
//             scrollToIndex(currentIndex + 1);
//         }
//     });

//     // Previous button click
//     prevBtn.addEventListener('click', () => {
//         if (currentIndex > 0) {
//             scrollToIndex(currentIndex - 1);
//         }
//     });

//     // Dot navigation
//     dots.forEach((dot, index) => {
//         dot.addEventListener('click', () => {
//             scrollToIndex(index);
//         });
//     });

//     // Update on scroll
//     let scrollTimeout;
//     projectsGrid.addEventListener('scroll', () => {
//         clearTimeout(scrollTimeout);
//         scrollTimeout = setTimeout(() => {
//             const cardWidth = cards[0].offsetWidth + 32;
//             const index = Math.round(projectsGrid.scrollLeft / (cardWidth * cardsPerView));
//             updateDots(index);
//             currentIndex = index;
//         }, 100);
//     });

//     // Show/hide navigation buttons based on scroll position
//     const updateNavButtons = () => {
//         prevBtn.style.opacity = currentIndex === 0 ? '0' : '1';
//         nextBtn.style.opacity = currentIndex === totalSlides - 1 ? '0' : '1';
//     };

//     updateNavButtons();
//     projectsGrid.addEventListener('scroll', updateNavButtons);
// });





function toggleOverlay(element) {
    const card = element.closest('.project-card');
    const overlay = card.querySelector('.project-overlay');
    overlay.classList.toggle('active');
}


// ----------------------------------------------projects------------------------------------------




// ----------------------------------------------TABBED NAVIGATION------------------------------------------





const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// ----------------------------------------------TABBED NAVIGATION------------------------------------------





// <<<<<<<---------------------------------------  CONTACT FORM-------------------------------------------------------->>>>>





    // Initialize EmailJS with your User ID
    emailjs.init('eXZW_cUfs6X9opAaK'); // Replace 'xtz' with your actual EmailJS User ID

    // Handle form submission
    const form = document.querySelector('#contact-form');
    
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission behavior
    
        // Get form data
        const formData = {
            from_name: document.getElementById('name').value, // Matches {{from_name}} in the template
            from_email: document.getElementById('email').value, // Matches {{from_email}} in the template
            message: document.getElementById('message').value, // Matches {{message}} in the template
            to_name: 'Your Name', // Replace with your name if you want to personalize
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
                console.log('SUCCESS!', response.status, response.text);
               
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

    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Here you would typically handle the form submission to your backend
        
        // Show success popup
        const popup = document.getElementById('successPopup');
        popup.classList.add('show');
        
        // Hide popup after 1 second
        setTimeout(() => {
            popup.classList.remove('show');
        }, 1000);
        
        // Reset form
        this.reset();
    });
    // <<<<<<<---------------------------------------  CONTACT FORM-------------------------------------------------------->>>>>
    





    particlesJS("particles-js", {
        particles: {
            number: {
                value: 80, // Number of particles
                density: { enable: true, value_area: 800 }
            },
            color: { value: ["#2563eb", "#d946ef"] }, // Star colors matching the theme
            shape: {
                type: "circle",
                stroke: { width: 0 }
            },
            opacity: {
                value: 0.7,
                random: true,
                anim: { enable: true, speed: 0.3, opacity_min: 0.2, sync: false }
            },
            size: {
                value: 4, // Larger particles
                random: true,
                anim: { enable: true, speed: 4, size_min: 1, sync: false }
            },
            move: {
                enable: true,
                speed: 2, // Falling speed
                direction: "bottom", // Falling direction
                random: false,
                straight: false,
                out_mode: "out", // Particles disappear after leaving the screen
                bounce: false,
                trail: {
                    enable: true,
                    length: 10, // Trail length
                    fillColor: "#000000" // Trail background color
                }
            },
            line_linked: { enable: false } // No connecting lines
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: false },
                onclick: { enable: false },
                resize: true
            }
        },
        retina_detect: true
    });















    document.addEventListener('DOMContentLoaded', () => {
        const projectCards = document.querySelectorAll('.project-card');
        const projectsSection = document.querySelector('.projects');
    
        // Scroll animation
        function checkScroll() {
            projectCards.forEach(card => {
                const cardTop = card.getBoundingClientRect().top;
                const cardBottom = card.getBoundingClientRect().bottom;
                const windowHeight = window.innerHeight;
    
                if (cardTop < windowHeight && cardBottom > 0) {
                    card.classList.add('visible');
                }
            });
        }
    
        window.addEventListener('scroll', checkScroll);
        checkScroll(); // Check on initial load
    
        // Card expansion
        projectCards.forEach(card => {
            const learnMoreBtn = card.querySelector('.btn-learn-more');
            const closeBtn = card.querySelector('.btn-close');
            const cardDetails = card.querySelector('.card-details');
    
            learnMoreBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                cardDetails.style.display = 'block';
                card.classList.add('expanded');
            });
    
            closeBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                cardDetails.style.display = 'none';
                card.classList.remove('expanded');
            });
        });
    
        // Close expanded card when clicking outside
        document.addEventListener('click', (event) => {
            if (!event.target.closest('.project-card')) {
                projectCards.forEach(card => {
                    const cardDetails = card.querySelector('.card-details');
                    cardDetails.style.display = 'none';
                    card.classList.remove('expanded');
                });
            }
        });
    });

// Counter animation function
function animateCounter(element, target) {
    let current = 0;
    const increment = target > 100 ? 2 : 1;
    const duration = 2000; // 2 seconds
    const steps = Math.ceil(duration / 16);
    const stepValue = target / steps;

    const timer = setInterval(() => {
        current += stepValue;
        if (current >= target) {
            element.textContent = target + (target === 1 ? ' Year+' : '+');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + (target === 1 ? ' Year+' : '+');
        }
    }, 16);
}

// Intersection Observer for triggering counter animation
const observerOptions = {
    threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statItems = entry.target.querySelectorAll('.stat-item');
            statItems.forEach(item => {
                const numberElement = item.querySelector('.stat-number');
                const targetValue = parseInt(item.dataset.target);
                animateCounter(numberElement, targetValue);
            });
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Start observing the stats container
document.addEventListener('DOMContentLoaded', () => {
    const statsContainer = document.querySelector('.stats');
    if (statsContainer) {
        observer.observe(statsContainer);
    }
});

function updateDateTime() {
    const now = new Date();
    
    // Update time with seconds
    const timeElement = document.getElementById('time');
    timeElement.textContent = now.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Update date
    const dateElement = document.getElementById('date');
    dateElement.textContent = now.toLocaleDateString([], {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
    });
}

// Update time every second
setInterval(updateDateTime, 1000);

// Initial update
updateDateTime();