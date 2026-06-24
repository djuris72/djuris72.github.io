/* ─────────────────────────────────────────────────────────────
   Dušan Đuriš — Portfolio
   script.js
   ───────────────────────────────────────────────────────────── */

'use strict';

/* ── 1. Navbar — scroll shadow + active link highlight ──────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');

  // Add "scrolled" class for backdrop/border effect
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    highlightActiveLink();
  };

  // Highlight nav link matching current section in viewport
  function highlightActiveLink() {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 90;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();


/* ── 2. Hamburger mobile menu ────────────────────────────────── */
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    const open = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!open));
    navLinks.classList.toggle('open', !open);
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('open');
    });
  });
})();


/* ── 3. Terminal typewriter ──────────────────────────────────── */
(function initTerminal() {
  const body = document.getElementById('terminalBody');
  if (!body) return;

  const lines = [
    { prompt: '~', cmd: 'whoami',                 out: 'dusan-djuris'                       },
    { prompt: '~', cmd: 'cat skills.txt',          out: 'Python · Java · Spring Boot · AI/ML · React' },
    { prompt: '~', cmd: 'echo $STATUS',            out: 'open to opportunities 🚀'           },
    { prompt: '~', cmd: 'echo $LOOKING_FOR',    out: 'Backend / Full-stack / AI-ML opportunities'   },
  ];

  const CHAR_DELAY  = 38;   // ms per character
  const LINE_PAUSE  = 700;  // ms after output before next prompt
  const START_DELAY = 800;  // ms before animation begins

  let html = '';

  function appendLine(text, cls = '') {
    html += `<div class="${cls}">${text}</div>`;
    body.innerHTML = html;
  }

  async function typeLine({ prompt, cmd, out }) {
    return new Promise(resolve => {
      // Prompt
      const promptEl = document.createElement('div');
      promptEl.innerHTML = `<span style="color:var(--highlight)">❯</span> `;
      body.appendChild(promptEl);
      html = body.innerHTML;

      // Type command character by character
      let i = 0;
      const interval = setInterval(() => {
        promptEl.innerHTML =
          `<span style="color:var(--highlight)">❯</span> ` +
          `<span style="color:var(--accent)">${cmd.slice(0, i + 1)}</span>` +
          `<span class="cursor" style="border-right:2px solid var(--accent);animation:blink 1s step-end infinite"> </span>`;
        i++;
        if (i >= cmd.length) {
          clearInterval(interval);
          // Remove cursor, show output
          setTimeout(() => {
            promptEl.innerHTML =
              `<span style="color:var(--highlight)">❯</span> ` +
              `<span style="color:var(--accent)">${cmd}</span>`;
            html = body.innerHTML;
            const outEl = document.createElement('div');
            outEl.style.cssText = 'color:var(--text);padding-left:.25rem;margin-bottom:.6rem;';
            outEl.textContent = out;
            body.appendChild(outEl);
            html = body.innerHTML;
            setTimeout(resolve, LINE_PAUSE);
          }, 200);
        }
      }, CHAR_DELAY);
    });
  }

  // Inject blink keyframe once
  if (!document.getElementById('terminalStyle')) {
    const s = document.createElement('style');
    s.id = 'terminalStyle';
    s.textContent = '@keyframes blink{50%{opacity:0}}';
    document.head.appendChild(s);
  }

  async function runTerminal() {
    await delay(START_DELAY);
    for (const line of lines) {
      await typeLine(line);
    }
    // Blinking final cursor
    const cursor = document.createElement('div');
    cursor.innerHTML = `<span style="color:var(--highlight)">❯</span> <span style="border-right:2px solid var(--accent);animation:blink 1s step-end infinite"> </span>`;
    body.appendChild(cursor);
  }

  runTerminal();
})();


