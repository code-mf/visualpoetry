// Minimal Breathing App with Brown Noise (toggle play/pause on click, responsive circle, static green/blue, pronounced ease in/out, responsive cursor, improved roundness)

const CIRCLE_COLOR = '#A7C7E7'; // soft blue
const BG_CURSOR_COLOR = '#A7C7E7'; // blue dot for background
const CIRCLE_CURSOR_COLOR = '#B7E7A7'; // green dot for circle
const IN_DURATION = 5500; // 5.5 seconds
const OUT_DURATION = 5500; // 5.5 seconds
const MAX_GAIN = 0.12;
const MIN_GAIN = 0.02;
const CURSOR_PCT = 0.0333; // 3.33% of smaller dimension

let running = false;
let started = false;
let phase = 'in'; // 'in' or 'out'
let phaseStart = null;
let animationFrame = null;
let audioCtx = null;
let noiseSource = null;
let noiseGain = null;
let pauseTime = null; // time when paused

const circle = document.getElementById('breathCircle');
const body = document.body;

function getResponsiveSizes() {
  const minDim = Math.min(window.innerWidth, window.innerHeight);
  return {
    min: minDim * 0.25,
    max: minDim * 0.75
  };
}

function setCircleSize(size) {
  circle.style.width = size + 'px';
  circle.style.height = size + 'px';
}

function setCircleColor(color) {
  circle.style.background = color;
}

function makeCursor(color) {
  const minDim = Math.min(window.innerWidth, window.innerHeight);
  let diameter = Math.round(minDim * CURSOR_PCT);
  if (diameter % 2 !== 0) diameter += 1; // ensure even
  const radius = diameter / 2;
  // SVG with center at (radius, radius), viewBox, and geometricPrecision
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${diameter}" height="${diameter}" viewBox="0 0 ${diameter} ${diameter}" shape-rendering="geometricPrecision"><circle cx="${radius}" cy="${radius}" r="${radius}" fill="${color}"/></svg>`;
  return `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}') ${radius} ${radius}, auto`;
}

function setCursors() {
  body.style.cursor = makeCursor(BG_CURSOR_COLOR);
  circle.style.cursor = makeCursor(CIRCLE_CURSOR_COLOR);
}

function playBrownNoise() {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  let bufferSize = 2 * audioCtx.sampleRate;
  let noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  let output = noiseBuffer.getChannelData(0);
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    let white = Math.random() * 2 - 1;
    output[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5;
  }
  let noise = audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  let gain = audioCtx.createGain();
  gain.gain.value = MAX_GAIN;
  noise.connect(gain).connect(audioCtx.destination);
  noise.start(0);
  noiseSource = noise;
  noiseGain = gain;
}

function stopBrownNoise() {
  if (noiseSource) {
    try { noiseSource.stop(); } catch (e) {}
    noiseSource.disconnect();
    noiseSource = null;
  }
}

function pronouncedEaseInOut(t) {
  // Cubic ease in/out: more pronounced lingering at ends
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function setNoiseVolume(t, phase) {
  // t: 0-1, phase: 'in' or 'out'
  // For in-breath: fade up (MIN_GAIN to MAX_GAIN)
  // For out-breath: fade down (MAX_GAIN to MIN_GAIN)
  if (!noiseGain) return;
  let gain;
  if (phase === 'in') {
    gain = MIN_GAIN + (MAX_GAIN - MIN_GAIN) * t;
  } else {
    gain = MAX_GAIN - (MAX_GAIN - MIN_GAIN) * t;
  }
  noiseGain.gain.value = gain;
}

function getPhaseProgress(now) {
  let duration = phase === 'in' ? IN_DURATION : OUT_DURATION;
  let elapsed = now - phaseStart;
  return Math.min(elapsed / duration, 1);
}

function animatePhase() {
  if (!running) return;
  const now = Date.now();
  let duration = phase === 'in' ? IN_DURATION : OUT_DURATION;
  const { min: MIN_SIZE, max: MAX_SIZE } = getResponsiveSizes();
  let fromSize = phase === 'in' ? MIN_SIZE : MAX_SIZE;
  let toSize = phase === 'in' ? MAX_SIZE : MIN_SIZE;
  let t = getPhaseProgress(now);
  let easedT = pronouncedEaseInOut(t);
  let size = fromSize + (toSize - fromSize) * easedT;
  setCircleSize(size);
  setCircleColor(CIRCLE_COLOR);
  setNoiseVolume(easedT, phase);
  if (t >= 1) {
    // Switch phase
    phase = phase === 'in' ? 'out' : 'in';
    phaseStart = now;
  }
  animationFrame = requestAnimationFrame(animatePhase);
}

function startBreathing(resume = false) {
  running = true;
  if (!resume) {
    phase = 'in';
    phaseStart = Date.now();
    const { min: MIN_SIZE } = getResponsiveSizes();
    setCircleSize(MIN_SIZE);
    setCircleColor(CIRCLE_COLOR);
  } else if (pauseTime) {
    // Adjust phaseStart so progress resumes from where it left off
    const now = Date.now();
    phaseStart = now - pauseTime;
  }
  playBrownNoise();
  animatePhase();
}

function pauseBreathing() {
  running = false;
  cancelAnimationFrame(animationFrame);
  stopBrownNoise();
  // Save progress in phase
  pauseTime = Date.now() - phaseStart;
}

// Initial state: small circle, blue
setCircleSize(getResponsiveSizes().min);
setCircleColor(CIRCLE_COLOR);
setCursors();

body.addEventListener('click', () => {
  if (!started) {
    started = true;
    startBreathing();
  } else if (!running) {
    // Resume
    startBreathing(true);
  } else {
    // Pause
    pauseBreathing();
  }
});

// Update circle size and cursor on resize if not animating
window.addEventListener('resize', () => {
  setCursors();
  if (!running) {
    setCircleSize(getResponsiveSizes().min);
  }
}); 