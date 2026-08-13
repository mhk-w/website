// Typewriter effect
function typeWriter(text, element, speed = 100) {
  let i = 0;
  element.innerHTML = '';
  
  function type() {
      if (i < text.length) {
          element.innerHTML += text.charAt(i);
          i++;
          setTimeout(type, speed);
      } else {
          element.classList.add('typewriter');
      }
  }
  type();
}

// Initialize typewriter effect
document.addEventListener("DOMContentLoaded", function () {
  const typewriter = document.getElementById("typewriter");
  if (typewriter) {
      const words = [": Planner", ": Engineer", ": Data Scientist"];
      let wordIndex = 0;
      let charIndex = 0;
      let isDeleting = false;
  
      function type() {
          const currentWord = words[wordIndex];
          
          if (isDeleting) {
              charIndex--;
              typewriter.textContent = currentWord.substring(0, charIndex);
  
              if (charIndex === 0) {
                  isDeleting = false;
                  wordIndex = (wordIndex + 1) % words.length;
                  setTimeout(type, 500);
              } else {
                  setTimeout(type, 50);
              }
          } else {
              charIndex++;
              typewriter.textContent = currentWord.substring(0, charIndex);
  
              if (charIndex === currentWord.length) {
                  setTimeout(() => {
                      isDeleting = true;
                      type();
                  }, 2000);
              } else {
                  setTimeout(type, 100);
              }
          }
      }
      type();
  }
});

// Header scroll effect
window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (header) {
      if (window.scrollY > 100) {
          header.style.background = 'rgba(255, 255, 255, 0.98)';
          header.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.15)';
      } else {
          header.style.background = 'rgba(255, 255, 255, 0.95)';
          header.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
      }
  }
});

// Mobile menu toggle — expands the same nav-menu used on desktop as a
// full-width dropdown, rather than a separate sidebar drawer.
document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (!menuToggle || !navMenu) return;

  menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
  });

  navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
          navMenu.classList.remove('active');
          menuToggle.classList.remove('active');
      });
  });

  document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
          navMenu.classList.remove('active');
          menuToggle.classList.remove('active');
      }
  });
});

document.addEventListener("DOMContentLoaded", function () {
    const currentPage = location.pathname.split('/').pop(); // get current filename
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href.includes('index.html'))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  });

// Collapsible section toggle (used by about.html's Awards/Scholarships and
// teaching.html's per-institution sections).
function toggleDropdown(element) {
  const section = element.parentElement;
  section.classList.toggle('open');
}

// These sections ship marked up as "open" (expanded by default) for
// desktop. On mobile there isn't room to show everything at once, so
// collapse them by default there instead -- still expandable via the
// same toggleDropdown click handler. Desktop is untouched: this only
// runs below the mobile breakpoint, once, at load.
document.addEventListener('DOMContentLoaded', () => {
  if (!window.matchMedia('(max-width: 640px)').matches) return;
  document.querySelectorAll('.dropdown-section.open').forEach((section) => {
    section.classList.remove('open');
  });
});

// Academic/Casual bio switch on about.html — a single connected on/off
// control rather than two independent buttons.
//
// Hidden state uses a class (.bio-hidden) rather than inline style, so
// that a mobile-only CSS rule can still turn the *visible* one into a
// `display: contents` wrapper (unwrapping its children into the
// .profile-container grid) without an inline style permanently winning
// that fight regardless of screen size.
function setBioView(view) {
  const academic = document.getElementById('bioAcademic');
  const casual = document.getElementById('bioCasual');
  if (!academic || !casual) return;
  academic.classList.toggle('bio-hidden', view !== 'academic');
  casual.classList.toggle('bio-hidden', view !== 'casual');
  // Whichever bio just became visible may contain a .mobile-collapse
  // block that couldn't be measured for overflow while hidden.
  initMobileCollapsibleText();

  const photoAcademic = document.getElementById('profilePhotoAcademic');
  const photoCasual = document.getElementById('profilePhotoCasual');
  if (photoAcademic) photoAcademic.style.display = view === 'academic' ? 'block' : 'none';
  if (photoCasual) photoCasual.style.display = view === 'casual' ? 'block' : 'none';

  const switchEl = document.getElementById('bioSwitch');
  if (switchEl) switchEl.classList.toggle('is-casual', view === 'casual');

  const track = document.getElementById('bioSwitchTrack');
  if (track) track.setAttribute('aria-checked', view === 'casual' ? 'true' : 'false');

  const labelAcademic = document.getElementById('bioLabelAcademic');
  const labelCasual = document.getElementById('bioLabelCasual');
  if (labelAcademic) labelAcademic.classList.toggle('active', view === 'academic');
  if (labelCasual) labelCasual.classList.toggle('active', view === 'casual');
}

