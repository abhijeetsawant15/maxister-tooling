/**
 * MAXISTER TOOLING — Gallery & Lightbox Module
 * Category filtering and accessible image modal preview
 */

document.addEventListener('DOMContentLoaded', () => {
  initGalleryFilters();
  initLightbox();
});

function initGalleryFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!filterBtns.length || !galleryItems.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active filter button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.style.display = 'block';
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

function initLightbox() {
  const lightbox = document.getElementById('gallery-lightbox');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const closeBtn = document.querySelector('.lightbox-close-btn');

  if (!lightbox || !galleryItems.length) return;

  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxTitle = lightbox.querySelector('.lightbox-title');
  const lightboxCategory = lightbox.querySelector('.lightbox-category');
  const lightboxDesc = lightbox.querySelector('.lightbox-desc');

  let currentIndex = 0;
  const visibleItems = () => Array.from(galleryItems).filter(item => item.style.display !== 'none');

  const updateLightboxContent = (index) => {
    const items = visibleItems();
    if (!items[index]) return;

    const targetItem = items[index];
    const imgEl = targetItem.querySelector('img');
    const titleEl = targetItem.querySelector('.gallery-name');
    const catEl = targetItem.querySelector('.gallery-cat');
    const desc = targetItem.getAttribute('data-desc') || 'Manufactured with high-precision tolerance at Maxister Tooling facility in Pune.';

    if (lightboxImg && imgEl) {
      lightboxImg.src = imgEl.src;
      lightboxImg.alt = imgEl.alt;
    }
    if (lightboxTitle && titleEl) lightboxTitle.textContent = titleEl.textContent;
    if (lightboxCategory && catEl) lightboxCategory.textContent = catEl.textContent;
    if (lightboxDesc) lightboxDesc.textContent = desc;

    currentIndex = index;
  };

  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      const items = visibleItems();
      const currentVisibleIdx = items.indexOf(item);
      if (currentVisibleIdx !== -1) {
        updateLightboxContent(currentVisibleIdx);
        if (typeof lightbox.showModal === 'function') {
          lightbox.showModal();
        } else {
          lightbox.setAttribute('open', '');
        }
      }
    });
  });

  const closeLightbox = () => {
    if (typeof lightbox.close === 'function') {
      lightbox.close();
    } else {
      lightbox.removeAttribute('open');
    }
  };

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  // Click backdrop to close
  lightbox.addEventListener('click', (e) => {
    const rect = lightbox.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width
    );
    if (!isInDialog) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.open) return;

    const items = visibleItems();
    if (e.key === 'ArrowRight') {
      const nextIdx = (currentIndex + 1) % items.length;
      updateLightboxContent(nextIdx);
    } else if (e.key === 'ArrowLeft') {
      const prevIdx = (currentIndex - 1 + items.length) % items.length;
      updateLightboxContent(prevIdx);
    }
  });
}
