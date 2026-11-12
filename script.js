const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
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
  videoToggle.setAttribute('aria-pressed', String(isPlaying));
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
    if (reducedMotion.matches) return;
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
    if (reducedMotion.matches || videoPausedByUser) {
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
  setPaused(isPaused);
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

document.querySelectorAll('.service-item__details').forEach((details) => {
  const summary = details.querySelector('summary');
  const syncExpandedState = () => summary?.setAttribute('aria-expanded', String(details.open));
  syncExpandedState();
  details.addEventListener('toggle', syncExpandedState);
});

const formSubmitEndpoint = 'https://formsubmit.co/ajax/ajis.tuition@gmail.com';

document.querySelectorAll('form[data-enquiry-form]').forEach((form) => {
  const feedback = form.querySelector('.form-feedback');
  const submitButton = form.querySelector('button[type="submit"]');
  let isSubmitting = false;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity() || isSubmitting) return;

    if (form.action !== formSubmitEndpoint) {
      console.error('The AJIS enquiry form is not configured for the approved FormSubmit endpoint.');
      if (feedback) {
        feedback.dataset.state = 'error';
        feedback.textContent = 'This enquiry form is not configured correctly. Please use one of the separate contact options.';
        feedback.hidden = false;
        feedback.focus();
      }
      return;
    }

    const submissionDate = form.elements.namedItem('submission-date');
    if (submissionDate instanceof HTMLInputElement) {
      submissionDate.value = new Date().toISOString();
    }

    const formFields = Array.from(form.querySelectorAll('input, select, textarea'));
    const submission = new FormData(form);
    isSubmitting = true;
    formFields.forEach((field) => {
      field.disabled = true;
    });
    if (submitButton) submitButton.disabled = true;
    if (feedback) {
      feedback.dataset.state = 'pending';
      feedback.textContent = 'Sending your enquiry to AJIS…';
      feedback.hidden = false;
      feedback.focus();
    }

    try {
      const response = await fetch(formSubmitEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: submission,
      });
      const result = await response.json();
      const serviceAccepted = result?.success === true || result?.success === 'true';
      if (!response.ok || !serviceAccepted) {
        throw new Error(`FormSubmit did not accept the enquiry (HTTP ${response.status}).`);
      }

      if (feedback) {
        feedback.dataset.state = 'success';
        feedback.textContent = 'FormSubmit accepted your enquiry for processing. If this is the first submission, AJIS must complete the one-time recipient activation before enquiries can reach the inbox; this confirmation is not proof of inbox delivery.';
      }
      form.reset();
    } catch (error) {
      console.error('Unable to submit the AJIS enquiry through FormSubmit:', error);
      if (feedback) {
        feedback.dataset.state = 'error';
        feedback.textContent = 'We could not submit your enquiry. Please try again or use the separate WhatsApp contact option.';
      }
    } finally {
      isSubmitting = false;
      formFields.forEach((field) => {
        field.disabled = false;
      });
      if (submitButton) submitButton.disabled = false;
    }
  });
});

const faqAssistantTemplate = document.createElement('template');
faqAssistantTemplate.innerHTML = `
  <a class="floating-whatsapp" href="https://wa.me/447882665968?text=Hello%20AJIS%20Learning%20Solutions" target="_blank" rel="noopener noreferrer" aria-label="Contact AJIS on WhatsApp" title="Chat with AJIS on WhatsApp"><span aria-hidden="true">WA</span></a>
  <aside class="faq-assistant" aria-label="AJIS quick answers">
    <button class="faq-assistant__toggle" type="button" aria-label="Open AJIS website assistant" title="Open AJIS website assistant" aria-expanded="false" aria-controls="faq-assistant-panel">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4.5 5.5h15v11h-8l-4.5 3v-3h-2.5z" /><circle cx="9" cy="11" r="1" /><circle cx="12" cy="11" r="1" /><circle cx="15" cy="11" r="1" /></svg>
    </button>
    <section class="faq-assistant__panel" id="faq-assistant-panel" aria-label="Frequently asked questions" hidden>
      <header class="faq-assistant__header"><div><h2>AJIS Website Help</h2><p>Quick answers from this website</p></div><button class="faq-assistant__close" type="button" aria-label="Close AJIS website assistant">×</button></header>
      <div class="faq-assistant__messages" role="log" aria-live="polite" aria-relevant="additions">
        <p class="faq-assistant__message faq-assistant__message--answer">Hello! Welcome to AJIS Learning Solutions. How can I help you today?</p>
      </div>
      <div class="faq-assistant__quick-questions" role="group" aria-label="Quick questions">
        <button type="button" data-faq-question="What is AJIS Learning Solutions?">What is AJIS Learning Solutions?</button>
        <button type="button" data-faq-question="What services do you offer?">What services do you offer?</button>
        <button type="button" data-faq-question="What programmes do you offer?">What programmes do you offer?</button>
        <button type="button" data-faq-question="How do I register?">How do I register?</button>
        <button type="button" data-faq-question="How can I contact AJIS?">How can I contact AJIS?</button>
      </div>
      <form class="faq-assistant__form">
        <label class="sr-only" for="faq-assistant-question">Ask a question</label>
        <input id="faq-assistant-question" name="question" type="text" maxlength="240" autocomplete="off" placeholder="Type a question" required />
        <button class="btn btn-primary" type="submit">Ask</button>
      </form>
      <p class="faq-assistant__notice">Automated answers based on this website; no live human or AI service.</p>
      <div class="faq-assistant__handoff"><a href="contact.html">Contact AJIS</a><a href="https://wa.me/447882665968" target="_blank" rel="noopener noreferrer">WhatsApp AJIS</a></div>
    </section>
  </aside>`;