document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('bioSwitchTrack');
  const labelAcademic = document.getElementById('bioLabelAcademic');
  const labelCasual = document.getElementById('bioLabelCasual');
  if (!track) return;

  track.addEventListener('click', () => {
    const isCasual = track.getAttribute('aria-checked') === 'true';
    setBioView(isCasual ? 'academic' : 'casual');
  });
  // Clicking the label text directly (a much bigger target than the
  // track alone) jumps straight to that state.
  if (labelAcademic) labelAcademic.addEventListener('click', () => setBioView('academic'));
  if (labelCasual) labelCasual.addEventListener('click', () => setBioView('casual'));
});

// Mobile-only "Read more" collapsing for long text blocks (.mobile-collapse,
// clamped to a few lines via CSS only under the max-width: 640px media
// query -- desktop always renders these in full, untouched). Only elements
// that actually overflow their clamp get a toggle button; short ones are
// left alone. Re-run after anything that reveals a previously-hidden
// .mobile-collapse block (e.g. the About page's bio switch) so it can be
// measured once visible.
function initMobileCollapsibleText() {
  if (!window.matchMedia('(max-width: 640px)').matches) return;

  document.querySelectorAll('.mobile-collapse').forEach((el) => {
    if (el.dataset.collapseInit) return;
    if (el.scrollHeight <= el.clientHeight + 2) return;
    el.dataset.collapseInit = '1';

    // A directly-following .mobile-collapse-partner (e.g. a story's
    // second paragraph) has no clamp or button of its own -- it stays
    // hidden and rides along with this element's own expand/collapse,
    // so a multi-paragraph block only ever shows one Read More button.
    const partner = el.nextElementSibling && el.nextElementSibling.classList.contains('mobile-collapse-partner')
      ? el.nextElementSibling
      : null;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mobile-collapse-toggle';
    btn.innerHTML = 'Read more <i class="fas fa-chevron-down"></i>';
    btn.addEventListener('click', () => {
      const expanded = el.classList.toggle('expanded');
      if (partner) partner.classList.toggle('expanded', expanded);
      btn.innerHTML = expanded
        ? 'Read less <i class="fas fa-chevron-up"></i>'
        : 'Read more <i class="fas fa-chevron-down"></i>';
      if (!expanded) el.scrollIntoView({ block: 'nearest' });
    });
    el.insertAdjacentElement('afterend', btn);
  });
}

document.addEventListener('DOMContentLoaded', initMobileCollapsibleText);

// Mobile-only "Read more" reveal for a block that starts fully hidden
// (rather than .mobile-collapse's partial line-clamp preview). Used
// where a lede/first-sentence is meant to stand alone with the rest of
// the text hidden entirely until asked for -- About page's bio,
// Teaching's intro, and the Research page's image-slide body text.
// The toggled element is either the button's next sibling, or (when
// the button sits alone in its own row, e.g. About's grid layout) the
// next sibling of its parent.
function toggleMobileReveal(btn) {
  const el = btn.nextElementSibling || (btn.parentElement && btn.parentElement.nextElementSibling);
  if (!el) return;
  const expanded = el.classList.toggle('expanded');
  btn.innerHTML = expanded
    ? 'Read less <i class="fas fa-chevron-up"></i>'
    : 'Read more <i class="fas fa-chevron-down"></i>';
}

