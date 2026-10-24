/* =========================================
   LOADING SCREEN LOGIC
   ========================================= */
(function () {
    const loader   = document.getElementById('loader');
    const countEl  = document.getElementById('loaderCount');

    if (!loader) return;

    // Lock scroll while loading
    document.body.classList.add('loading');

    // Animate counter 0 → 100 over ~2.2s
    let progress = 0;
    const duration = 2200; // ms
    const interval = 22;   // ms per tick
    const step     = 100 / (duration / interval);

    const ticker = setInterval(() => {
        progress = Math.min(progress + step, 100);
        const rounded = Math.floor(progress);
        const text    = rounded + '%';

        // Update visible text AND data-text attribute (used by glitch ::before/::after)
        countEl.textContent          = text;
        countEl.dataset.text         = text;

        if (progress >= 100) {
            clearInterval(ticker);
            // Brief pause, then slide the loader up and out
            setTimeout(() => {
                loader.classList.add('done');
                document.body.classList.remove('loading');
                loader.addEventListener('transitionend', () => loader.remove(), { once: true });
            }, 380);
        }
    }, interval);
})();

document.addEventListener('DOMContentLoaded', () => {

    // Custom Cursor Logic
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    const links = document.querySelectorAll('a');

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Move the main tiny cursor immediately
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
    });

    // Smooth follow effect for the outer circle
    function animate() {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        
        cursorFollower.style.left = `${followerX}px`;
        cursorFollower.style.top = `${followerY}px`;
        
        requestAnimationFrame(animate);
    }
    animate();

    // Add hover states to all links
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            cursorFollower.classList.add('hover');
        });
        
        link.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            cursorFollower.classList.remove('hover');
        });
    });

    // Duplicate marquee content for seamless infinite loop
    const marquee = document.querySelector('.marquee');
    if (marquee) {
        const content = marquee.innerHTML;
        marquee.innerHTML = content + content; // duplicate span
    }

    // Enhanced Drag-and-Scroll Infinite Sliders
    const imageTracks = document.querySelectorAll('.image-track');
    
    imageTracks.forEach(track => {
        // Duplicate content for seamless loop
        const content = track.innerHTML;
        track.innerHTML = content + content;
        
        // Remove CSS animation to take over via JS
        track.style.animation = 'none';
        
        const parent = track.parentElement;
        parent.style.cursor = 'grab';
        
        let isDown = false;
        let startX;
        let currentX = 0;
        
        // Determine speed and direction
        let speed = track.classList.contains('reverse-track') ? 1 : -1;
        const inlineStyle = track.getAttribute('style') || '';
        if (inlineStyle.includes('60s')) {
            speed *= 0.6;
        }

        const animateTrack = () => {
            if (!isDown) {
                currentX += speed;
            }
            
            const halfWidth = track.scrollWidth / 2;
            
            // Seamless looping bounds
            if (currentX <= -halfWidth) {
                currentX += halfWidth;
            } else if (currentX >= 0 && speed > 0) {
                currentX -= halfWidth;
            } else if (currentX >= 0 && speed < 0) {
                // If dragged right past 0
                if(currentX > 0) {
                     currentX -= halfWidth;
                }
            }
            
            track.style.transform = `translateX(${currentX}px)`;
            requestAnimationFrame(animateTrack);
        };
        
        requestAnimationFrame(animateTrack);

        // Drag Events
        parent.addEventListener('mousedown', (e) => {
            isDown = true;
            parent.style.cursor = 'grabbing';
            startX = e.pageX;
            e.preventDefault(); // Prevents default browser behaviors like image drag
            // Cancel transition if we had any (not using transition here, but good practice)
        });
        
        parent.addEventListener('mouseleave', () => {
            isDown = false;
            parent.style.cursor = 'grab';
        });
        
        parent.addEventListener('mouseup', () => {
            isDown = false;
            parent.style.cursor = 'grab';
        });
        
        parent.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX;
            const walk = (x - startX) * 1.5;
            currentX += walk;
            startX = x;
        });
    });

    // Sticky Nav Blur and Parallax
    const nav = document.querySelector('.nav');
    const heroGraphic = document.querySelector('.hero-graphic');
    const heroDesigner = document.querySelector('.hero-designer');
    const heroHeadWrapper = document.querySelector('.hero-head-wrapper');
    const heroGlow = document.querySelector('.hero-glow');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        // Nav Blur
        if (scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Hero Parallax Effects (only compute while hero is somewhat visible)
        if (scrollY <= window.innerHeight) {
            const isMobile = window.innerWidth <= 767;

            if (isMobile) {
                // Mobile: Hero is in natural document flow; gentle opacity fade only (no transform shifts)
                const fadeOpacity = Math.max(0, 1 - (scrollY * 0.003));
                if (heroGraphic) { heroGraphic.style.opacity = fadeOpacity; heroGraphic.style.transform = ''; }
                if (heroDesigner) { heroDesigner.style.opacity = fadeOpacity; heroDesigner.style.transform = ''; }
                if (heroHeadWrapper) { heroHeadWrapper.style.opacity = fadeOpacity; heroHeadWrapper.style.transform = ''; }
                if (heroGlow) { heroGlow.style.transform = ''; }
            } else {
                // Desktop: Original horizontal split and depth scaling (100% untouched)
                if (heroGraphic) {
                    heroGraphic.style.transform = `translate(${scrollY * -0.5}px, -2vh) scale(${1 - scrollY * 0.0005})`;
                    heroGraphic.style.opacity = 1 - (scrollY * 0.0015);
                }
                if (heroDesigner) {
                    heroDesigner.style.transform = `translate(${scrollY * 0.5}px, 2vh) scale(${1 - scrollY * 0.0005})`;
                    heroDesigner.style.opacity = 1 - (scrollY * 0.0015);
                }
                if (heroHeadWrapper) {
                    heroHeadWrapper.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.3}px)) scale(${1 + scrollY * 0.001})`;
                    heroHeadWrapper.style.opacity = 1 - (scrollY * 0.001);
                }
                if (heroGlow) {
                    heroGlow.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.6}px))`;
                }
            }
        }
    });

    // Reset hero inline styles on resize to prevent desktop/mobile transform clashes
    window.addEventListener('resize', () => {
        if (window.scrollY === 0) {
            if (heroGraphic) { heroGraphic.style.transform = ''; heroGraphic.style.opacity = ''; }
            if (heroDesigner) { heroDesigner.style.transform = ''; heroDesigner.style.opacity = ''; }
            if (heroHeadWrapper) { heroHeadWrapper.style.transform = ''; heroHeadWrapper.style.opacity = ''; }
            if (heroGlow) { heroGlow.style.transform = ''; }
        }
    });

    // Scroll Reveal Animation (Framer Motion style)
    const fadeElements = document.querySelectorAll('.fade-up');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => scrollObserver.observe(el));

    // Sticky Glassmorphism Bar Visibility Logic
    // Show only in middle content; fade out on main screen (hero) and at footer on BOTH desktop & mobile
    const stickyBar = document.querySelector('.sticky-glass-wrapper');
    const footerSection = document.querySelector('.geometric-footer');

    if (stickyBar) {
        const updateStickyBar = () => {
            const scrollY = window.scrollY;
            const pastHero = scrollY > (window.innerHeight * 0.35);

            let footerVisible = false;
            if (footerSection) {
                const footerRect = footerSection.getBoundingClientRect();
                footerVisible = footerRect.top < (window.innerHeight - 80);
            }

            if (pastHero && !footerVisible) {
                stickyBar.classList.remove('hidden-bar');
            } else {
                stickyBar.classList.add('hidden-bar');
            }
        };

        window.addEventListener('scroll', updateStickyBar, { passive: true });
        window.addEventListener('resize', updateStickyBar, { passive: true });
        updateStickyBar();
    }

    // Mobile Hamburger Menu Logic
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');

    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileNav.classList.toggle('open');
            
            // Lock/unlock body scroll
            if (mobileNav.classList.contains('open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking a nav link
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileNav.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // Touch Device — Disable Custom Cursor
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouchDevice && cursor && cursorFollower) {
        cursor.style.display = 'none';
        cursorFollower.style.display = 'none';
        document.documentElement.style.cursor = 'auto';
    }
});