document.body.append(faqAssistantTemplate.content);

const faqToggle = document.querySelector('.faq-assistant__toggle');
const faqPanel = document.querySelector('.faq-assistant__panel');
const faqClose = document.querySelector('.faq-assistant__close');
const faqForm = document.querySelector('.faq-assistant__form');
const faqInput = faqForm?.querySelector('input');
const faqMessages = document.querySelector('.faq-assistant__messages');
const faqQuickQuestions = document.querySelector('.faq-assistant__quick-questions');

const faqEntries = [
  {
    keywords: ['what is ajis', 'who is ajis'],
    answer: 'AJIS Learning Solutions is an educational consultancy supporting learners, parents, educators, schools, organisations, and communities with meaningful learning experiences.',
    links: [{ label: 'About AJIS', href: 'about.html' }]
  },
  {
    keywords: ['programme', 'program'],
    answer: 'AJIS offers educational consultancy, curriculum development, learning design, early years education, literacy development, SEND and inclusive education, staff training and professional development, learner support, parent and community learning, and educational programme design.',
    links: [{ label: 'Explore all services', href: 'services.html' }]
  },
  {
    keywords: ['price', 'cost', 'fee', 'fees'],
    answer: 'The website does not publish tuition fees or service prices. Please contact AJIS to discuss your enquiry.'
  },
  {
    keywords: ['educational consultancy'],
    answer: 'AJIS describes Educational Consultancy as guidance for families, schools, and organisations working through educational questions and opportunities. The published focus includes exploring context, needs, goals, programme options, and practical next steps.'
  },
  {
    keywords: ['curriculum development', 'curriculum'],
    answer: 'AJIS describes Curriculum Development as planning and development that connects curriculum aims to relevant content and learning experiences. The published focus includes curriculum planning and review, learning resources, and assessment planning.'
  },
  {
    keywords: ['learning design'],
    answer: 'AJIS describes Learning Design as structured learning experiences with clear aims, purposeful activities, and consideration of learner needs.'
  },
  {
    keywords: ['early years'],
    answer: 'AJIS describes Early Years Education as early learning support designed to nurture curiosity, confidence, and strong foundations, with child-centred experiences and family and educator collaboration.'
  },
  {
    keywords: ['literacy', 'reading'],
    answer: 'AJIS describes Literacy Development as learning support and design that encourage literacy, communication, and engagement with reading.'
  },
  {
    keywords: ['send & inclusive', 'send education', 'send support', 'inclusive education', 'inclusion'],
    answer: 'AJIS describes SEND & Inclusive Education as approaches that recognise diverse needs, individual strengths, and different ways of learning, including inclusive strategies, support planning, and home-school collaboration.'
  },
  {
    keywords: ['learner support'],
    answer: 'AJIS describes Learner Support as individual or group support informed by goals, interests, and educational context.'
  },
  {
    keywords: ['educational programme design', 'programme design'],
    answer: 'AJIS describes Educational Programme Design as planning that brings aims, content, activities, and learner support into a coherent structure.'
  },
  {
    keywords: ['service', 'support', 'what do you do', 'areas of support'],
    answer: 'AJIS publishes ten support areas: Educational Consultancy, Curriculum Development, Learning Design, Early Years Education, Literacy Development, SEND & Inclusive Education, Staff Training & Professional Development, Learner Support, Parent & Community Learning, and Educational Programme Design. The scope is discussed to fit the learner or organisation.',
    links: [{ label: 'Explore all services', href: 'services.html' }]
  },
  {
    keywords: ['who', 'work with', 'families', 'school', 'organisation'],
    answer: 'AJIS works with learners, parents, educators, schools, organisations, and communities across different learning contexts.'
  },
  {
    keywords: ['tuition', 'register', 'registration'],
    answer: 'Use the Tuition & Registration page to outline a learner’s current level, programme or learning area, and support needs. AJIS can then discuss goals and possible next steps. FormSubmit recipient activation is required before enquiry emails can reach the inbox.',
    links: [{ label: 'Tuition & Registration', href: 'tuition-registration.html' }]
  },
  {
    keywords: ['qualification', 'qualifications', 'certificate', 'certification'],
    answer: 'This website does not publish specific qualification or certification details. Please contact AJIS directly if you need that information.'
  },
  {
    keywords: ['address', 'location', 'where are you'],
    answer: 'A verified office address or service location is not published on this website. Please contact AJIS to discuss availability.'
  },
  {
    keywords: ['contact', 'phone', 'email', 'whatsapp', 'speak'],
    answer: 'You can call, WhatsApp, or email AJIS using the contact links on the Contact page.',
    links: [
      { label: 'Contact AJIS', href: 'contact.html' },
      { label: 'Call +44 7882 665968', href: 'tel:+447882665968' },
      { label: 'Email AJIS', href: 'mailto:ajis.tuition@gmail.com?subject=Enquiry%20%E2%80%94%20AJIS%20Learning%20Solutions' },
      { label: 'WhatsApp AJIS', href: 'https://wa.me/447882665968' }
    ]
  },
  {
    keywords: ['begin', 'start', 'consultation', 'enquiry', 'enquire'],
    answer: 'Start with the consultation or contact form to submit an enquiry through FormSubmit. AJIS must complete the one-time recipient activation before enquiry emails can reach the inbox. You can also contact AJIS directly.',
    links: [{ label: 'Contact AJIS', href: 'contact.html' }, { label: 'Book a consultation', href: 'index.html#consultation' }]
  }
];

