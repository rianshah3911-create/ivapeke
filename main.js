/* ═══════════════════════════════════════════
   IVAPEKENYA — main.js
═══════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── WhatsApp number — update this with your real number (no + or spaces) ── */
  const WA_NUMBER = '254768208025';

  const IS_DESKTOP = window.innerWidth >= 1025;

  /* ─── Age Gate ─────────────────────────────────── */
  const ageGate  = document.getElementById('ageGate');
  const ageYes   = document.getElementById('ageYes');
  const ageNo    = document.getElementById('ageNo');

  if (ageGate && sessionStorage.getItem('age_verified')) {
    ageGate.classList.add('hidden');
  }
  ageYes?.addEventListener('click', () => {
    sessionStorage.setItem('age_verified', '1');
    ageGate.classList.add('hidden');
  });
  ageNo?.addEventListener('click', () => { window.location.href = 'https://www.google.com'; });

  /* ─── Navbar ────────────────────────────────────── */
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');

  if (navbar) setTimeout(() => navbar.classList.add('visible'), 400);
  hamburger?.addEventListener('click',   () => mobileMenu.classList.add('open'));
  mobileClose?.addEventListener('click', () => mobileMenu.classList.remove('open'));
  document.querySelectorAll('.mobile-link').forEach(l =>
    l.addEventListener('click', () => mobileMenu?.classList.remove('open'))
  );

  /* ═══════════════════════════════════════════════════
     HERO VIDEO
     Desktop (≥1025px): vape-desktop.mp4 — autoplay loop, no stop-scroll
     Mobile: hero.mp4 — stop-scroll scrub engine
  ═══════════════════════════════════════════════════ */
  const video      = document.getElementById('heroVideo');
  const hero       = document.getElementById('hero');
  const scrollHint = document.getElementById('scrollHint');

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  if (video) {
    if (IS_DESKTOP) {
      video.src      = 'vape-desktop.mp4';
      video.loop     = true;
      video.autoplay = true;
      video.muted    = true;
      video.setAttribute('playsinline', '');
      video.load();
      video.play().catch(() => {});
      if (scrollHint) scrollHint.style.display = 'none';
    } else {
      const SENSITIVITY    = 0.012;
      const LOCK_THRESHOLD = 8;
      const FREEZE_OFFSET  = 5 / 30;
      const NAV_CLEAR      = 76;
      let duration = 0, videoReady = false, touchLastY = 0;

      function heroIsActive() { return window.scrollY <= hero.offsetTop + LOCK_THRESHOLD; }
      function shouldIntercept(dy) {
        if (!videoReady || !heroIsActive()) return false;
        const fz = duration - FREEZE_OFFSET;
        if (video.currentTime >= fz && dy > 0) return false;
        if (video.currentTime <= 0  && dy < 0) return false;
        return true;
      }
      function scrub(delta) {
        const fz = duration - FREEZE_OFFSET;
        video.currentTime = Math.max(0, Math.min(fz, video.currentTime + delta * SENSITIVITY));
        if (delta > 0 && scrollHint) scrollHint.style.opacity = Math.max(0, 1 - video.currentTime / 0.4) + '';
      }

      window.addEventListener('wheel',      e => { if (!shouldIntercept(e.deltaY)) return; e.preventDefault(); scrub(e.deltaY); }, { passive: false });
      window.addEventListener('touchstart', e => { touchLastY = e.touches[0].clientY; }, { passive: true });
      window.addEventListener('touchmove',  e => {
        const d = touchLastY - e.touches[0].clientY; touchLastY = e.touches[0].clientY;
        if (!shouldIntercept(d)) return; e.preventDefault(); scrub(d);
      }, { passive: false });

      function fitMobileHero() {
        if (!video.videoWidth || !video.videoHeight) return;
        const ratio = video.videoWidth / video.videoHeight;
        let h = window.innerWidth / ratio;
        if (h > window.innerHeight - NAV_CLEAR) h = window.innerHeight - NAV_CLEAR;
        hero.style.height = (NAV_CLEAR + h) + 'px';
      }
      function initVideo() {
        video.pause(); video.loop = false; video.autoplay = false; video.currentTime = 0; video.load();
        const onReady = () => { if (!isFinite(video.duration) || !video.duration) return; duration = video.duration; videoReady = true; fitMobileHero(); };
        if (video.readyState >= 1 && isFinite(video.duration) && video.duration) onReady();
        else { video.addEventListener('loadedmetadata', onReady, { once: true }); video.addEventListener('durationchange', () => { if (!videoReady) onReady(); }); }
      }
      initVideo();
      let rz; const onResize = () => { clearTimeout(rz); rz = setTimeout(fitMobileHero, 120); };
      (window.visualViewport || window).addEventListener('resize', onResize);
      window.addEventListener('orientationchange', () => setTimeout(fitMobileHero, 300));
    }
  }

  /* ═══════════════════════════════════════════════════
     SCROLL REVEAL
  ═══════════════════════════════════════════════════ */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (!e.isIntersecting) return; setTimeout(() => e.target.classList.add('revealed'), +e.target.dataset.delay || 0); io.unobserve(e.target); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.feature-card').forEach(el => io.observe(el));

  /* ═══════════════════════════════════════════════════
     COVERFLOW CAROUSEL — Best Sellers
  ═══════════════════════════════════════════════════ */
  const covStage   = document.getElementById('covStage');
  const covDotWrap = document.getElementById('covDots');
  const covCards   = covStage ? [...covStage.querySelectorAll('.cov-card')] : [];
  let covActive = 0, covTimer;

  function getCovDims() {
    const w = window.innerWidth;
    if (w >= 1280) return { cW: 310, cH: 434, offset: 345 };
    if (w >= 1024) return { cW: 270, cH: 378, offset: 300 };
    if (w >= 640)  return { cW: 230, cH: 322, offset: 255 };
    return { cW: 200, cH: 280, offset: 215 };
  }

  function covSetSizes() {
    const { cW, cH } = getCovDims();
    covCards.forEach(c => { c.style.width = cW + 'px'; c.style.height = cH + 'px'; });
    if (covStage) covStage.style.height = (cH + 80) + 'px';
  }

  function updateCov() {
    if (!covCards.length) return;
    const n = covCards.length;
    const { offset } = getCovDims();
    covCards.forEach((card, i) => {
      let d = ((i - covActive) % n + n) % n;
      if (d > n / 2) d -= n;
      const absD = Math.abs(d);
      if (d === 0) {
        card.style.transform = 'translateX(0) scale(1)';
        card.style.zIndex    = '10';
        card.style.opacity   = '1';
        card.style.filter    = 'brightness(1)';
        card.style.boxShadow = '0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.12)';
      } else if (absD === 1) {
        const dir = d > 0 ? 1 : -1;
        card.style.transform = `translateX(${dir * offset}px) scale(0.78)`;
        card.style.zIndex    = '5';
        card.style.opacity   = '0.58';
        card.style.filter    = 'brightness(0.5)';
        card.style.boxShadow = 'none';
      } else {
        const dir = d > 0 ? 1 : -1;
        card.style.transform = `translateX(${dir * offset * 1.85}px) scale(0.6)`;
        card.style.zIndex    = '1';
        card.style.opacity   = '0';
        card.style.filter    = 'brightness(0.3)';
        card.style.boxShadow = 'none';
      }
    });
    covDotWrap && covDotWrap.querySelectorAll('.cov-dot').forEach((d, i) => d.classList.toggle('active', i === covActive));
  }

  function covGo(dir) {
    const n = covCards.length;
    covActive = ((covActive + dir) % n + n) % n;
    updateCov();
    clearInterval(covTimer);
    covTimer = setInterval(() => covGo(1), 3800);
  }

  if (covCards.length) {
    covCards.forEach((_, i) => {
      const b = document.createElement('button');
      b.className = 'cov-dot' + (i === 0 ? ' active' : '');
      b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      b.addEventListener('click', () => { covActive = i; updateCov(); clearInterval(covTimer); covTimer = setInterval(() => covGo(1), 3800); });
      covDotWrap && covDotWrap.appendChild(b);
    });
    covSetSizes();
    updateCov();
    covTimer = setInterval(() => covGo(1), 3800);
    let covTx = 0;
    covStage.addEventListener('touchstart', e => { covTx = e.touches[0].clientX; }, { passive: true });
    covStage.addEventListener('touchend',   e => { const dx = covTx - e.changedTouches[0].clientX; if (Math.abs(dx) > 40) covGo(dx > 0 ? 1 : -1); }, { passive: true });
    window.addEventListener('resize', () => { covSetSizes(); updateCov(); });
  }

  document.getElementById('covPrev')?.addEventListener('click', () => covGo(-1));
  document.getElementById('covNext')?.addEventListener('click', () => covGo(1));

  /* ═══════════════════════════════════════════════════
     TESTIMONIALS SLIDER — multi-card, seamless loop
  ═══════════════════════════════════════════════════ */
  const tTrack    = document.getElementById('testimonialTrack');
  const tDotsWrap = document.getElementById('tDots');
  const tVP       = tTrack ? tTrack.closest('.tslider-viewport') : null;
  const tOrig     = tTrack ? [...tTrack.querySelectorAll('.tslider-card')] : [];
  const tOrigN    = tOrig.length;
  let tIdx = 0, tAutoplay, tIsJumping = false;

  function getVC() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640)  return 2;
    return 1;
  }

  function tInitClones() {
    tTrack.querySelectorAll('.tslider-clone').forEach(c => c.remove());
    const vc = getVC();
    for (let i = 0; i < vc; i++) {
      const cl = tOrig[i % tOrigN].cloneNode(true);
      cl.classList.add('tslider-clone');
      tTrack.appendChild(cl);
    }
  }

  function tAllCards() { return tTrack ? [...tTrack.querySelectorAll('.tslider-card')] : []; }

  function tSetSizes() {
    if (!tVP || !tOrigN) return { cW: 0, gap: 20 };
    const vc  = getVC();
    const gap = vc > 1 ? 20 : 0;
    const vpW = tVP.offsetWidth;
    const cW  = (vpW - gap * (vc - 1)) / vc;
    tAllCards().forEach(c => { c.style.width = cW + 'px'; });
    return { cW, gap };
  }

  function tBuildDots() {
    if (!tDotsWrap) return;
    tDotsWrap.innerHTML = '';
    const vc    = getVC();
    const count = Math.max(1, tOrigN - vc + 1);
    for (let i = 0; i < count; i++) {
      const b = document.createElement('button');
      b.className = 'tslider-dot' + (i === 0 ? ' active' : '');
      b.setAttribute('aria-label', 'Review ' + (i + 1));
      b.addEventListener('click', () => goToT(i));
      tDotsWrap.appendChild(b);
    }
  }

  function goToT(idx) {
    if (!tTrack || tIsJumping) return;
    const { cW, gap } = tSetSizes();

    tTrack.style.transition = 'transform 0.62s cubic-bezier(0.4,0,0.2,1)';
    tIdx = idx;
    tTrack.style.transform = `translateX(-${tIdx * (cW + gap)}px)`;

    // Update dots (mod by real card count)
    const vc    = getVC();
    const maxReal = Math.max(0, tOrigN - vc);
    const dotIdx = tIdx % (maxReal + 1);
    tDotsWrap && tDotsWrap.querySelectorAll('.tslider-dot').forEach((d, i) => d.classList.toggle('active', i === dotIdx));

    clearInterval(tAutoplay);
    tAutoplay = setInterval(() => goToT(tIdx + 1), 5000);
  }

  // After transition, if we're in clone territory, silently snap back
  tTrack && tTrack.addEventListener('transitionend', () => {
    if (!tTrack) return;
    if (tIdx >= tOrigN) {
      tIsJumping = true;
      tTrack.style.transition = 'none';
      tIdx = tIdx - tOrigN;
      const { cW, gap } = tSetSizes();
      tTrack.style.transform = `translateX(-${tIdx * (cW + gap)}px)`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        tTrack.style.transition = '';
        tIsJumping = false;
      }));
    }
  });

  document.getElementById('tPrev')?.addEventListener('click', () => {
    const vc = getVC(); const max = Math.max(0, tOrigN - vc);
    goToT(tIdx <= 0 ? max : tIdx - 1);
  });
  document.getElementById('tNext')?.addEventListener('click', () => goToT(tIdx + 1));

  if (tOrigN) {
    tInitClones();
    tSetSizes();
    tBuildDots();
    tAutoplay = setInterval(() => goToT(tIdx + 1), 5000);
  }

  window.addEventListener('resize', () => {
    tInitClones();
    const vc = getVC(); const max = Math.max(0, tOrigN - vc);
    if (tIdx > max) tIdx = 0;
    tSetSizes();
    tBuildDots();
    tTrack.style.transition = 'none';
    const { cW, gap } = tSetSizes();
    tTrack.style.transform = `translateX(-${tIdx * (cW + gap)}px)`;
    requestAnimationFrame(() => requestAnimationFrame(() => tTrack && (tTrack.style.transition = '')));
  });

  /* ═══════════════════════════════════════════════════
     FLAVOUR MODAL
  ═══════════════════════════════════════════════════ */
  const flavourModal = document.getElementById('flavourModal');
  const fmBackdrop   = document.getElementById('fmBackdrop');
  const fmClose      = document.getElementById('fmClose');
  const fmBrand      = document.getElementById('fmBrand');
  const fmName       = document.getElementById('fmName');
  const fmMeta       = document.getElementById('fmMeta');
  const fmChips      = document.getElementById('fmChips');
  const fmPrice      = document.getElementById('fmPrice');
  const fmOrderBtn   = document.getElementById('fmOrderBtn');

  function openFlavourModal(data) {
    if (!flavourModal) return;
    const { name = '', brand = '', price = '', specs = [], flavours = [] } = data;

    if (fmBrand) fmBrand.textContent = brand;
    if (fmName)  fmName.textContent  = name;
    if (fmPrice) fmPrice.textContent = price;

    if (fmMeta) {
      fmMeta.innerHTML = '';
      specs.forEach(s => { const sp = document.createElement('span'); sp.textContent = s.trim(); fmMeta.appendChild(sp); });
    }

    if (fmChips) {
      fmChips.innerHTML = '';
      if (fmOrderBtn) { fmOrderBtn.href = '#'; fmOrderBtn.classList.remove('ready'); }

      flavours.forEach(fl => {
        const chip = document.createElement('button');
        chip.className   = 'flavour-chip';
        chip.textContent = fl;
        chip.addEventListener('click', () => {
          fmChips.querySelectorAll('.flavour-chip').forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          if (fmOrderBtn) {
            const msg = `Hi iVapeKenya, I want to order ${name} - ${fl} flavour`;
            fmOrderBtn.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
            fmOrderBtn.classList.add('ready');
          }
        });
        fmChips.appendChild(chip);
      });
    }

    flavourModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeFlavourModal() {
    flavourModal && flavourModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  fmClose?.addEventListener('click', closeFlavourModal);
  fmBackdrop?.addEventListener('click', closeFlavourModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeFlavourModal(); });

  // Homepage product cards (data-* attrs on .product-card or .cov-card)
  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const card = btn.closest('[data-name]');
      if (!card) return;
      openFlavourModal({
        name:    card.dataset.name  || '',
        brand:   card.dataset.brand || '',
        price:   card.dataset.price || '',
        specs:   (card.dataset.specs  || '').split('|').filter(Boolean),
        flavours: JSON.parse(card.dataset.flavours || '[]')
      });
    });
  });

  // Catalog page (.disp-card) — reads data from DOM elements
  document.querySelectorAll('.disp-order-btn[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card  = btn.closest('.disp-card');
      if (!card) return;
      const name  = card.querySelector('.disp-name')?.textContent?.trim()  || '';
      const brand = card.querySelector('.disp-brand')?.textContent?.trim() || '';
      const price = card.querySelector('.disp-price')?.childNodes[0]?.textContent?.trim() || '';
      const specs = [...card.querySelectorAll('.disp-tags span')].map(s => s.textContent.trim());
      const flavs = [...card.querySelectorAll('.disp-flavors li')].map(f => f.textContent.trim());
      openFlavourModal({ name, brand, price, specs, flavours: flavs });
    });
  });

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
