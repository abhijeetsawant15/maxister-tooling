/**
 * MAXISTER TOOLING - Industries Horizontal Showcase Slider
 * Modern, responsive, automated horizontal slider.
 */

document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('industriesSlider');
  const tabsContainer = document.getElementById('slideBarTabs');
  if (!slider || !tabsContainer) return;

  const slides = Array.from(slider.querySelectorAll('.industry-showcase-slide'));
  const tabs = Array.from(tabsContainer.querySelectorAll('.slide-bar-item'));
  const progressFill = document.getElementById('slideProgressFill');

  if (!slides.length || !tabs.length) return;

  const AUTOPLAY_DELAY = 4200; // 4.2 seconds
  let currentSlide = 0;
  let timer = null;
  let isPaused = false;
  let touchStartX = 0;
  let touchStartY = 0;

  function restartProgress() {
    if (!progressFill) return;
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
    void progressFill.offsetWidth; // force reflow
    if (!isPaused) {
      progressFill.style.transition = 'width ' + AUTOPLAY_DELAY + 'ms linear';
      progressFill.style.width = '100%';
    }
  }

  function showSlide(index) {
    if (index < 0) {
      currentSlide = slides.length - 1;
    } else if (index >= slides.length) {
      currentSlide = 0;
    } else {
      currentSlide = index;
    }

    // Switch active slide
    slides.forEach((slide, idx) => {
      if (idx === currentSlide) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Switch active tab
    tabs.forEach((tab, idx) => {
      const active = (idx === currentSlide);
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      if (active && tabsContainer) {
        const tabLeft = tab.offsetLeft;
        const tabWidth = tab.offsetWidth;
        const containerWidth = tabsContainer.offsetWidth;
        const targetScrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2);
        tabsContainer.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth'
        });
      }
    });

    // Switch active mobile cards
    if (typeof mobileCards !== 'undefined' && mobileCards.length) {
      mobileCards.forEach((card, idx) => {
        card.classList.toggle('active', idx === currentSlide);
      });
    }

    restartProgress();
  }

  function nextSlide() {
    showSlide((currentSlide + 1) % slides.length);
  }

  function prevSlide() {
    showSlide((currentSlide - 1 + slides.length) % slides.length);
  }

  function startAutoplay() {
    stopAutoplay();
    isPaused = false;
    restartProgress();
    timer = setInterval(() => {
      if (!isPaused) {
        nextSlide();
      }
    }, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    if (progressFill) {
      const w = window.getComputedStyle(progressFill).width;
      progressFill.style.transition = 'none';
      progressFill.style.width = w;
    }
  }

  const mobileCards = Array.from(document.querySelectorAll('.industry-mobile-grid-card'));

  // Click on tabs
  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = parseInt(tab.getAttribute('data-slide'), 10);
      if (!isNaN(idx)) {
        showSlide(idx);
        startAutoplay();
      }
    });
  });

  // Click on mobile quick selector cards
  mobileCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = parseInt(card.getAttribute('data-slide'), 10);
      if (!isNaN(idx)) {
        showSlide(idx);
        startAutoplay();
      }
    });
  });

  // Next / Prev button event delegation
  slider.addEventListener('click', (e) => {
    const nextBtn = e.target.closest('#sliderNextBtn, .next-btn-clone, .next-btn');
    const prevBtn = e.target.closest('#sliderPrevBtn, .prev-btn-clone, .prev-btn');
    if (nextBtn) {
      e.preventDefault();
      nextSlide();
      startAutoplay();
    } else if (prevBtn) {
      e.preventDefault();
      prevSlide();
      startAutoplay();
    }
  });

  // Pause on hover
  const industriesSection = document.getElementById('industries');
  if (industriesSection) {
    industriesSection.addEventListener('mouseenter', () => {
      isPaused = true;
      stopAutoplay();
    });
    industriesSection.addEventListener('mouseleave', () => {
      isPaused = false;
      startAutoplay();
    });
  }

  // Touch Swipe on mobile
  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isPaused = true;
    stopAutoplay();
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - touchStartX;
    const diffY = endY - touchStartY;

    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.4) {
      if (diffX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    isPaused = false;
    startAutoplay();
  }, { passive: true });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    const rect = slider.getBoundingClientRect();
    const isInView = (rect.top < window.innerHeight && rect.bottom > 0);
    if (!isInView) return;

    if (e.key === 'ArrowRight') {
      nextSlide();
      startAutoplay();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
      startAutoplay();
    }
  });

  // Pre-fill contact service
  document.querySelectorAll('.slide-inquiry-link').forEach(link => {
    link.addEventListener('click', () => {
      const s = link.getAttribute('data-service');
      const sel = document.getElementById('service-select') || document.getElementById('rfq-service');
      if (sel && s) {
        // Map service slug or string
        if (s === 'cnc-machining') sel.value = 'CNC Job Work';
        else if (s === 'injection-moulding') sel.value = 'Plastic Injection Moulding';
        else if (s === 'tooling-fixtures') sel.value = 'Production Components';
        else sel.value = s;
      }
    });
  });

  // Initialize
  showSlide(0);
  startAutoplay();
});
