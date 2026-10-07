// ============================================
// FL STUDIO FLEX - LANDING PAGE
// JavaScript para interactividad
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar todos los módulos
    initMobileMenu();
    initScrollAnimations();
    initNavbarScroll();
    initSmoothScroll();
    initGalleryHover();
});

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');

    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active', isOpen);
        menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Cerrar menú al hacer clic en un enlace
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// ============================================
// SCROLL ANIMATIONS
// Las tarjetas de las franjas no se animan al aparecer: su fila ya se
// desplaza sola, así que la entrada desde abajo competiría con el bucle (RF-20)
// ============================================
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.section-title, .section-subtitle, .feature-card, .gallery-item, .download-content'
    );

    animatedElements.forEach(el => {
        el.classList.add('animate-on-scroll');
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
}

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.9)';
            navbar.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Enlaces sin destino (# o vacíos): evitar el salto sin lanzar error
            if (!href || href === '#') {
                e.preventDefault();
                return;
            }

            let target = null;
            try {
                target = document.querySelector(href);
            } catch (err) {
                return; // Selector inválido: no hacer nada
            }

            if (target) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// GALLERY HOVER EFFECTS
// ============================================
function initGalleryHover() {
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.zIndex = '10';
        });

        item.addEventListener('mouseleave', () => {
            item.style.zIndex = '1';
        });
    });
}

// ============================================
// TYPING EFFECT (opcional para el futuro)
// ============================================
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// ============================================
// COUNTER ANIMATION
// ============================================
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);

    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    }

    updateCounter();
}
