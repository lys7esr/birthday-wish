/* ============================================================
   BIRTHDAY SURPRISE — script.js
   Hacker sequence → Glitch → Birthday reveal
   ============================================================ */

// ─── CONFIG ──────────────────────────────────────────────────
const CONFIG = {
  friendName:      '[FRIEND_NAME]',          // ← Change this
  //whatsappNumber:  '91XXXXXXXXXX',           // ← Country code + number, no spaces or +
  //whatsappMessage: 'Happy Birthday [FRIEND_NAME]! 🎉🎂✨',
};

// ─── Terminal lines ───────────────────────────────────────────
const TERMINAL_LINES = [
  { text: 'Initializing secure shell...', delay: 0 },
  { text: 'Establishing encrypted tunnel...', delay: 600 },
  { text: 'Bypassing firewall [████████] 100%', delay: 1400 },
  { text: 'Decrypting contact database...', delay: 2300 },
  { text: 'Identity located ✓', delay: 3200 },
  { text: '> Loading surprise protocol...', delay: 3900 },
];

const CHAR_SPEED = 28;   // ms per character
const HOLD_AFTER = 600;  // ms pause after all lines

// ─── State ───────────────────────────────────────────────────
let musicPlaying = false;
let audioCtx     = null;
let confettiAnim = null;

// ─── DOM refs ─────────────────────────────────────────────────
const hackerScreen   = document.getElementById('hacker-screen');
const glitchEl       = document.getElementById('glitch-transition');
const birthdayScreen = document.getElementById('birthday-screen');
const termOutput     = document.getElementById('terminal-output');
const currentLine    = document.getElementById('current-line');
const musicBtn       = document.getElementById('music-btn');
const wishPopup      = document.getElementById('wish-popup');
//const waLink         = document.getElementById('whatsapp-link');

// ─── Boot ─────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  patchNames();
  startHackerSequence();
});

// Replace [FRIEND_NAME] tokens in DOM
function patchNames() {
  document.querySelectorAll('.friend-name, .popup-title').forEach(el => {
    el.textContent = el.textContent.replace('[FRIEND_NAME]', CONFIG.friendName);
  });
  document.querySelectorAll('.birthday-title').forEach(el => {
    el.innerHTML = el.innerHTML.replace(/\[FRIEND_NAME\]/g, CONFIG.friendName);
  });
  document.title = `🎉 ${CONFIG.friendName}'s Birthday!`;

  //const msg = encodeURIComponent(CONFIG.whatsappMessage.replace('[FRIEND_NAME]', CONFIG.friendName));
  //waLink.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`;
}

// ─── HACKER SEQUENCE ─────────────────────────────────────────
function startHackerSequence() {
  let lineIndex = 0;

  function nextLine() {
    if (lineIndex >= TERMINAL_LINES.length) {
      // All lines done — wait then transition
      setTimeout(startTransition, HOLD_AFTER);
      return;
    }

    const { text, delay } = TERMINAL_LINES[lineIndex];
    lineIndex++;

    const now = Date.now();
    const wait = delay - (Date.now() - now);

    // Schedule this line
    setTimeout(() => {
      typeCharacters(text, () => {
        // Move completed line to output
        const span = document.createElement('span');
        span.className = 'line';
        span.textContent = '$ ' + text;
        termOutput.appendChild(span);
        currentLine.textContent = '';
        nextLine();
      });
    }, lineIndex === 1 ? delay : 0);
  }

  // Proper scheduling using absolute delays
  let scheduled = 0;
  TERMINAL_LINES.forEach((item, i) => {
    const startAt = item.delay;
    const typeDuration = item.text.length * CHAR_SPEED + 120;

    setTimeout(() => {
      typeCharacters(item.text, () => {
        const span = document.createElement('span');
        span.className = 'line';
        span.textContent = '$ ' + item.text;
        termOutput.appendChild(span);
        currentLine.textContent = '';

        if (i === TERMINAL_LINES.length - 1) {
          setTimeout(startTransition, HOLD_AFTER);
        }
      });
    }, startAt);
  });
}

// Type a string character by character into #current-line
function typeCharacters(text, onDone) {
  let i = 0;
  currentLine.textContent = '';

  const interval = setInterval(() => {
    if (i >= text.length) {
      clearInterval(interval);
      if (onDone) onDone();
      return;
    }
    currentLine.textContent += text[i];
    i++;
  }, CHAR_SPEED);
}

// ─── TRANSITION ───────────────────────────────────────────────
function startTransition() {
  // Flash white briefly
  glitchEl.style.display = 'block';
  glitchEl.classList.add('active');

  glitchEl.addEventListener('animationend', () => {
    glitchEl.style.display = 'none';
    glitchEl.classList.remove('active');
    showBirthdayScreen();
  }, { once: true });
}

