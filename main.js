/* ═══════════════════════════════════════════
   VLTX — main.js
═══════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── Age Gate ─────────────────────────────────── */
  const ageGate  = document.getElementById('ageGate');
  const ageYes   = document.getElementById('ageYes');
  const ageNo    = document.getElementById('ageNo');

  if (sessionStorage.getItem('age_verified')) {
    ageGate.classList.add('hidden');
  }

  ageYes.addEventListener('click', () => {
    sessionStorage.setItem('age_verified', '1');
    ageGate.classList.add('hidden');
  });

  ageNo.addEventListener('click', () => { window.location.href = 'https://www.google.com'; });

  /* ─── Navbar ────────────────────────────────────── */
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');

  setTimeout(() => navbar.classList.add('visible'), 400);

  hamburger.addEventListener('click',   () => mobileMenu.classList.add('open'));
  mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
  document.querySelectorAll('.mobile-link').forEach(l =>
    l.addEventListener('click', () => mobileMenu.classList.remove('open'))
  );

  /* ═══════════════════════════════════════════════════
     STOP-SCROLL VIDEO ENGINE
     ─────────────────────────────────────────────────
     The hero is exactly 100svh — no spacer below it.
     Wheel and touch events are intercepted while the
     hero is at the top of the viewport (scrollY ≈ 0).
     Each intercepted event scrubs video.currentTime.
     When the video reaches the last frame the intercept
     is removed and normal page scroll resumes.
     Scrolling back up to the hero re-enters scrub mode.
  ═══════════════════════════════════════════════════ */
  const video      = document.getElementById('heroVideo');
  const hero       = document.getElementById('hero');
  const scrollHint = document.getElementById('scrollHint');

  const SENSITIVITY    = 0.012;  // seconds per px of scroll delta
  const LOCK_THRESHOLD = 8;      // px from top before intercepting
  const FREEZE_OFFSET  = 5 / 30; // stop 5 frames (~0.17s) before the very last frame

  let duration   = 0;
  let videoReady = false;
  let touchLastY = 0;

  /* ── Helpers ───────────────────────────────────── */
  function heroIsActive() {
    return window.scrollY <= hero.offsetTop + LOCK_THRESHOLD;
  }

  function shouldIntercept(deltaY) {
    if (!videoReady || !heroIsActive()) return false;
    const freezeAt = duration - FREEZE_OFFSET;
    // At the freeze frame scrolling down → release, page scrolls to next section
    if (video.currentTime >= freezeAt && deltaY > 0) return false;
    // At the very start scrolling up → release, page scrolls up freely
    if (video.currentTime <= 0 && deltaY < 0) return false;
    return true;
  }

  function scrub(delta) {
    const freezeAt = duration - FREEZE_OFFSET;
    const newTime  = Math.max(0, Math.min(freezeAt, video.currentTime + delta * SENSITIVITY));
    video.currentTime = newTime;

    // Fade scroll hint as soon as user starts scrolling down
    if (delta > 0) scrollHint.style.opacity = Math.max(0, 1 - newTime / 0.4) + '';
  }

  /* ── Wheel ─────────────────────────────────────── */
  window.addEventListener('wheel', (e) => {
    if (!shouldIntercept(e.deltaY)) return;
    e.preventDefault();

    // Show progress bar on first scroll
    progressWrap.classList.add('visible');

    scrub(e.deltaY);
  }, { passive: false });

  /* ── Touch ─────────────────────────────────────── */
  window.addEventListener('touchstart', (e) => {
    touchLastY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    const delta = touchLastY - e.touches[0].clientY; // +ve = swipe up = scroll down
    touchLastY = e.touches[0].clientY;

    if (!shouldIntercept(delta)) return;
    e.preventDefault();

    progressWrap.classList.add('visible');
    scrub(delta);
  }, { passive: false });

  /* ── Mobile hero height ─────────────────────────── */
  // Must match --nav-clear: 14px (top) + 48px (height) + 14px (gap) = 76px
  const NAV_CLEAR = 76;

  function fitMobileHero() {
    if (window.innerWidth > 768) {
      hero.style.height = '';   // restore CSS default (100svh) on desktop
      return;
    }
    if (!video.videoWidth || !video.videoHeight) return;

    const vw    = window.innerWidth;
    const vh    = window.innerHeight;
    const ratio = video.videoWidth / video.videoHeight;

    // Height the video renders at (object-fit: contain, fills full width)
    let renderedH = vw / ratio;
    if (renderedH > vh - NAV_CLEAR) renderedH = vh - NAV_CLEAR;

    // Hero height = nav clearance + rendered video height (no black gaps)
    hero.style.height = (NAV_CLEAR + renderedH) + 'px';
  }

  /* ── Video load ────────────────────────────────── */
  function initVideo() {
    video.pause();
    video.loop     = false;
    video.autoplay = false;
    video.currentTime = 0;
    video.load();

    function onReady() {
      if (!isFinite(video.duration) || video.duration === 0) return;
      duration   = video.duration;
      videoReady = true;
      fitMobileHero();
    }

    if (video.readyState >= 1 && isFinite(video.duration) && video.duration > 0) {
      onReady();
    } else {
      video.addEventListener('loadedmetadata', onReady, { once: true });
      video.addEventListener('durationchange', () => { if (!videoReady) onReady(); });
    }
  }

  initVideo();

  /* ── Resize / orientation ────────────────────────── */
  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitMobileHero, 120);
  };
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onResize);
  } else {
    window.addEventListener('resize', onResize);
  }
  window.addEventListener('orientationchange', () => setTimeout(fitMobileHero, 300));

  /* ═══════════════════════════════════════════════════
     SCROLL REVEAL — Intersection Observer
  ═══════════════════════════════════════════════════ */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = parseInt(entry.target.dataset.delay || '0', 10);
      setTimeout(() => entry.target.classList.add('revealed'), delay);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.feature-card')
    .forEach(el => io.observe(el));

  /* ═══════════════════════════════════════════════════
     BEST SELLERS CAROUSEL
  ═══════════════════════════════════════════════════ */
  const carousel     = document.getElementById('carousel');
  const carouselPrev = document.getElementById('carouselPrev');
  const carouselNext = document.getElementById('carouselNext');
  const dotsWrap     = document.getElementById('carouselDots');
  const cards        = carousel ? [...carousel.querySelectorAll('.product-card')] : [];
  let carouselIndex  = 0;

  cards.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goToCard(i));
    dotsWrap.appendChild(d);
  });

  function goToCard(idx) {
    carouselIndex = Math.max(0, Math.min(cards.length - 1, idx));
    carousel.scrollTo({ left: cards[carouselIndex].offsetLeft, behavior: 'smooth' });
    dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) =>
      d.classList.toggle('active', i === carouselIndex)
    );
  }

  carouselPrev?.addEventListener('click', () => goToCard(carouselIndex - 1));
  carouselNext?.addEventListener('click', () => goToCard(carouselIndex + 1));

  carousel?.addEventListener('scroll', () => {
    if (!cards.length) return;
    const cardW = cards[0].offsetWidth + 20;
    const idx = Math.round(carousel.scrollLeft / cardW);
    if (idx !== carouselIndex) {
      carouselIndex = idx;
      dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) =>
        d.classList.toggle('active', i === carouselIndex)
      );
    }
  }, { passive: true });

  /* ═══════════════════════════════════════════════════
     TESTIMONIALS SLIDER
  ═══════════════════════════════════════════════════ */
  const track      = document.getElementById('testimonialTrack');
  const tDotsWrap  = document.getElementById('tDots');
  const tItems     = track ? [...track.querySelectorAll('.testimonial-card')] : [];
  let tIndex = 0, tAutoplay;

  tItems.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 't-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goToTestimonial(i));
    tDotsWrap.appendChild(d);
  });

  function goToTestimonial(idx) {
    tIndex = ((idx % tItems.length) + tItems.length) % tItems.length;
    if (track) track.style.transform = `translateX(calc(-${tIndex * 100}% - ${tIndex * 24}px))`;
    tDotsWrap.querySelectorAll('.t-dot').forEach((d, i) =>
      d.classList.toggle('active', i === tIndex)
    );
    clearInterval(tAutoplay);
    tAutoplay = setInterval(() => goToTestimonial(tIndex + 1), 5000);
  }

  document.getElementById('tPrev')?.addEventListener('click', () => goToTestimonial(tIndex - 1));
  document.getElementById('tNext')?.addEventListener('click', () => goToTestimonial(tIndex + 1));
  tAutoplay = setInterval(() => goToTestimonial(tIndex + 1), 5000);


  /* ─── Smooth anchor scroll ──────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });


})();
