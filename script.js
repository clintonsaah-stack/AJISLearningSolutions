const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.main-nav');
const currentYear = document.getElementById('current-year');
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

if (navToggle && navMenu) {
  navToggle.setAttribute('aria-controls', 'primary-navigation');
  navMenu.id = 'primary-navigation';

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.textContent = isOpen ? '×' : '☰';
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.textContent = '☰';
    });
  });

  document.addEventListener('click', (event) => {
    if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.textContent = '☰';
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.textContent = '☰';
      navToggle.focus();
    }
  });
}

document.querySelectorAll('.main-nav a').forEach((link) => {
  if (link.getAttribute('href') === currentPage) {
    link.setAttribute('aria-current', 'page');
  }
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js-enabled');

if (!prefersReducedMotion) {
  let scrollFrame = null;
  window.addEventListener(
    'scroll',
    () => {
      if (scrollFrame !== null) return;
      scrollFrame = window.requestAnimationFrame(() => {
        const drift = Math.min(window.scrollY * 0.025, 72);
        document.documentElement.style.setProperty('--scroll-drift-x', `${drift}px`);
        scrollFrame = null;
      });
    },
    { passive: true }
  );
}

const revealItems = document.querySelectorAll('.reveal');
if (revealItems.length) {
  if (prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add('visible'));
  } else if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }
}

const slides = Array.from(document.querySelectorAll('.slide'));
const dots = Array.from(document.querySelectorAll('.slider-dots button'));
const prevBtn = document.querySelector('.slider-btn.prev');
const nextBtn = document.querySelector('.slider-btn.next');
const pauseBtn = document.querySelector('.slider-btn.pause');
let activeIndex = 0;
let autoSlideTimer = null;
let isPaused = false;

function showSlide(index) {
  if (!slides.length) return;

  activeIndex = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === activeIndex;
    slide.classList.toggle('active', isActive);
    slide.setAttribute('aria-hidden', String(!isActive));
  });

  dots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === activeIndex;
    dot.classList.toggle('active', isActive);
    dot.setAttribute('aria-pressed', String(isActive));
  });
}

function restartAutoSlide() {
  if (prefersReducedMotion || !slides.length || isPaused) return;
  clearInterval(autoSlideTimer);
  autoSlideTimer = setInterval(() => {
    showSlide(activeIndex + 1);
  }, 5000);
}

function pauseAutoSlide() {
  isPaused = true;
  clearInterval(autoSlideTimer);
  if (pauseBtn) {
    pauseBtn.setAttribute('aria-pressed', 'true');
    pauseBtn.setAttribute('aria-label', 'Play slideshow');
    pauseBtn.textContent = '▶';
  }
}

if (slides.length) {
  showSlide(0);
  restartAutoSlide();

  pauseBtn?.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.setAttribute('aria-pressed', String(isPaused));
    pauseBtn.setAttribute('aria-label', isPaused ? 'Play slideshow' : 'Pause slideshow');
    pauseBtn.textContent = isPaused ? '▶' : 'Ⅱ';
    if (isPaused) {
      clearInterval(autoSlideTimer);
    } else {
      restartAutoSlide();
    }
  });

  prevBtn?.addEventListener('click', () => {
    showSlide(activeIndex - 1);
    pauseAutoSlide();
  });

  nextBtn?.addEventListener('click', () => {
    showSlide(activeIndex + 1);
    pauseAutoSlide();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      pauseAutoSlide();
    });
  });

  const sliderShell = document.querySelector('.slider-shell');
  sliderShell?.addEventListener('mouseenter', () => clearInterval(autoSlideTimer));
  sliderShell?.addEventListener('mouseleave', restartAutoSlide);
  sliderShell?.addEventListener('focusin', () => clearInterval(autoSlideTimer));
  sliderShell?.addEventListener('focusout', restartAutoSlide);
  sliderShell?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      showSlide(activeIndex - 1);
      pauseAutoSlide();
    } else if (event.key === 'ArrowRight') {
      showSlide(activeIndex + 1);
      pauseAutoSlide();
    }
  });
}

const forms = document.querySelectorAll('form');
forms.forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const feedback = form.querySelector('.form-feedback');
    const endpoint = form.dataset.endpoint;
    if (!endpoint) {
      if (feedback) {
        feedback.dataset.state = 'error';
        feedback.textContent = 'This form is not connected yet. Your information has not been sent or stored.';
        feedback.hidden = false;
        feedback.focus();
      }
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    if (feedback) {
      feedback.dataset.state = 'pending';
      feedback.textContent = 'Sending your request…';
      feedback.hidden = false;
    }

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
        if (feedback) {
          feedback.dataset.state = 'success';
          feedback.textContent = 'Your request was sent successfully.';
        }
        form.reset();
      })
      .catch((error) => {
        console.error('Unable to submit the enquiry form:', error);
        if (feedback) {
          feedback.dataset.state = 'error';
          feedback.textContent = 'We could not send your request. Please try again later.';
        }
      })
      .finally(() => {
        if (submitButton) submitButton.disabled = false;
      });
  });
});
