(function () {
  'use strict';

  /* Header: transparent over the hero, solid frosted bar once scrolled past it.
     The logo is taller in the on-hero state, so the header's real rendered
     height differs between states — --header-h (used for the hero's
     negative margin-top) must be resynced on every state change, not just
     once on load, or a sliver of page background shows above the header. */
  var siteHeader = document.getElementById('site-header');
  var hero = document.getElementById('hero');
  var syncHeaderHeight = function () {
    if (siteHeader) document.documentElement.style.setProperty('--header-h', siteHeader.offsetHeight + 'px');
  };
  if (siteHeader && hero) {
    var ON_HERO_MAX_SCROLL = 8; // px — small dead zone against rubber-band/jitter at scrollY≈0
    var headerTicking = false;
    var applyHeaderScrollState = function () {
      headerTicking = false;
      var onHero = window.scrollY <= ON_HERO_MAX_SCROLL;
      if (siteHeader.classList.contains('is-on-hero') === onHero) return;
      siteHeader.classList.toggle('is-on-hero', onHero);
      syncHeaderHeight();
      window.setTimeout(syncHeaderHeight, 320); // after the height transition settles
    };
    siteHeader.classList.add('is-on-hero');
    syncHeaderHeight();
    window.setTimeout(syncHeaderHeight, 320); // safety net (see below) — the initial call used to have none
    applyHeaderScrollState(); // corrects immediately if the page loads already scrolled (e.g. reload mid-page)
    window.addEventListener('scroll', function () {
      if (headerTicking) return;
      headerTicking = true;
      window.requestAnimationFrame(applyHeaderScrollState);
    }, { passive: true });
    /* Real-world bug (found via a live diagnostic overlay, 2026-09): on some
       browsers/machines the very first syncHeaderHeight() call above can
       still capture the header's SOLID-state height even though is-on-hero
       was already added synchronously beforehand — i.e. --header-h ends up
       stuck at the smaller solid-state value while the header visually
       renders in the (taller) on-hero state, leaving a gap of page
       background above the header exactly the size of the difference.
       Every OTHER state change already got a 320ms delayed re-check (the
       setTimeout above, originally added for the scroll-triggered path
       only) — this one, the initial load, did not, so there was never a
       second chance to correct it. `window.load` (fires once everything —
       fonts, images, layout — has fully settled) is an unconditional final
       safety net on top of the 320ms one, regardless of the exact cause. */
    window.addEventListener('load', syncHeaderHeight);
  } else if (siteHeader && !hero) {
    siteHeader.classList.remove('is-on-hero');
    syncHeaderHeight();
  } else {
    syncHeaderHeight();
  }
  window.addEventListener('resize', syncHeaderHeight);

  /* Hero: slow crossfade between the hero photos */
  var heroSlides = document.querySelectorAll('.hero__slide');
  if (heroSlides.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var heroIndex = 0;
    window.setInterval(function () {
      heroSlides[heroIndex].classList.remove('is-active');
      heroIndex = (heroIndex + 1) % heroSlides.length;
      heroSlides[heroIndex].classList.add('is-active');
    }, 6500);
  }

  /* Mobile nav toggle */
  var navToggle = document.getElementById('nav-toggle');
  var siteNav = document.getElementById('site-nav');
  function closeNav() {
    if (!navToggle || !siteNav) return;
    siteNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    if (siteHeader) siteHeader.classList.remove('nav-is-open');
    navToggle.setAttribute('aria-label', 'Menü öffnen');
  }
  function openNav() {
    siteNav.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    if (siteHeader) siteHeader.classList.add('nav-is-open');
    navToggle.setAttribute('aria-label', 'Menü schliessen');
  }
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) { closeNav(); } else { openNav(); }
    });
    siteNav.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
  }

  /* Leistungen: render service grid from real Quality Dent photos */
  var services = [
    { n: '01', img: 'assets/img/svc-kronen.jpg', title: 'ZirkonOxid – Kronen & Brücken', text: 'Hochfeste Zirkonoxid-Gerüste, individuell verblendet.' },
    { n: '02', img: 'assets/img/svc-keramik-new.jpg', title: 'Vollkeramische Restaurationen', text: 'Inlays, Onlays und Veneers — minimalinvasiv und ästhetisch.' },
    { n: '03', img: 'assets/img/svc-metall.jpg', title: 'Metallkeramik', text: 'Stabiles Metallgerüst mit keramischer Verblendung.' },
    { n: '04', img: 'assets/img/svc-implantat-new.jpg', title: 'Implantatprothetik', text: 'Passgenauer Zahnersatz auf Implantaten.' },
    { n: '05', img: 'assets/img/svc-prothesen.jpg', title: 'Teil-, Hybrid- & Totalprothesen', text: 'Abnehmbarer Zahnersatz mit Fokus auf Tragekomfort.' },
    { n: '06', img: 'assets/img/svc-modellguss.jpg', title: 'Modellguss-Prothesen', text: 'Filigrane Metallgerüste für stabilen, dezenten Zahnersatz.' },
    { n: '07', img: 'assets/img/svc-schienen-new.jpg', title: 'Schienen aller Arten', text: 'Aufbiss-, Knirscher- und Sportschienen nach Mass.' },
    { n: '08', img: 'assets/img/svc-valplast.jpg', title: 'Valplast', text: 'Flexibler, nahezu unsichtbarer Prothesenkunststoff.' }
  ];
  var viewport = document.getElementById('showcaseViewport');
  if (viewport) {
    var dotsWrap = document.getElementById('showcaseDots');
    var total = services.length;

    // Center-mode carousel: the viewport's side padding (see CSS
    // scroll-padding-inline) is sized so the ACTIVE slide sits centered,
    // leaving equal empty space on the other side to be filled by the
    // neighbouring slide peeking in. At the very first/last real slide
    // there is no neighbour to peek — so we clone the last slide before
    // slide 1 and the first slide after the last slide. The clones fill
    // that space with a real image preview instead of blank page
    // background, and once the (smooth) scroll settles on a clone we
    // silently (no animation) snap to the matching real slide, which
    // looks identical — the loop is invisible to the user.
    function buildSlide(s, realIndex, isClone) {
      var n = String(realIndex + 1).padStart(2, '0');
      var slide = document.createElement('div');
      slide.className = 'showcase__slide';
      if (isClone) { slide.setAttribute('aria-hidden', 'true'); slide.setAttribute('tabindex', '-1'); }
      slide.innerHTML =
        '<img src="' + s.img + '" alt="' + (isClone ? '' : s.title + ' – Quality Dent AG') + '" loading="' + (!isClone && realIndex < 2 ? 'eager' : 'lazy') + '">' +
        '<div class="showcase__caption"><span class="showcase__no">' + n + ' / ' + String(total).padStart(2, '0') + '</span>' +
        '<h3 class="showcase__title">' + s.title + '</h3><p class="showcase__text">' + s.text + '</p></div>';
      return slide;
    }

    var slides = [];
    var realIndexOf = [];

    var cloneLast = buildSlide(services[total - 1], total - 1, true);
    viewport.appendChild(cloneLast); slides.push(cloneLast); realIndexOf.push(total - 1);

    services.forEach(function (s, i) {
      var slide = buildSlide(s, i, false);
      viewport.appendChild(slide);
      slides.push(slide);
      realIndexOf.push(i);

      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'showcase__dot';
      dot.setAttribute('aria-label', 'Zu „' + s.title + '“ springen');
      dot.addEventListener('click', function () { goToSlide(i + 1); userInteracted(); });
      dotsWrap.appendChild(dot);
    });

    var cloneFirst = buildSlide(services[0], 0, true);
    viewport.appendChild(cloneFirst); slides.push(cloneFirst); realIndexOf.push(0);

    var dots = Array.prototype.slice.call(dotsWrap.children);
    var current = 1;
    var lastIdx = slides.length - 1;

    function setActive(i) {
      current = i;
      slides.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
      var realIdx = realIndexOf[i];
      dots.forEach(function (d, j) { d.classList.toggle('is-active', j === realIdx); });
    }
    function scrollToSlide(idx, instant) {
      var slide = slides[idx];
      // Manual centering instead of scrollIntoView: with CSS scroll-snap
      // active on the viewport, a smooth scrollIntoView animation can get
      // cut short by the browser's own snap resolution, landing off-center.
      var target = slide.offsetLeft - (viewport.clientWidth - slide.offsetWidth) / 2;
      if (instant) {
        // Direct scrollLeft assignment instead of scrollTo({behavior:'instant'}):
        // 'instant' is not part of the standardized ScrollToOptions.behavior
        // (only 'auto'/'smooth' are spec'd) and was observed to silently no-op
        // on the very first paint in production — the carousel stayed at
        // scrollLeft 0 (slide 1 left-aligned, clone never visible) instead of
        // jumping to the centered position. Setting .scrollLeft directly is
        // unambiguous and always synchronous/instant.
        viewport.scrollLeft = target;
      } else {
        viewport.scrollTo({ left: target, behavior: 'smooth' });
      }
    }
    function goToSlide(i) {
      var idx = Math.max(0, Math.min(lastIdx, i));
      scrollToSlide(idx, false);
      setActive(idx);
    }
    // Initial position: land on the first REAL slide (index 1), not on
    // the clone that the viewport's padding would otherwise center by
    // default at scrollLeft 0. Deferred one frame (requestAnimationFrame)
    // so layout/offsetLeft are guaranteed settled before we measure them —
    // measuring synchronously during initial script execution was another
    // contributor to the centering silently failing on first load.
    setActive(1);
    (window.requestAnimationFrame || window.setTimeout)(function () {
      scrollToSlide(1, true);
    });

    // After the scroll (smooth drag/swipe or the smooth goToSlide above)
    // comes to rest on a clone, jump instantly to its real counterpart.
    var settleTimer = null;
    viewport.addEventListener('scroll', function () {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(function () {
        if (current === 0) { scrollToSlide(lastIdx - 1, true); setActive(lastIdx - 1); }
        else if (current === lastIdx) { scrollToSlide(1, true); setActive(1); }
      }, 140);
    });

    if ('IntersectionObserver' in window) {
      var slideObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            setActive(slides.indexOf(entry.target));
          }
        });
      }, { root: viewport, threshold: [0.6] });
      slides.forEach(function (s) { slideObserver.observe(s); });
    }

    document.getElementById('showcasePrev').addEventListener('click', function () { goToSlide(current - 1); userInteracted(); });
    document.getElementById('showcaseNext').addEventListener('click', function () { goToSlide(current + 1); userInteracted(); });

    var autoplayTimer = null;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function startAutoplay() {
      if (reduceMotion) return;
      stopAutoplay();
      autoplayTimer = window.setInterval(function () { goToSlide(current + 1); }, 4800);
    }
    function stopAutoplay() { if (autoplayTimer) { window.clearInterval(autoplayTimer); autoplayTimer = null; } }
    function userInteracted() { stopAutoplay(); window.setTimeout(startAutoplay, 9000); }

    viewport.addEventListener('pointerdown', userInteracted);
    viewport.addEventListener('mouseenter', stopAutoplay);
    viewport.addEventListener('mouseleave', startAutoplay);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) startAutoplay(); else stopAutoplay();
      }, { threshold: 0.2 }).observe(viewport);
    } else {
      startAutoplay();
    }
  }

  /* FAQ-Akkordeon */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
  });

  /* Reveal-on-scroll — runs after all dynamic content (e.g. the service
     grid above) has been inserted, so those elements get observed too. */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* Kontakt form: client-side validation + demo submit state.
     Demo-Modus: kein produktives Versand-Backend angebunden — vor Go-Live
     an ein echtes Formular-Backend anschliessen. */
  var form = document.getElementById('kontakt-form');
  if (form) {
    var submitBtn = document.getElementById('kontakt-submit');
    var statusEl = document.getElementById('form-status');
    var nameInput = document.getElementById('f-name');
    var emailInput = document.getElementById('f-email');

    function setFieldError(input, errorEl, message) {
      var field = input.closest('.form-field');
      if (message) { field.classList.add('has-error'); if (errorEl) errorEl.textContent = message; }
      else { field.classList.remove('has-error'); if (errorEl) errorEl.textContent = ''; }
    }
    function isValidEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      var nameError = document.getElementById('f-name-error');
      var emailError = document.getElementById('f-email-error');

      if (!nameInput.value.trim()) { setFieldError(nameInput, nameError, 'Bitte Namen angeben.'); valid = false; }
      else { setFieldError(nameInput, nameError, ''); }

      if (!emailInput.value.trim() || !isValidEmail(emailInput.value.trim())) { setFieldError(emailInput, emailError, 'Bitte gültige E-Mail-Adresse angeben.'); valid = false; }
      else { setFieldError(emailInput, emailError, ''); }

      if (!valid) { statusEl.textContent = 'Bitte die markierten Felder korrigieren.'; statusEl.classList.add('is-error'); return; }

      statusEl.classList.remove('is-error');
      statusEl.textContent = 'Wird gesendet …';
      submitBtn.disabled = true;
      var originalLabel = submitBtn.textContent;
      submitBtn.textContent = 'Wird gesendet …';

      window.setTimeout(function () {
        statusEl.textContent = 'Danke — wir melden uns.';
        submitBtn.textContent = 'Danke — wir melden uns';
        form.reset();
        window.setTimeout(function () { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }, 3200);
      }, 700);
    });
  }
})();
