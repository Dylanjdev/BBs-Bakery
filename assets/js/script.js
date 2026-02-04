// ===============================
// Mobile menu toggle
// ===============================
const menuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const overlay = document.querySelector('.mobile-overlay');
const body = document.body;

if (menuToggle && navMenu && overlay) {
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    overlay.classList.toggle('active');
    menuToggle.classList.toggle('active');
    body.classList.toggle('menu-open');
  });

  overlay.addEventListener('click', () => {
    navMenu.classList.remove('active');
    overlay.classList.remove('active');
    menuToggle.classList.remove('active');
    body.classList.remove('menu-open');
  });

  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      overlay.classList.remove('active');
      menuToggle.classList.remove('active');
      body.classList.remove('menu-open');
    });
  });
}

// ===============================
// Highlight today's special
// ===============================
function highlightTodaySpecial() {
  const today = new Date().getDay(); // 0 = Sunday
  const specialItems = document.querySelectorAll('.menu-special li');

  specialItems.forEach(item => {
    const itemDay = parseInt(item.getAttribute('data-day'));
    if (itemDay === today) {
      item.classList.add('today-special');
    }
  });
}

// ===============================
// Open / Closed status
// ===============================
function updateOpenStatus() {
  const statusBadge = document.getElementById('statusBadge');
  if (!statusBadge) return;

  const statusText = statusBadge.querySelector('.status-text');

  const now = new Date();
  const day = now.getDay();
  const currentTime = now.getHours() + now.getMinutes() / 60;

  const isMondayToFriday = day >= 1 && day <= 5;
  const isSaturday = day === 6;

  const isOpen =
    (isMondayToFriday && currentTime >= 7 && currentTime < 14) ||
    (isSaturday && currentTime >= 8 && currentTime < 14);

  if (isOpen) {
    statusBadge.classList.add('open');
    statusBadge.classList.remove('closed');
    statusText.textContent = 'OPEN NOW';
  } else {
    statusBadge.classList.add('closed');
    statusBadge.classList.remove('open');

    if (day === 0 || (day === 6 && currentTime >= 14)) {
      statusText.textContent = 'CLOSED - Opens Monday 7:00 AM';
    } else if (day === 6 && currentTime < 8) {
      statusText.textContent = 'CLOSED - Opens at 8:00 AM';
    } else if (currentTime < 7) {
      statusText.textContent = 'CLOSED - Opens at 7:00 AM';
    } else {
      statusText.textContent = 'CLOSED - Opens Tomorrow 7:00 AM';
    }
  }
}

// ===============================
// Pre-order modal
// ===============================
const modal = document.getElementById('preorderModal');
const preorderBtn = document.getElementById('preorderBtn');
const modalClose = document.querySelector('.modal-close');

if (modal && preorderBtn && modalClose) {
  preorderBtn.addEventListener('click', () => {
    const scrollY = window.scrollY;
    modal.style.display = 'block';
    body.classList.add('modal-open');
    body.style.top = `-${scrollY}px`;
  });

  const closeModal = () => {
    const scrollY = body.style.top;
    modal.style.display = 'none';
    body.classList.remove('modal-open');
    body.style.top = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  };

  modalClose.addEventListener('click', closeModal);

  window.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });
}

// ===============================
// Image modal
// ===============================
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const imageCloseBtn = document.querySelector('.image-modal-close');
const imageWrappers = document.querySelectorAll('.preorder-image-wrapper');

if (imageModal && modalImage && imageCloseBtn) {
  imageWrappers.forEach(wrapper => {
    wrapper.addEventListener('click', () => {
      modalImage.src = wrapper.getAttribute('data-image');
      imageModal.style.display = 'block';
      body.style.overflow = 'hidden';
    });
  });

  imageCloseBtn.addEventListener('click', () => {
    imageModal.style.display = 'none';
    body.style.overflow = 'auto';
  });

  window.addEventListener('click', e => {
    if (e.target === imageModal) {
      imageModal.style.display = 'none';
      body.style.overflow = 'auto';
    }
  });
}

// ===============================
// Init
// ===============================
const yearEl = document.getElementById('currentYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

highlightTodaySpecial();
updateOpenStatus();
setInterval(updateOpenStatus, 60000);