// Mobile-only: fold the page's own name into the header logo ("Minho Kim
// - About") instead of repeating it as a big heading with its own
// underline at the top of the content card. The CSS hides that heading
// (.container > .content-card:first-child > .section-title:first-child)
// under the same breakpoint -- read its text here before it disappears,
// so the two stay in sync without hardcoding a page name anywhere.
function initMobilePageTitleInHeader() {
  if (!window.matchMedia('(max-width: 640px)').matches) return;
  const pageTitleEl = document.querySelector('.container > .content-card:first-child > .section-title:first-child');
  const logo = document.querySelector('.header .logo');
  if (!pageTitleEl || !logo) return;
  logo.textContent = `Minho Kim - ${pageTitleEl.textContent.trim()}`;
}

document.addEventListener('DOMContentLoaded', initMobilePageTitleInHeader);

// Mobile-only: a floating "back to top" button, shown once the page has
// scrolled a bit. Injected here (rather than in every page's HTML) so
// it's one shared implementation.
function initBackToTop() {
  if (!window.matchMedia('(max-width: 640px)').matches) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'back-to-top-btn';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.body.appendChild(btn);

  // Bottom-center means it would otherwise sit right on top of the
  // footer's own (also centered) social icon row on a short page --
  // hide it once the footer scrolls into view.
  const footer = document.querySelector('.site-footer');

  window.addEventListener('scroll', () => {
    const footerVisible = footer && footer.getBoundingClientRect().top < window.innerHeight;
    btn.classList.toggle('visible', window.scrollY > 400 && !footerVisible);
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', initBackToTop);

// Mobile-only: fade in each top-level block of a page's content-card(s)
// as it scrolls into view, instead of everything just being there at
// once. Class-gated (.fade-in-section only exists in CSS under the
// mobile media query, and is only ever added here) so a JS failure
// just leaves the page in its normal, fully-visible state rather than
// permanently hiding content.
function initScrollFadeIn() {
  if (!window.matchMedia('(max-width: 640px)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  // Tall, dynamically-populated list containers (e.g. the full news
  // archive) can render with less than the intersection threshold on
  // screen at load on shorter viewports, so the observer never fires
  // and the whole block sits invisible until a scroll happens to cross
  // it. Skip anything that tall entirely rather than fade it in as one
  // giant unit — it's not a meaningful "section" to animate anyway.
  // .compact-content-card (the small "Read more about me and my CV"
  // card) carries the content-card class itself, so the selector below
  // would otherwise also match ITS children -- the icon and the two
  // inline links -- fading each in separately while the plain text
  // around them stays visible the whole time. Treat it as a single
  // atomic unit instead by not reaching inside it at all.
  const MAX_FADE_HEIGHT = 900;
  const targets = [...document.querySelectorAll('.content-card:not(.compact-content-card) > *')]
    .filter((el) => el.scrollHeight <= MAX_FADE_HEIGHT);
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('fade-in-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el) => {
    el.classList.add('fade-in-section');
    observer.observe(el);
  });

  // Safety net: a fast flick-scroll can jump straight from "below the
  // viewport" to "above it" without the browser ever painting a frame
  // where an element was actually onscreen, so the observer above has
  // nothing to fire on. Once scrolling settles, sweep for anything
  // that's already been scrolled past and reveal it directly, so
  // nothing is ever left permanently invisible.
  let sweepTimer = null;
  window.addEventListener('scroll', () => {
    clearTimeout(sweepTimer);
    sweepTimer = setTimeout(() => {
      document.querySelectorAll('.fade-in-section:not(.fade-in-visible)').forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add('fade-in-visible');
          observer.unobserve(el);
        }
      });
    }, 200);
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', initScrollFadeIn);

