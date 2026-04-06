// Theme Toggle - runs immediately to prevent flash
(function() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

  // Theme Toggle
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      if (newTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      }
    });
  }
});

// Lightbox Functionality
class Lightbox {
  constructor() {
    this.lightbox = document.querySelector('.lightbox');
    this.lightboxImg = document.querySelector('.lightbox-content img');
    this.lightboxCaption = document.querySelector('.lightbox-caption');
    this.photos = document.querySelectorAll('.photo-item');
    this.currentIndex = 0;

    if (this.lightbox && this.photos.length > 0) {
      this.init();
    }
  }

  init() {
    // Open lightbox on photo click
    this.photos.forEach((photo, index) => {
      photo.addEventListener('click', () => this.open(index));
    });

    // Close button
    const closeBtn = document.querySelector('.lightbox-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Navigation buttons
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());

    // Close on background click
    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox) {
        this.close();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.lightbox.classList.contains('active')) return;

      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
  }

  open(index) {
    this.currentIndex = index;
    this.updateImage();
    this.lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.photos.length) % this.photos.length;
    this.updateImage();
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.photos.length;
    this.updateImage();
  }

  updateImage() {
    const photo = this.photos[this.currentIndex];
    const img = photo.querySelector('img');
    const caption = photo.dataset.caption || '';

    this.lightboxImg.src = img.dataset.full || img.src;
    this.lightboxImg.alt = img.alt;
    this.lightboxCaption.textContent = caption;
  }
}

// Initialize lightbox when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  new Lightbox();
});
