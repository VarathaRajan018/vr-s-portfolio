import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initThreeBg, handleThreeScroll } from './three-bg.js';
import { initTypingAnimation } from './typing.js';

// Register ScrollTrigger in GSAP
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize WebGL Scene
  initThreeBg();

  // 2. Initialize Typing Rotator Animation
  initTypingAnimation();

  // 3. Initialize Smooth Scrolling via Lenis
  const lenis = initSmoothScroll();

  // 4. Custom Follower Cursor
  initCustomCursor();

  // 5. 3D Tilt Card Effects
  init3DTilt();

  // 6. Magnetic Element Hover triggers
  initMagneticButtons();

  // 7. Side scrolling Projects Pin-Carousel (Desktop-Only)
  initHorizontalScroll();

  // 8. Stats Counter Up triggering
  initStatsCountUp();

  // 9. Vertical timeline progress and item highlights
  initTimelineProgress();

  // 10. Core scroll animation reveals
  initScrollReveals();

  // 11. Navigation active link update & navbar height shrink
  initNavbarScroll();
  initActiveNavTracking();
  initScrollProgressBar();

  // 12. Contact Form Interactivity
  initContactForm();

  // 13. Mobile Menu Overlay Toggle
  initMobileMenu();
});

/* ==========================================================================
   Smooth Scrolling (Lenis + GSAP Link)
   ========================================================================== */
function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    orientation: 'vertical',
    gestureOrientation: 'vertical'
  });

  // Link scroll updates to ScrollTrigger
  lenis.on('scroll', (e) => {
    ScrollTrigger.update();
    handleThreeScroll(e.scroll);
  });

  // GSAP custom ticker synchronization
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Bind navigation links to scroll smoothly
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        lenis.scrollTo(targetElement, {
          offset: -80, // navbar height gap offset
          duration: 1.2
        });
      }
    });
  });

  return lenis;
}

/* ==========================================================================
   Custom Blending Follower Cursor
   ========================================================================== */
function initCustomCursor() {
  const dot = document.querySelector('.cursor-dot');
  const glow = document.querySelector('.cursor-glow');
  if (!dot || !glow) return;

  // Track coordinates
  window.addEventListener('mousemove', (e) => {
    const { clientX: x, clientY: y } = e;

    // Instant small dot move
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;

    // Smooth delay follow for the background glow
    gsap.to(glow, {
      x: x,
      y: y,
      duration: 0.25,
      ease: "power2.out"
    });
  });

  // Expand cursor on hovering interactive items
  const interactives = document.querySelectorAll('a, button, .btn, .skill-item, .project-card, .stat-card, .achievement-card, .form-input, .social-btn');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('hovered-interactive');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('hovered-interactive');
    });
  });
}

/* ==========================================================================
   3D Tilt Card Component Mechanism
   ========================================================================== */
