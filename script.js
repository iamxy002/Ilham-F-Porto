(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  const header = document.getElementById('siteHeader');
  const mobileToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const progress = document.querySelector('.scroll-progress');

  // Icons are progressively enhanced; the page layout does not depend on them.
  const renderIcons = () => window.lucide?.createIcons?.();
  if (window.lucide) renderIcons();
  else window.addEventListener('load', renderIcons, { once: true });

  mobileToggle?.addEventListener('click', () => {
    const open = mobileToggle.getAttribute('aria-expanded') !== 'true';
    mobileToggle.setAttribute('aria-expanded', String(open));
    mobileNav.classList.toggle('open', open);
    mobileToggle.innerHTML = `<i data-lucide="${open ? 'x' : 'menu'}"></i>`;
    renderIcons();
  });
  mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.innerHTML = '<i data-lucide="menu"></i>';
    renderIcons();
  }));

  let scrollQueued = false;
  function updateScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    header?.classList.toggle('scrolled', window.scrollY > 30);
    const heroBg = document.querySelector('.hero-image');
    if (!prefersReducedMotion && window.innerWidth > 680 && heroBg) {
      heroBg.style.backgroundPosition = `center calc(50% + ${window.scrollY * .1}px)`;
      const content = document.querySelector('[data-parallax]');
      if (content) content.style.translate = `0 ${window.scrollY * -.055}px`;
    }
    scrollQueued = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollQueued) { requestAnimationFrame(updateScroll); scrollQueued = true; }
  }, { passive: true });
  updateScroll();

  if (!prefersReducedMotion && finePointer) {
    const aura = document.createElement('div');
    aura.className = 'cursor-aura';
    aura.setAttribute('aria-hidden', 'true');
    document.body.append(aura);
    let auraFrame = 0;
    window.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      if (!auraFrame) auraFrame = requestAnimationFrame(() => {
        aura.style.setProperty('--cursor-x', `${event.clientX}px`);
        aura.style.setProperty('--cursor-y', `${event.clientY}px`);
        aura.classList.add('is-visible');
        auraFrame = 0;
      });
    }, { passive: true });
    document.addEventListener('pointerleave', () => aura.classList.remove('is-visible'));
    document.querySelectorAll('.button, .nav-cta, .portfolio-tab').forEach(target => {
      target.classList.add('ripple-target');
      target.addEventListener('pointerdown', event => {
        const rect = target.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'interaction-ripple';
        ripple.style.left = `${event.clientX - rect.left}px`;
        ripple.style.top = `${event.clientY - rect.top}px`;
        target.append(ripple);
        ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
      });
    });
  }

  if (!prefersReducedMotion && finePointer) {
    const hero = document.getElementById('home');
    hero?.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      hero.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
    document.querySelectorAll('.magnetic').forEach(element => {
      element.addEventListener('pointermove', event => {
        const rect = element.getBoundingClientRect();
        element.style.translate = `${(event.clientX - rect.left - rect.width / 2) * .1}px ${(event.clientY - rect.top - rect.height / 2) * .14}px`;
      });
      element.addEventListener('pointerleave', () => { element.style.translate = ''; });
    });
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 6}deg) translateY(-3px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
    document.querySelectorAll('.pkl-photo, .polaroid, .credential-card, .history-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
        if (card.matches('.pkl-photo, .polaroid')) {
          const x = (event.clientX - rect.left) / rect.width - .5;
          const y = (event.clientY - rect.top) / rect.height - .5;
          card.style.transform = `perspective(800px) rotateX(${-y * 3}deg) rotateY(${x * 4}deg) translateY(-4px)`;
        }
      });
      card.addEventListener('pointerleave', () => {
        if (card.matches('.pkl-photo, .polaroid')) card.style.transform = '';
      });
    });
  }

  // Stagger reveal timing by visual group, with IntersectionObserver fallback.
  const reveals = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }), { threshold: .12, rootMargin: '0px 0px -4% 0px' });
    reveals.forEach((element, index) => {
      const siblings = [...element.parentElement.querySelectorAll(':scope > .reveal')];
      element.style.setProperty('--delay', `${Math.min(siblings.indexOf(element), 3) * 90}ms`);
      revealObserver.observe(element);
    });
  } else reveals.forEach(element => element.classList.add('visible'));

  // Active navbar section indicator.
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll('#desktopNav a').forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
    }), { rootMargin: '-40% 0px -53% 0px' });
    document.querySelectorAll('main section[id]').forEach(section => navObserver.observe(section));
  }

  // Keyboard- and pointer-accessible portfolio tab switcher.
  const tabs = [...document.querySelectorAll('[role="tab"][data-tab]')];
  const panels = [...document.querySelectorAll('[data-panel]')];
  function activateTab(tab, focus = false) {
    tabs.forEach(button => {
      const active = button === tab;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => {
      const active = panel.dataset.panel === tab.dataset.tab;
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
    if (focus) tab.focus();
    // Newly unhidden cards need their reveal state restored if still off-screen.
    const activePanel = document.querySelector(`[data-panel="${tab.dataset.tab}"]`);
    activePanel?.querySelectorAll('.reveal').forEach((item, i) => {
      if (!item.classList.contains('visible')) item.style.setProperty('--delay', `${Math.min(i, 3) * 75}ms`);
    });
    renderIcons();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      activateTab(tabs[next], true);
    });
  });

  // Folder previews lift out of the folder when hovered or toggled on touch.
  const folder = document.getElementById('archiveFolder');
  folder?.addEventListener('click', () => {
    folder.classList.toggle('is-open');
    folder.setAttribute('aria-pressed', String(folder.classList.contains('is-open')));
  });
  folder?.addEventListener('pointerleave', () => {
    if (window.innerWidth > 680) folder.classList.remove('is-open');
  });
  folder?.addEventListener('keydown', event => {
    if (event.key === 'Escape') { folder.classList.remove('is-open'); folder.setAttribute('aria-pressed', 'false'); }
  });

  // Open WhatsApp with the submitted contact details and message prefilled.
  document.getElementById('contactForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const name = String(values.get('name') || '').trim();
    const email = String(values.get('email') || '').trim();
    const message = String(values.get('message') || '').trim();
    const text = `Halo Ilham, saya ${name}.\nEmail: ${email}\n\n${message}`;
    const whatsappUrl = `https://wa.me/6281915141578?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  });
  document.getElementById('year').textContent = new Date().getFullYear();
})();





