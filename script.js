const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const smallScreen = window.matchMedia('(max-width: 700px)');
const menuToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');
const navDropdowns = document.querySelectorAll('.nav-dropdown');
const currentYear = document.querySelectorAll('[data-current-year]');
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

root.classList.add('has-js');
currentYear.forEach((element) => {
  element.textContent = new Date().getFullYear();
});

function getConfiguredImagePath(key) {
  return key.split('.').reduce((value, part) => value?.[part], window.AJISImageConfig);
}

document.querySelectorAll('[data-image-key]').forEach((element) => {
  const imagePath = getConfiguredImagePath(element.dataset.imageKey);
  if (!imagePath) {
    console.error(`AJIS image configuration is missing: ${element.dataset.imageKey}`);
    return;
  }

  const assetUrl = new URL(imagePath, document.baseURI);

  if (element instanceof HTMLVideoElement) {
    element.poster = assetUrl.href;
    return;
  }

  if (element instanceof HTMLImageElement) {
    const originalSource = element.getAttribute('src');
    const fallbackUrl = originalSource ? new URL(originalSource, document.baseURI) : null;
    element.addEventListener(
      'load',
      () => {
        if (element.classList.contains('brand-logo')) {
          element.closest('.brand')?.classList.add('brand--has-logo');
        }
        if (element.classList.contains('founder-photo')) {
          const founderSlot = element.closest('.founder-image-slot');
          founderSlot?.classList.add('has-founder-photo');
          founderSlot?.setAttribute('aria-label', 'Itoro-Obong Akie, Founder of AJIS Learning Solutions');
        }
      },
      { once: true }
    );
    element.addEventListener(
      'error',
      () => {
        console.warn(`Optional AJIS image could not be decoded: ${assetUrl.pathname}`);
        if (fallbackUrl && fallbackUrl.href !== assetUrl.href) {
          element.src = fallbackUrl.href;
        } else {
          element.removeAttribute('src');
        }
      },
      { once: true }
    );
    element.src = assetUrl.href;
  } else if (element instanceof HTMLLinkElement) {
    element.href = assetUrl.href;
  }
});

function closeNavigation() {
  if (!menuToggle || !mainNav) return;
  window.clearTimeout(navigationCloseTimer);
  mainNav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation menu');
  navigationCloseTimer = window.setTimeout(() => {
    mainNav.hidden = true;
  }, 180);
  navDropdowns.forEach((dropdown) => {
    dropdown.open = false;
  });
}

let navigationCloseTimer;
if (menuToggle && mainNav) {
  menuToggle.setAttribute('aria-controls', 'primary-navigation');
  mainNav.id = 'primary-navigation';
  menuToggle.addEventListener('click', () => {
    if (mainNav.hidden) {
      window.clearTimeout(navigationCloseTimer);
      mainNav.hidden = false;
      window.requestAnimationFrame(() => mainNav.classList.add('is-open'));
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Close navigation menu');
      return;
    }

    closeNavigation();
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNavigation);
  });

  document.addEventListener('click', (event) => {
    if (!mainNav.hidden && !mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
      closeNavigation();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const wasOpen = !mainNav.hidden;
      closeNavigation();
      if (wasOpen) menuToggle.focus();
    }
  });
}

document.querySelectorAll('.main-nav a').forEach((link) => {
  const href = link.getAttribute('href');
  if (href === currentPage) link.setAttribute('aria-current', 'page');
});