function init3DTilt() {
  const cards = document.querySelectorAll('.card-tilt, .floating-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Tilts up to 10 degrees in pitch and roll
      const rotateX = ((centerY - y) / centerY) * 10;
      const rotateY = ((x - centerX) / centerX) * 10;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 1000,
        ease: "power1.out",
        duration: 0.35
      });

      // Update glossy refraction shine coordinate position
      const shine = card.querySelector('.card-glass-shine');
      if (shine) {
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        shine.style.background = `linear-gradient(${135 + rotateY * 1.5}deg, rgba(255,255,255,${0.12 - (percentY * 0.0008)}) 0%, rgba(255,255,255,0) 65%, rgba(0,0,0,0.15) 100%)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        ease: "power2.out",
        duration: 0.6
      });
      const shine = card.querySelector('.card-glass-shine');
      if (shine) {
        shine.style.background = `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.15) 100%)`;
      }
    });
  });
}

/* ==========================================================================
   Magnetic Component Pulling
   ========================================================================== */
function initMagneticButtons() {
  const magnetics = document.querySelectorAll('.magnetic');

  magnetics.forEach(btn => {
    const strength = btn.dataset.strength ? parseFloat(btn.dataset.strength) : 20;

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Move element slightly toward cursor coordinates
      gsap.to(btn, {
        x: x * (strength / 100),
        y: y * (strength / 100),
        duration: 0.35,
        ease: "power2.out"
      });
    });

    btn.addEventListener('mouseleave', () => {
      // Elastic spring-back animation
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1.1, 0.4)"
      });
    });
  });
}

/* ==========================================================================
   Horizontal Scroll Projects Slider (GSAP Pinning)
   ========================================================================== */
function initHorizontalScroll() {
  const pinSection = document.querySelector('.projects-section-horizontal-pin');
  const container = document.querySelector('.horizontal-scroll-container');
  if (!pinSection || !container) return;

  let scrollTween;

  function setupScroll() {
    // Only pin on screens above tablet sizing (992px)
    if (window.innerWidth > 992) {
      const totalWidth = container.offsetWidth - window.innerWidth;
      
      scrollTween = gsap.to(container, {
        x: -totalWidth,
        ease: "none",
        scrollTrigger: {
          trigger: pinSection,
          pin: true,
          scrub: 0.9,
          start: "top top",
          end: () => `+=${container.offsetWidth}`,
          invalidateOnRefresh: true
        }
      });
    } else {
      // Clean up for mobile layout
      if (scrollTween) {
        scrollTween.scrollTrigger.kill(true);
        scrollTween.kill();
        gsap.set(container, { clearProps: "all" });
      }
    }
  }

  // Initial setup and responsive tracking
  setupScroll();
  
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(setupScroll, 150);
  });
}

/* ==========================================================================
   Stats Count Up Numerical values
   ========================================================================== */
function initStatsCountUp() {
  const stats = document.querySelectorAll('.stat-number');

  stats.forEach(stat => {
    const target = parseInt(stat.dataset.target, 10);

    ScrollTrigger.create({
      trigger: stat,
      start: "top 88%",
      onEnter: () => {
        const valueObj = { val: 0 };
        gsap.to(valueObj, {
          val: target,
          duration: 2.0,
          ease: "power3.out",
          onUpdate: () => {
            // formatting outputs
            if (target === 2027) {
              stat.textContent = Math.floor(valueObj.val).toString();
            } else if (target === 1) {
              stat.textContent = Math.floor(valueObj.val).toString();
            } else {
              stat.textContent = Math.floor(valueObj.val) + "+";
            }
          }
        });
      },
      once: true
    });
  });
}

/* ==========================================================================
   Vertical Timeline scrolling light-trail indicator
   ========================================================================== */
function initTimelineProgress() {
  const timeline = document.querySelector('.timeline-container');
  const progressLine = document.querySelector('.timeline-trail-progress');
  const items = document.querySelectorAll('.timeline-item');
  if (!timeline || !progressLine) return;

  // Animate the timeline height from 0% to 100% on scroll
  gsap.to(progressLine, {
    height: "100%",
    ease: "none",
    scrollTrigger: {
      trigger: timeline,
      start: "top 35%",
      end: "bottom 70%",
      scrub: true
    }
  });

  // Activate timeline milestones on scroll entry
  items.forEach(item => {
    ScrollTrigger.create({
      trigger: item,
      start: "top 62%",
      onEnter: () => item.classList.add('active'),
      onLeaveBack: () => item.classList.remove('active')
    });
  });
}

/* ==========================================================================
   Universal Scroll Reveal Animations
   ========================================================================== */
function initScrollReveals() {
  const reveals = document.querySelectorAll('.section-header, .about-text-content, .skill-category-card, .achievement-card, .contact-details, .contact-form-wrapper');

  reveals.forEach(el => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 1.0,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none reverse"
      }
    });
  });

  const aboutImg = document.querySelector('.about-image-wrapper');
  if (aboutImg) {
    gsap.from(aboutImg, {
      scale: 0.94,
      opacity: 0,
      duration: 1.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: aboutImg,
        start: "top 82%"
      }
    });
  }
}

/* ==========================================================================
   Navbar & Progress Utilities
   ========================================================================== */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('navbar-scrolled');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }
  });
}

function initActiveNavTracking() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 120; // navbar buffer offset

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').slice(1) === current) {
        link.classList.add('active');
      }
    });
  });
}

function initScrollProgressBar() {
  const progressBar = document.querySelector('.scroll-progress-bar');
  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const percent = (window.scrollY / totalHeight) * 100;
      progressBar.style.width = `${percent}%`;
    }
  });
}

/* ==========================================================================
   Contact Form Validation & Glowing Animations
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('portfolio-contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('.form-submit-btn');
    const nameVal = document.getElementById('name').value;
    
    // Add success trigger loading/feedback state animations
    const originalText = submitBtn.querySelector('span').textContent;
    submitBtn.querySelector('span').textContent = 'Sending...';
    submitBtn.style.pointerEvents = 'none';

    setTimeout(() => {
      // Success feedback reveal
      submitBtn.querySelector('span').textContent = 'Message Sent!';
      submitBtn.style.background = 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-sky) 100%)';
      submitBtn.style.boxShadow = '0 0 20px rgba(6, 182, 212, 0.5)';
      
      // Reset form fields
      form.reset();

      setTimeout(() => {
        submitBtn.querySelector('span').textContent = originalText;
        submitBtn.style.background = '';
        submitBtn.style.boxShadow = '';
        submitBtn.style.pointerEvents = '';
      }, 3000);

    }, 1500);
  });
}

/* ==========================================================================
   Mobile Menu Overlay Animation & Toggle
   ========================================================================== */
function initMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const overlay = document.querySelector('.mobile-menu-overlay');
  const links = document.querySelectorAll('.mobile-nav-link');
  if (!btn || !overlay) return;

  let menuOpen = false;

  btn.addEventListener('click', () => {
    menuOpen = !menuOpen;
    btn.classList.toggle('active');
    overlay.classList.toggle('active');

    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      // Fade and slide in links smoothly
      gsap.to(links, {
        opacity: 1,
        y: 0,
        stagger: 0.08,
        duration: 0.45,
        ease: "power2.out",
        delay: 0.15
      });
    } else {
      document.body.style.overflow = '';
      gsap.to(links, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: "power2.in"
      });
    }
  });

  // Close menu and restore body scrolling when a link is clicked
  links.forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false;
      btn.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      gsap.to(links, {
        opacity: 0,
        y: 20,
        duration: 0.3
      });
    });
  });
}
