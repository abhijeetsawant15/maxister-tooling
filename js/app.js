// Enforce manual scroll restoration so browsers never auto-jump to old positions or hashes
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Strip any hash on initial load so browser does not auto-scroll
if (window.location.hash) {
  try {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  } catch (err) {}
}

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileNavigation();
  initScrollSpy();
  initBackToTop();
  initSmoothScroll();
});

/**
 * Sticky Header elevation on scroll
 */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * Mobile Navigation Drawer Toggle
 * Preserves scroll position completely when opening and closing.
 */
function initMobileNavigation() {
  const menuToggle = document.querySelector('.menu-toggle');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  if (!menuToggle || !drawer) return;

  let savedScrollY = 0;

  const toggleDrawer = (open) => {
    const isOpen = open !== undefined ? open : !drawer.classList.contains('open');

    if (isOpen) {
      savedScrollY = window.pageYOffset || document.documentElement.scrollTop;
      drawer.classList.add('open');
      menuToggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('drawer-open');
    } else {
      drawer.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('drawer-open');
      // Guarantee scroll position remains identical
      window.scrollTo(0, savedScrollY);
    }

    const iconOpen = menuToggle.querySelector('.icon-menu');
    const iconClose = menuToggle.querySelector('.icon-close');
    if (iconOpen && iconClose) {
      iconOpen.style.display = isOpen ? 'none' : 'block';
      iconClose.style.display = isOpen ? 'block' : 'none';
    }
  };

  menuToggle.addEventListener('click', (e) => {
    e.preventDefault();
    toggleDrawer();
  });

  // Close when clicking any nav link and let smoothScroll handle navigation
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleDrawer(false);
    });
  });

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      toggleDrawer(false);
      menuToggle.focus({ preventScroll: true });
    }
  });

  // Close when clicking outside drawer
  document.addEventListener('click', (e) => {
    if (
      drawer.classList.contains('open') &&
      !drawer.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      toggleDrawer(false);
    }
  });
}

/**
 * ScrollSpy to highlight active navigation link without modifying URL
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const desktopLinks = document.querySelectorAll('.nav-menu .nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!sections.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        setActiveLink(id);
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  function setActiveLink(activeId) {
    desktopLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${activeId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    mobileLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${activeId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}

/**
 * Back to Top Button
 */
function initBackToTop() {
  const backToTopBtn = document.querySelector('.back-to-top');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * Smooth Scroll with header offset
 * Strictly executes ONLY upon explicit user click and never sets focus that causes page jumping.
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#' || targetId.length <= 1) return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 72;
        const targetRect = targetEl.getBoundingClientRect();
        const targetPosition = targetRect.top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: 'smooth'
        });
      }
    });
  });
}