const revealItems = document.querySelectorAll('.reveal');
if (reducedMotion.matches || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

const heroSection = document.querySelector('.hero-video');
const heroVideo = document.querySelector('.hero-video__media--primary');
const standbyVideo = document.querySelector('.hero-video__media--standby');
const videoToggle = document.querySelector('.video-toggle');
const videoToggleLabel = videoToggle?.querySelector('.video-toggle__label');
const videoToggleIcon = videoToggle?.querySelector('.video-toggle__icon');
const videoCaption = document.querySelector('[data-video-caption]');

function setVideoControl(isPlaying) {
  if (!videoToggle) return;
  heroSection?.classList.toggle('is-playing', isPlaying);
  videoToggle.setAttribute('aria-pressed', String(!isPlaying));
  videoToggle.setAttribute('aria-label', isPlaying ? 'Pause background video' : 'Play background video');
  if (videoToggleLabel) videoToggleLabel.textContent = isPlaying ? 'Pause video' : 'Play video';
  if (videoToggleIcon) videoToggleIcon.textContent = isPlaying ? 'Ⅱ' : '▶';
}

if (heroVideo && standbyVideo && videoToggle) {
  const heroSource = heroVideo.querySelector('source[data-src]');
  const scenes = [
    {
      src: heroSource?.dataset.src,
      poster: getConfiguredImagePath('home.heroPoster'),
      caption: heroVideo.dataset.caption
    },
    {
      src: 'assets/videos/homepage/students-laptops.mp4',
      poster: getConfiguredImagePath('home.studentsLaptopsPoster'),
      caption: 'Friends studying with laptops · Coverr'
    },
    {
      src: 'assets/videos/homepage/students-headphones.mp4',
      poster: getConfiguredImagePath('home.studentsHeadphonesPoster'),
      caption: 'Studying with headphones · Mixkit'
    },
    {
      src: 'assets/videos/homepage/students-socialising.mp4',
      poster: getConfiguredImagePath('home.studentsSocialisingPoster'),
      caption: 'Students spending time together · Mixkit'
    }
  ];
  let activeVideo = heroVideo;
  let nextVideo = standbyVideo;
  let activeScene = 0;
  let rotationTimer;
  let videoPausedByUser = false;
  let rotationRunning = false;
  const unavailableScenes = new Set();
  const sceneDuration = 12000;
  const transitionDuration = 900;

  function clearRotationTimer() {
    window.clearTimeout(rotationTimer);
  }

  function prepareScene(video, sceneIndex) {
    const scene = scenes[sceneIndex];
    const source = video.querySelector('source');
    if (!scene?.src || !source) return;

    video.pause();
    video.classList.remove('is-visible');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.poster = scene.poster;
    video.dataset.sceneIndex = String(sceneIndex);
    source.src = scene.src;
    video.load();
  }

  function scheduleRotation() {
    clearRotationTimer();
    rotationTimer = window.setTimeout(() => rotateScene(), sceneDuration);
  }

  function rotateScene(skipCount = 0) {
    if (!rotationRunning || videoPausedByUser) return;
    if (skipCount >= scenes.length - 1) {
      console.error('The remaining AJIS homepage video scenes could not be played.');
      return;
    }

    const nextScene = (activeScene + 1) % scenes.length;
    if (unavailableScenes.has(nextScene)) {
      activeScene = nextScene;
      rotateScene(skipCount + 1);
      return;
    }

    if (Number(nextVideo.dataset.sceneIndex) !== nextScene) {
      prepareScene(nextVideo, nextScene);
    }
    const incomingVideo = nextVideo;
    const outgoingVideo = activeVideo;

    incomingVideo.play().then(() => {
      if (!rotationRunning || videoPausedByUser) {
        incomingVideo.pause();
        return;
      }

      incomingVideo.classList.add('is-visible');
      window.setTimeout(() => {
        if (!rotationRunning || videoPausedByUser) return;

        outgoingVideo.pause();
        outgoingVideo.classList.remove('is-visible');
        activeVideo = incomingVideo;
        nextVideo = outgoingVideo;
        activeScene = nextScene;
        if (videoCaption) videoCaption.textContent = scenes[activeScene].caption;

        const outgoingSource = outgoingVideo.querySelector('source');
        outgoingSource?.removeAttribute('src');
        outgoingVideo.preload = 'none';
        outgoingVideo.load();
        prepareScene(nextVideo, (activeScene + 1) % scenes.length);
        scheduleRotation();
      }, transitionDuration);
    }).catch((error) => {
      unavailableScenes.add(nextScene);
      console.error(`Unable to play AJIS homepage video scene ${nextScene + 1}:`, error);
      const failedSource = incomingVideo.querySelector('source');
      failedSource?.removeAttribute('src');
      incomingVideo.preload = 'none';
      incomingVideo.load();
      prepareScene(nextVideo, (nextScene + 1) % scenes.length);
      rotationTimer = window.setTimeout(() => rotateScene(skipCount + 1), 1200);
    });
  }

  function stopVideoRotation() {
    rotationRunning = false;
    clearRotationTimer();
    activeVideo.pause();
    nextVideo.pause();
    nextVideo.classList.remove('is-visible');
    setVideoControl(false);
  }

  function startVideoRotation() {
    if (rotationRunning) return;
    rotationRunning = true;
    if (activeVideo === heroVideo && heroSource && !heroSource.getAttribute('src')) {
      heroSource.src = heroSource.dataset.src;
      activeVideo.load();
    }

    activeVideo.play().then(() => {
      if (!rotationRunning || videoPausedByUser) {
        activeVideo.pause();
        return;
      }
      activeVideo.classList.add('is-visible');
      setVideoControl(true);
      prepareScene(nextVideo, (activeScene + 1) % scenes.length);
      scheduleRotation();
    }).catch((error) => {
      rotationRunning = false;
      console.error('Unable to play the AJIS homepage video:', error);
      setVideoControl(false);
    });
  }

  function updateHeroVideo() {
    if (reducedMotion.matches || smallScreen.matches || videoPausedByUser) {
      stopVideoRotation();
    } else {
      startVideoRotation();
    }
  }

  videoToggle.addEventListener('click', () => {
    if (rotationRunning) {
      videoPausedByUser = true;
      stopVideoRotation();
    } else {
      videoPausedByUser = false;
      startVideoRotation();
    }
  });

  reducedMotion.addEventListener('change', updateHeroVideo);
  smallScreen.addEventListener('change', updateHeroVideo);
  updateHeroVideo();
  heroVideo.addEventListener('error', () => {
    console.error('The AJIS homepage video could not be loaded; the poster image remains available.');
    setVideoControl(false);
  });

}

const carousel = document.querySelector('.carousel');
if (carousel) {
  const slides = Array.from(carousel.querySelectorAll('.carousel__slide'));
  const dots = Array.from(carousel.querySelectorAll('.carousel__dot'));
  const previous = carousel.querySelector('[data-carousel-prev]');
  const next = carousel.querySelector('[data-carousel-next]');
  const pause = carousel.querySelector('[data-carousel-pause]');
  let activeIndex = 0;
  let timer = null;
  let isPaused = reducedMotion.matches;

  function showSlide(index) {
    if (!slides.length) return;
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });
    dots.forEach((dot, dotIndex) => {
      dot.setAttribute('aria-current', String(dotIndex === activeIndex));
    });
  }

  function stopTimer() {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
  }

  function startTimer() {
    stopTimer();
    if (isPaused || reducedMotion.matches || slides.length < 2) return;
    timer = window.setInterval(() => showSlide(activeIndex + 1), 6500);
  }

  function setPaused(paused) {
    isPaused = paused;
    if (pause) {
      pause.setAttribute('aria-pressed', String(paused));
      pause.setAttribute('aria-label', paused ? 'Play gallery slideshow' : 'Pause gallery slideshow');
      pause.textContent = paused ? '▶' : 'Ⅱ';
    }
    if (paused) stopTimer();
    else startTimer();
  }

  showSlide(0);
  startTimer();
  previous?.addEventListener('click', () => {
    showSlide(activeIndex - 1);
    setPaused(true);
  });
  next?.addEventListener('click', () => {
    showSlide(activeIndex + 1);
    setPaused(true);
  });
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      setPaused(true);
    });
  });
  pause?.addEventListener('click', () => setPaused(!isPaused));

  carousel.addEventListener('mouseenter', stopTimer);
  carousel.addEventListener('mouseleave', startTimer);
  carousel.addEventListener('focusin', stopTimer);
  carousel.addEventListener('focusout', (event) => {
    if (!carousel.contains(event.relatedTarget)) startTimer();
  });
  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) setPaused(true);
  });
  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      showSlide(activeIndex - 1);
      setPaused(true);
    } else if (event.key === 'ArrowRight') {
      showSlide(activeIndex + 1);
      setPaused(true);
    }
  });
}

document.querySelectorAll('form[data-enquiry-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const feedback = form.querySelector('.form-feedback');
    const endpoint = form.dataset.endpoint;
    if (!endpoint) {
      if (feedback) {
        feedback.dataset.state = 'error';
        feedback.textContent = 'This preview form is not connected to a submission service. Your information has not been sent or stored.';
        feedback.hidden = false;
        feedback.focus();
      }
      return;
    }

    let destination;
    try {
      destination = new URL(endpoint, window.location.href);
    } catch (error) {
      console.error('The enquiry form endpoint is invalid:', error);
      if (feedback) {
        feedback.dataset.state = 'error';
        feedback.textContent = 'This form cannot be submitted right now. Please contact AJIS directly.';
        feedback.hidden = false;
      }
      return;
    }

    if (destination.protocol !== 'https:') {
      console.error('The enquiry form endpoint must use HTTPS.');
      if (feedback) {
        feedback.dataset.state = 'error';
        feedback.textContent = 'This form cannot be submitted securely right now.';
        feedback.hidden = false;
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

    fetch(destination, {
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
