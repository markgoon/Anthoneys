// Anthoney's — home page interactions
(() => {
  // Mobile nav
  const nav = document.querySelector('[data-nav]');
  const toggle = document.querySelector('[data-nav-toggle]');
  if (nav && toggle) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('.nav__links a').forEach((link) =>
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  // Nav dropdowns (About Us): click/tap toggles; Escape, outside click or tabbing away closes
  document.querySelectorAll('[data-subnav]').forEach((item) => {
    const btn = item.querySelector('.nav__parent');
    const set = (open) => {
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    };
    btn.addEventListener('click', () => set(!item.classList.contains('is-open')));
    item.addEventListener('keydown', (e) => { if (e.key === 'Escape') { set(false); btn.focus(); } });
    item.addEventListener('focusout', (e) => { if (e.relatedTarget && !item.contains(e.relatedTarget)) set(false); });
    document.addEventListener('click', (e) => { if (!item.contains(e.target)) set(false); });
  });

  // Certification marquee: duplicate logos for a seamless loop
  const marquee = document.querySelector('[data-marquee]');
  if (marquee) {
    [...marquee.children].forEach((img) => {
      const clone = img.cloneNode(true);
      clone.alt = '';
      clone.setAttribute('aria-hidden', 'true');
      marquee.appendChild(clone);
    });
  }

  // Brands carousel
  const track = document.querySelector('[data-carousel]');
  const prev = document.querySelector('[data-carousel-prev]');
  const next = document.querySelector('[data-carousel-next]');
  if (track && prev && next) {
    const step = () => {
      const card = track.querySelector('.brand-card');
      const gap = parseFloat(getComputedStyle(track).columnGap) || 20;
      return card ? card.offsetWidth + gap : 300;
    };
    const update = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // Video dialog (set data-video-src to a YouTube/Vimeo embed URL when available)
  const opener = document.querySelector('[data-video-open]');
  const dialog = document.querySelector('[data-video-dialog]');
  const body = document.querySelector('[data-video-body]');
  if (opener && dialog && body) {
    opener.addEventListener('click', () => {
      const src = opener.dataset.videoSrc;
      body.innerHTML = src
        ? `<iframe src="${src}" title="The Green Commandments" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
        : 'Our Green Commandments film is coming soon.';
      dialog.showModal();
    });
    const close = () => { dialog.close(); body.innerHTML = ''; };
    dialog.querySelector('[data-video-close]').addEventListener('click', close);
    dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
  }

  // Scroll reveal
  const targets = document.querySelectorAll('.about__intro, .stat-card, .commandments__copy, .video-card, .brands__head, .brand-card, .news__head, .news-feature, .news-list, .gc-item, .gc-media__head, .ab-story__head, .ab-story__cols, .ab-founder, .ab-vmp-card, .ab-values__head, .ab-value, .ab-clients__intro, .ab-client, .bd-lead, .bd-group__head, .bd-grid__intro, .bd-card, .bd-close__card, .ct-quick__card, .ct-form-card, .ct-info, .ct-partner__head, .ct-pcard, .ct-band, .ct-map__frame');
  if ('IntersectionObserver' in window) {
    targets.forEach((el) => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach((el) => io.observe(el));
  }

  // About timeline: vertical scroll drives a pinned horizontal track, with parallax layers
  const tl = document.querySelector('[data-timeline]');
  if (tl) {
    const sticky = tl.querySelector('.tl__sticky');
    const head = tl.querySelector('.tl__head');
    const viewport = tl.querySelector('[data-tl-viewport]');
    const track = tl.querySelector('[data-tl-track]');
    const years = [...tl.querySelectorAll('.tl-year')];
    const big = tl.querySelector('[data-tl-big]');
    const bigText = big.firstElementChild;
    const fill = tl.querySelector('[data-tl-fill]');
    const blob = tl.querySelector('[data-tl-blob]');
    const endCap = tl.querySelector('.tl__cap--end');
    const count = tl.querySelector('[data-tl-count]');
    const prevBtn = tl.querySelector('[data-tl-prev]');
    const nextBtn = tl.querySelector('[data-tl-next]');
    const pinned = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const levels = [0.14, 0.42, 0.26, 0.56, 0.18, 0.46, 0.32, 0.62];
    const n = years.length;
    let col = 0, focus = 0, distance = 0, active = -1, mx = 0, my = 0, ticking = false;

    years.forEach((y, i) => y.style.setProperty('--lvl', levels[i % levels.length]));
    if (pinned) tl.classList.add('is-pinned');

    const measure = () => {
      const vw = viewport.clientWidth;
      const contentLeft = head.getBoundingClientRect().left + parseFloat(getComputedStyle(head).paddingLeft);
      col = years[0].offsetWidth;
      focus = vw < 760 ? contentLeft + 8 : Math.max(contentLeft + 150, vw * 0.3);
      distance = (n - 1) * col;
      track.style.setProperty('--focus', `${focus}px`);
      track.style.paddingRight = `${Math.max(vw - focus - col, 40)}px`;
      if (endCap) endCap.style.left = `${focus + n * col + 24}px`;
      const axis = years[0].querySelector('.tl-year__axis').offsetHeight;
      tl.style.setProperty('--tl-h', `${viewport.clientHeight - axis}px`);
      if (pinned) tl.style.height = `${sticky.offsetHeight + distance}px`;
      active = -1;
    };

    const setActive = (i) => {
      if (i === active) return;
      active = i;
      years.forEach((y, j) => {
        y.classList.toggle('is-active', j === i);
        y.classList.toggle('is-past', j < i);
        y.querySelector('.tl-year__label').toggleAttribute('aria-current', j === i);
      });
      bigText.textContent = years[i].dataset.tlYear;
      if (bigText.animate) bigText.animate([{ opacity: 0, transform: 'translateY(14%)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.2,.7,.2,1)' });
      blob.style.left = `${focus + i * col}px`;
      count.textContent = `${String(i + 1).padStart(2, '0')} / ${n}`;
      prevBtn.disabled = i === 0;
      nextBtn.disabled = i === n - 1;
    };

    const render = () => {
      ticking = false;
      let x;
      if (pinned) {
        x = Math.min(Math.max(-tl.getBoundingClientRect().top, 0), distance);
        track.style.transform = `translate3d(${-x}px, 0, 0)`;
      } else {
        x = viewport.scrollLeft;
      }
      const p = distance ? x / distance : 0;
      const vw = viewport.clientWidth;
      years.forEach((y, j) => {
        const left = focus + j * col - x;
        y.classList.toggle('is-in', left < vw * 0.94 && left > -col);
      });
      fill.style.width = `${x}px`;
      big.style.transform = `translate3d(${-p * 160 - mx * 28}px, ${-my * 18}px, 0)`;
      track.style.setProperty('--mx', mx);
      track.style.setProperty('--my', my);
      setActive(Math.min(n - 1, Math.max(0, Math.round(x / col))));
    };
    const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(render); } };

    const jump = (i) => {
      const target = Math.min(n - 1, Math.max(0, i)) * col;
      if (pinned) window.scrollTo({ top: window.scrollY + tl.getBoundingClientRect().top + target, behavior: 'smooth' });
      else viewport.scrollTo({ left: target, behavior: 'smooth' });
    };

    prevBtn.addEventListener('click', () => jump(active - 1));
    nextBtn.addEventListener('click', () => jump(active + 1));
    years.forEach((y, i) => {
      const label = y.querySelector('.tl-year__label');
      label.addEventListener('click', () => jump(i));
      label.addEventListener('focus', () => { if (i !== active) jump(i); });
    });
    tl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); jump(active + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); jump(active - 1); }
    });

    if (pinned && window.matchMedia('(pointer: fine)').matches) {
      sticky.addEventListener('pointermove', (e) => {
        const r = sticky.getBoundingClientRect();
        mx = (e.clientX - r.left) / r.width - 0.5;
        my = (e.clientY - r.top) / r.height - 0.5;
        request();
      });
      sticky.addEventListener('pointerleave', () => { mx = 0; my = 0; request(); });
    }

    window.addEventListener('scroll', request, { passive: true });
    viewport.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', () => { measure(); request(); });
    measure();
    render();
  }

  // Gentle scroll parallax for [data-parallax] elements (speed = fraction of distance from viewport centre)
  const parallax = [...document.querySelectorAll('[data-parallax]')];
  if (parallax.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let parallaxTicking = false;
    const moveParallax = () => {
      parallaxTicking = false;
      const vh = window.innerHeight;
      const enabled = window.innerWidth > 760;
      parallax.forEach((el) => {
        const prev = el._parallax || 0;
        if (!enabled) { el.style.translate = ''; el._parallax = 0; return; }
        const r = el.getBoundingClientRect();
        const offset = (r.top - prev + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax);
        el._parallax = offset;
        el.style.translate = `0 ${offset.toFixed(1)}px`;
      });
    };
    const requestParallax = () => { if (!parallaxTicking) { parallaxTicking = true; requestAnimationFrame(moveParallax); } };
    window.addEventListener('scroll', requestParallax, { passive: true });
    window.addEventListener('resize', requestParallax);
    moveParallax();
  }

  // Contact page: general / partnership switch. There is no form backend yet, so a valid
  // submission opens the visitor's email app with the enquiry addressed to info@newanthoneys.lk.
  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    const switches = [...document.querySelectorAll('[data-enquiry-tab]')];
    const partnerFields = [...contactForm.querySelectorAll('[data-partner-only]')];
    const typeInput = contactForm.querySelector('[name="enquiry"]');
    const title = document.querySelector('[data-form-title]');
    const lede = document.querySelector('[data-form-lede]');
    const submitLabel = contactForm.querySelector('[data-submit-label]');
    const status = contactForm.querySelector('[data-form-status]');
    const copy = {
      general: {
        title: 'Send us a message',
        lede: 'Questions about our products, orders or anything else — fill in the form and our team will get back to you.',
        submit: 'Send Message',
      },
      partner: {
        title: 'Start a partnership',
        lede: 'Tell us about your business and how you’d like to work with Anthoney’s. Our sales team will follow up with next steps.',
        submit: 'Send Partnership Enquiry',
      },
    };
    const setType = (type) => {
      const isPartner = type === 'partner';
      typeInput.value = type;
      switches.forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.enquiryTab === type)));
      partnerFields.forEach((field) => {
        field.hidden = !isPartner;
        field.querySelectorAll('input, select, textarea').forEach((el) => { el.disabled = !isPartner; });
      });
      title.textContent = copy[type].title;
      lede.textContent = copy[type].lede;
      submitLabel.textContent = copy[type].submit;
      status.hidden = true;
    };
    switches.forEach((btn) => btn.addEventListener('click', () => setType(btn.dataset.enquiryTab)));
    document.querySelectorAll('[data-enquiry-open]').forEach((link) =>
      link.addEventListener('click', () => setType(link.dataset.enquiryOpen))
    );

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(contactForm);
      const isPartner = data.get('enquiry') === 'partner';
      const name = data.get('name').trim();
      const subject = isPartner
        ? `Partnership enquiry: ${data.get('partner_type')} — ${data.get('company').trim()}`
        : `Website enquiry from ${name}`;
      const lines = [`Name: ${name}`, `Email: ${data.get('email').trim()}`];
      if (data.get('phone').trim()) lines.push(`Phone: ${data.get('phone').trim()}`);
      if (isPartner) lines.push(`Company: ${data.get('company').trim()}`, `Partnership type: ${data.get('partner_type')}`);
      lines.push('', data.get('message').trim());
      window.location.href = `mailto:info@newanthoneys.lk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
      status.textContent = `Thanks, ${name}. Your email app should open with your ${isPartner ? 'partnership enquiry' : 'message'} ready to send to info@newanthoneys.lk.`;
      status.hidden = false;
    });
  }

  // Footer year
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
