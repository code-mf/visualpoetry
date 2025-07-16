class InteractiveBreathingApp {
  constructor() {
    this.circles = [];
    this.audioContext = null;
    this.brownNoise = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.breathPhase = 'inhale'; // 'inhale' or 'exhale'
    this.breathTime = 5000; // 5 seconds per phase
    this.lastBreathTime = Date.now();
    this.baseSize = 200;
    this.minSize = 100;
    this.maxSize = 400;
    this.CURSOR_PCT = 0.0333; // 3.33% of smaller dimension
    
    this.init();
  }

  init() {
    this.setupAudio();
    this.setupEventListeners();
    this.setupCursors();
    this.startBreathingCycle();
  }

  setupAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.createBrownNoise();
    } catch (error) {
      console.log('Audio not supported');
    }
  }

  makeCursor(color) {
    const minDim = Math.min(window.innerWidth, window.innerHeight);
    let diameter = Math.round(minDim * this.CURSOR_PCT);
    if (diameter % 2 !== 0) diameter += 1; // ensure even
    const radius = diameter / 2;
    // SVG with center at (radius, radius), viewBox, and geometricPrecision
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${diameter}" height="${diameter}" viewBox="0 0 ${diameter} ${diameter}" shape-rendering="geometricPrecision"><circle cx="${radius}" cy="${radius}" r="${radius}" fill="${color}"/></svg>`;
    return `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}') ${radius} ${radius}, auto`;
  }

  setupCursors() {
    const body = document.body;
    body.style.cursor = this.makeCursor('#A7C7E7'); // blue dot for background
    
    // Set cursor for all existing circles
    this.circles.forEach(circle => {
      circle.element.style.cursor = this.makeCursor('#B7E7A7'); // green dot for circles
    });
  }

  createBrownNoise() {
    let bufferSize = 2 * this.audioContext.sampleRate;
    let noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    let output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      let white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }
    let noise = this.audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    let gain = this.audioContext.createGain();
    gain.gain.value = 0; // Start silent
    noise.connect(gain).connect(this.audioContext.destination);
    noise.start(0);
    this.brownNoise = noise;
    this.gainNode = gain;
    this.isPlaying = true;
  }

  setupEventListeners() {
    // Click to create circles
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('breath-circle')) {
        // Click on existing circle - delete it
        this.deleteCircle(e.target);
      } else if (e.target === document.body) {
        // Click on background - create new circle
        this.createCircle(e.clientX, e.clientY);
      }
    });

    // Middle mouse wheel to scale circles
    document.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        const circle = this.findCircleAtPosition(e.clientX, e.clientY);
        if (circle) {
          e.preventDefault();
          this.scaleCircle(circle, e.deltaY > 0 ? -1 : 1);
        }
      }
    });

    // Prevent context menu on right click
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Update cursors on resize
    window.addEventListener('resize', () => {
      this.setupCursors();
    });
  }

  createCircle(x, y) {
    const circle = document.createElement('div');
    circle.className = 'breath-circle';
    
    // Set initial position (centered on click)
    const size = this.baseSize;
    const left = x - size / 2;
    const top = y - size / 2;
    
    circle.style.left = left + 'px';
    circle.style.top = top + 'px';
    circle.style.width = size + 'px';
    circle.style.height = size + 'px';
    circle.style.background = '#A7C7E7'; // Solid blue color (same as original)
    
    // Store circle data with fixed center position
    const circleData = {
      element: circle,
      centerX: x,
      centerY: y,
      size: size,
      scale: 1
    };
    
    this.circles.push(circleData);
    document.body.appendChild(circle);
    
    // Set cursor for the new circle
    circle.style.cursor = this.makeCursor('#B7E7A7'); // green dot for circles
    
    // Start audio when first circle is created
    if (this.circles.length === 1 && this.gainNode) {
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      this.gainNode.gain.setValueAtTime(0.12, this.audioContext.currentTime);
    }
    
    return circleData;
  }

  deleteCircle(circleElement) {
    const index = this.circles.findIndex(circle => circle.element === circleElement);
    if (index !== -1) {
      this.circles.splice(index, 1);
      circleElement.remove();
      
      // Stop audio when all circles are deleted
      if (this.circles.length === 0 && this.gainNode) {
        this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      }
    }
  }

  findCircleAtPosition(x, y) {
    return this.circles.find(circle => {
      const rect = circle.element.getBoundingClientRect();
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    });
  }

  scaleCircle(circle, direction) {
    const scaleChange = 0.1;
    circle.scale += direction * scaleChange;
    circle.scale = Math.max(0.5, Math.min(2, circle.scale)); // Limit scale between 0.5x and 2x
    
    const newSize = this.baseSize * circle.scale;
    circle.size = newSize;
    circle.element.style.width = newSize + 'px';
    circle.element.style.height = newSize + 'px';
    
    // Keep the circle centered at its original position
    const newLeft = circle.centerX - newSize / 2;
    const newTop = circle.centerY - newSize / 2;
    circle.element.style.left = newLeft + 'px';
    circle.element.style.top = newTop + 'px';
  }

  startBreathingCycle() {
    const animate = () => {
      const currentTime = Date.now();
      const timeSinceLastBreath = currentTime - this.lastBreathTime;
      const progress = timeSinceLastBreath / this.breathTime;
      
      if (progress >= 1) {
        // Switch breath phase
        this.breathPhase = this.breathPhase === 'inhale' ? 'exhale' : 'inhale';
        this.lastBreathTime = currentTime;
      }
      
      // Update all circles
      this.circles.forEach(circle => {
        this.updateCircle(circle, progress);
      });
      
      // Update audio volume
      if (this.gainNode && this.circles.length > 0) {
        const volume = this.breathPhase === 'inhale' ? 
          this.easeInOut(progress, 0.02, 0.12) : 
          this.easeInOut(progress, 0.12, 0.02);
        
        this.gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  updateCircle(circle, progress) {
    const baseSize = this.baseSize * circle.scale;
    const minSize = this.minSize * circle.scale;
    const maxSize = this.maxSize * circle.scale;
    
    let currentSize;
    if (this.breathPhase === 'inhale') {
      currentSize = this.easeInOut(progress, minSize, maxSize);
    } else {
      currentSize = this.easeInOut(progress, maxSize, minSize);
    }
    
    circle.element.style.width = currentSize + 'px';
    circle.element.style.height = currentSize + 'px';
    
    // Keep the circle centered at its original position
    const newLeft = circle.centerX - currentSize / 2;
    const newTop = circle.centerY - currentSize / 2;
    circle.element.style.left = newLeft + 'px';
    circle.element.style.top = newTop + 'px';
  }



  easeInOut(t, start, end) {
    const change = end - start;
    return start + change * (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new InteractiveBreathingApp();
}); 