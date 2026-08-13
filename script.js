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

// Academic/Casual bio switch on about.html — a single connected on/off
// control rather than two independent buttons.
function setBioView(view) {
  const academic = document.getElementById('bioAcademic');
  const casual = document.getElementById('bioCasual');
  if (!academic || !casual) return;
  academic.style.display = view === 'academic' ? 'block' : 'none';
  casual.style.display = view === 'casual' ? 'block' : 'none';
  // Whichever bio just became visible may contain a .mobile-collapse
  // block that couldn't be measured for overflow while display:none.
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

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mobile-collapse-toggle';
    btn.innerHTML = 'Read more <i class="fas fa-chevron-down"></i>';
    btn.addEventListener('click', () => {
      const expanded = el.classList.toggle('expanded');
      btn.innerHTML = expanded
        ? 'Read less <i class="fas fa-chevron-up"></i>'
        : 'Read more <i class="fas fa-chevron-down"></i>';
      if (!expanded) el.scrollIntoView({ block: 'nearest' });
    });
    el.insertAdjacentElement('afterend', btn);
  });
}

document.addEventListener('DOMContentLoaded', initMobileCollapsibleText);