// ─── BIRTHDAY SCREEN ─────────────────────────────────────────
function showBirthdayScreen() {
  hackerScreen.classList.remove('active');
  hackerScreen.style.display = 'none';

  birthdayScreen.style.display = 'block';

  // Trigger reflow for animation
  void birthdayScreen.offsetWidth;
  birthdayScreen.classList.add('active');

  // Show music button
  musicBtn.classList.add('visible');

  // Start confetti burst
  initConfetti();

  // Replace friend name in heading
  document.querySelectorAll('.friend-name').forEach(el => {
    el.textContent = CONFIG.friendName + "'s";
  });
}

// ─── CONFETTI ENGINE ─────────────────────────────────────────
function initConfetti() {
  const canvas  = document.getElementById('confetti-canvas');
  const ctx     = canvas.getContext('2d');
  const W       = canvas.width  = window.innerWidth;
  const H       = canvas.height = window.innerHeight;
  const COLORS  = ['#ff6eb4','#ffb347','#7ec8e3','#c9b3ff','#ff4757','#ffd32a','#2ed573'];
  const SHAPES  = ['rect', 'circle', 'star'];
  const COUNT   = 90;

  const particles = Array.from({ length: COUNT }, () => ({
    x:     Math.random() * W,
    y:     Math.random() * H * -1,
    size:  4 + Math.random() * 7,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    speed: 1.5 + Math.random() * 3.5,
    angle: Math.random() * Math.PI * 2,
    spin:  (Math.random() - 0.5) * 0.15,
    drift: (Math.random() - 0.5) * 1.5,
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.05 + Math.random() * 0.05,
  }));

  function drawStar(ctx, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const b = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
      ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
      ctx.lineTo(x + (r * 0.4) * Math.cos(b), y + (r * 0.4) * Math.sin(b));
    }
    ctx.closePath();
    ctx.fill();
  }

  let frame = 0;

  function render() {
    ctx.clearRect(0, 0, W, H);
    frame++;

    particles.forEach(p => {
      p.wobble += p.wobbleSpeed;
      p.y += p.speed;
      p.x += p.drift + Math.sin(p.wobble) * 0.8;
      p.angle += p.spin;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.88;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
      } else if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        drawStar(ctx, 0, 0, p.size / 1.5);
      }

      ctx.restore();

      // Recycle off-screen particles
      if (p.y > H + 20) {
        p.y = -10;
        p.x = Math.random() * W;
      }
    });

    // Slow down after initial burst (frame 300 ≈ 5s)
    if (frame < 300 || frame % 2 === 0) {
      confettiAnim = requestAnimationFrame(render);
    } else {
      // Very slow drizzle mode
      confettiAnim = requestAnimationFrame(render);
    }
  }

  render();
}

// ─── WISH BUTTON ─────────────────────────────────────────────
function handleWish() {
  wishPopup.classList.add('active');
}

function closePopup() {
  wishPopup.classList.remove('active');
}

// Close popup on overlay click
wishPopup.addEventListener('click', e => {
  if (e.target === wishPopup) closePopup();
});

// ─── MUSIC (Web Audio API tones, no external file needed) ─────
function toggleMusic() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    playHappyBirthdayTones();
    musicPlaying = true;
    musicBtn.textContent = '🎵';
  } else if (musicPlaying) {
    audioCtx.suspend();
    musicPlaying = false;
    musicBtn.textContent = '🔇';
  } else {
    audioCtx.resume();
    musicPlaying = true;
    musicBtn.textContent = '🎵';
  }
}

// Plays Happy Birthday melody using Web Audio API
function playHappyBirthdayTones() {
  if (!audioCtx) return;

  // Happy Birthday note sequence: [frequency, duration_beats]
  const notes = [
    [392,0.75],[392,0.25],[440,1],[392,1],[523,1],[494,2],
    [392,0.75],[392,0.25],[440,1],[392,1],[587,1],[523,2],
    [392,0.75],[392,0.25],[784,1],[659,1],[523,1],[494,1],[440,2],
    [698,0.75],[698,0.25],[659,1],[523,1],[587,1],[523,2],
  ];

  const BPM   = 140;
  const BEAT  = 60 / BPM;
  let   time  = audioCtx.currentTime + 0.1;

  function playNote(freq, dur) {
    const osc    = audioCtx.createOscillator();
    const gain   = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    filter.type      = 'lowpass';
    filter.frequency.value = 1200;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.18, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur * BEAT * 0.95);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(time);
    osc.stop(time + dur * BEAT);
    time += dur * BEAT;
  }

  notes.forEach(([f, d]) => playNote(f, d));

  // Loop after melody ends
  const totalDuration = notes.reduce((acc, [, d]) => acc + d * BEAT, 0);
  setTimeout(() => {
    if (musicPlaying && audioCtx) playHappyBirthdayTones();
  }, (totalDuration + 1.5) * 1000);
}

// ─── RESIZE handler ───────────────────────────────────────────
window.addEventListener('resize', () => {
  const canvas = document.getElementById('confetti-canvas');
  if (canvas) {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});