function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({
        behavior: "smooth"
    });

    // update the URL hash without jumping
    if (history.pushState) {
        history.pushState(null, '', '#' + id);
    } else {
        // fallback
        location.hash = id;
    }
}

const questions = document.querySelectorAll(".faq-question");

questions.forEach(btn => {
    const answer = btn.nextElementSibling;
    if (!answer) return;
    // initialize accessible state
    btn.setAttribute('aria-expanded', 'false');
    answer.classList.remove('open');

    btn.addEventListener("click", () => {
        const opened = answer.classList.toggle('open');
        btn.setAttribute('aria-expanded', opened ? 'true' : 'false');
        if (opened) {
            // ensure the revealed content is visible in viewport
            answer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
});

// New: attach smooth scroll behavior to all internal links and optional buttons
document.addEventListener('DOMContentLoaded', () => {
    // handle <a href="#section"> links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            // If href is exactly "#" (no target), allow default
            const href = this.getAttribute('href');
            if (!href || href === '#') return;

            const targetId = href.slice(1);
            if (!targetId) return;

            e.preventDefault();
            scrollToSection(targetId);
        });
    });

    // handle buttons that want to scroll using data-scroll="id"
    document.querySelectorAll('button[data-scroll]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-scroll');
            if (id) scrollToSection(id);
        });
    });

    // Reviews carousel (one screenshot visible, arrows to navigate)
    const carousel = document.querySelector('.review-carousel');
    if (carousel) {
        const track = carousel.querySelector('.carousel-track');
        const slides = Array.from(track.querySelectorAll('.carousel-slide'));
        const prevBtn = carousel.querySelector('.carousel-btn.prev');
        const nextBtn = carousel.querySelector('.carousel-btn.next');
        const dotsContainer = carousel.querySelector('.carousel-dots');
        let index = 0;
        const dots = [];

        // create dots
        if (dotsContainer) {
            slides.forEach((_, i) => {
                const d = document.createElement('button');
                d.className = 'carousel-dot';
                d.setAttribute('aria-label', `Slide ${i + 1}`);
                d.addEventListener('click', () => {
                    index = i;
                    updateCarousel();
                });
                dotsContainer.appendChild(d);
                dots.push(d);
            });
        }

        function updateCarousel() {
            track.style.transform = `translateX(-${index * 100}%)`;
            if (dots.length) {
                dots.forEach((d, i) => {
                    if (i === index) {
                        d.classList.add('active');
                        d.setAttribute('aria-current', 'true');
                    } else {
                        d.classList.remove('active');
                        d.removeAttribute('aria-current');
                    }
                });
            }
        }

        prevBtn && prevBtn.addEventListener('click', () => {
            index = (index - 1 + slides.length) % slides.length;
            updateCarousel();
        });

        nextBtn && nextBtn.addEventListener('click', () => {
            index = (index + 1) % slides.length;
            updateCarousel();
        });

        // keyboard navigation
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prevBtn && prevBtn.click();
            if (e.key === 'ArrowRight') nextBtn && nextBtn.click();
        });

        // ensure starting position
        updateCarousel();
    }
});

// --- Back to Top Button Logic ---
(function() {
    const btn = document.getElementById('backToTopBtn');
    if (!btn) return;
    let hideTimeout = null;
    let lastScrollY = window.scrollY;
    let ticking = false;

    function showBtn() {
        btn.classList.add('show');
    }
    function hideBtn() {
        btn.classList.remove('show');
    }
    function handleScroll() {
        if (window.scrollY > window.innerHeight / 2) {
            showBtn();
            if (hideTimeout) clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                hideBtn();
            }, 2000);
        } else {
            hideBtn();
        }
    }
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        } else {
            // still schedule hide
            if (window.scrollY > window.innerHeight / 2) {
                if (hideTimeout) clearTimeout(hideTimeout);
                hideTimeout = setTimeout(() => {
                    hideBtn();
                }, 2000);
            }
        }
    });
    // Show on any scroll after hidden
    window.addEventListener('scroll', () => {
        if (window.scrollY > window.innerHeight / 2) {
            showBtn();
        }
    }, { passive: true });
    // Hide on click and scroll to top
    btn.addEventListener('click', () => {
        hideBtn();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    // Hide if at top after scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY <= 10) {
            hideBtn();
        }
    }, { passive: true });

    // ensure correct initial state
    if (window.scrollY <= 10) {
        hideBtn();
    }
})();