function answerFaq(question) {
  const normalizedQuestion = question.toLowerCase();
  const match = faqEntries.find((entry) => entry.keywords.some((keyword) => normalizedQuestion.includes(keyword)));
  if (match) return { text: match.answer, links: match.links || [{ label: 'Contact AJIS', href: 'contact.html' }] };
  return {
    text: 'I can only answer from information published on this website. Please use the Contact page or WhatsApp AJIS for help with this question.',
    links: [{ label: 'Contact AJIS', href: 'contact.html' }]
  };
}

function addFaqMessage(text, kind, links = []) {
  const message = document.createElement('p');
  message.className = `faq-assistant__message faq-assistant__message--${kind}`;
  message.append(document.createTextNode(text));
  links.forEach(({ label, href }) => {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    if (href.startsWith('https://')) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    message.append(document.createTextNode(' '), link);
  });
  faqMessages?.append(message);
  if (faqMessages) faqMessages.scrollTop = faqMessages.scrollHeight;
}

function respondToFaq(question) {
  addFaqMessage(question, 'question');
  const response = answerFaq(question);
  addFaqMessage(response.text, 'answer', response.links);
}

faqToggle?.addEventListener('click', () => {
  const isExpanded = faqToggle.getAttribute('aria-expanded') === 'true';
  faqToggle.setAttribute('aria-expanded', String(!isExpanded));
  const label = isExpanded ? 'Open AJIS website assistant' : 'Close AJIS website assistant';
  faqToggle.setAttribute('aria-label', label);
  faqToggle.setAttribute('title', label);
  if (faqPanel) faqPanel.hidden = isExpanded;
  if (!isExpanded) faqInput?.focus();
});

faqClose?.addEventListener('click', () => {
  if (faqPanel) faqPanel.hidden = true;
  faqToggle?.setAttribute('aria-expanded', 'false');
  faqToggle?.setAttribute('aria-label', 'Open AJIS website assistant');
  faqToggle?.setAttribute('title', 'Open AJIS website assistant');
  faqToggle?.focus();
});

faqQuickQuestions?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-faq-question]');
  if (!button) return;
  respondToFaq(button.dataset.faqQuestion);
});

faqForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const question = faqInput?.value.trim();
  if (!question || !faqForm.reportValidity()) return;
  respondToFaq(question);
  faqForm.reset();
  faqInput?.focus();
});

faqPanel?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    faqPanel.hidden = true;
    faqToggle?.setAttribute('aria-expanded', 'false');
    faqToggle?.setAttribute('aria-label', 'Open AJIS website assistant');
    faqToggle?.setAttribute('title', 'Open AJIS website assistant');
    faqToggle?.focus();
  }
});