/* ── 4. Floating code blobs ──────────────────────────────────── */
(function initCodeBlobs() {
  const container = document.getElementById('codeBlobs');
  if (!container) return;

  const snippets = [
    'def predict(x):',
    'model.fit(X_train)',
    '@RestController',
    'SELECT * FROM users',
    'torch.nn.Linear(512, 10)',
    'git commit -m "feat"',
    'const [state, setState]',
    'spring.datasource.url',
    'cv2.findContours(...)',
    'loss.backward()',
    'app.listen(3000)',
    'yolo.predict(img)',
    'import numpy as np',
    '@GetMapping("/api")',
    'async/await fetch()',
    'docker-compose up',
  ];

  const BLOB_COUNT = 12;

  for (let i = 0; i < BLOB_COUNT; i++) {
    const blob = document.createElement('div');
    blob.className = 'code-blob';
    blob.textContent = snippets[i % snippets.length];

    const left     = Math.random() * 95;
    const duration = 18 + Math.random() * 20;
    const startY   = 100 + Math.random() * 20;   // start below fold
    const rot      = (Math.random() - 0.5) * 16;
    const delay_s  = Math.random() * duration;     // stagger so they don't all appear at once

    blob.style.cssText = `
      left: ${left}%;
      top: ${startY}%;
      --rot: ${rot}deg;
      animation-duration: ${duration}s;
      animation-delay: -${delay_s}s;
    `;
    container.appendChild(blob);
  }
})();


/* ── 5. Scroll-reveal (IntersectionObserver) ─────────────────── */
(function initReveal() {
  // Add .reveal to all section children that should animate in
  const targets = document.querySelectorAll(
    '.section-head, .about-bio, .about-skills, .stat, ' +
    '.skill-group, .project-card, .contact-info, .contact-form, ' +
    '.footer-brand, .footer-nav'
  );

  targets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
})();


/* ── 6. Contact form with EmailJS ────────────────────────────── */
/*
   SETUP (one-time):
   1. Napravi nalog na https://www.emailjs.com (besplatno do 200 poruka/mesec)
   2. Add Email Service  → kopiraj Service ID
   3. Create Email Template → kopiraj Template ID
      U template-u koristi varijable: {{from_name}}, {{from_email}}, {{message}}
   4. Account → API Keys → kopiraj Public Key
   5. Zameni vrednosti ispod:
*/
const EMAILJS_PUBLIC_KEY  = 'm5M-5KixKsVQpLeEg';   // ← tvoj Public Key
const EMAILJS_SERVICE_ID  = 'service_l17ce2i';   // ← tvoj Service ID
const EMAILJS_TEMPLATE_ID = 'template_7qpy7hj';  // ← tvoj Template ID

(function initContactForm() {
  const form      = document.getElementById('contactForm');
  const statusEl  = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  // Initialize EmailJS
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearStatus();

    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();

    // Validation
    if (!name)                return showError('Please enter your name.');
    if (!isValidEmail(email)) return showError('Please enter a valid email address.');
    if (message.length < 10)  return showError('Message must be at least 10 characters.');

    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Sending…';

    try {
      if (typeof emailjs === 'undefined') {
        throw new Error('EmailJS library not loaded. Check the <script> tag in index.html.');
      }

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name:  name,
        from_email: email,
        message:    message,
      });

      showSuccess('Message sent! I\'ll get back to you soon 🚀');
      form.reset();
    } catch (err) {
      console.error('EmailJS error:', err);
      showError('Something went wrong. Please try again or reach out via email directly.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Send Message';
    }
  });

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }
  function showSuccess(msg) {
    statusEl.textContent = msg;
    statusEl.className = 'form-status success';
  }
  function showError(msg) {
    statusEl.textContent = msg;
    statusEl.className = 'form-status error';
  }
  function clearStatus() {
    statusEl.textContent = '';
    statusEl.className = 'form-status';
  }
})();


/* ── 7. Smooth scroll for anchor links ───────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 72; // nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ── Helpers ─────────────────────────────────────────────────── */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
