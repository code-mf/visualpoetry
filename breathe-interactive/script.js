class InteractiveBreathingApp {
  constructor() {
    this.circles = [];
    this.audioContext = null;
    this.brownNoise = null;
    this.isPlaying = false;
    this.breathPhase = 'inhale'; // 'inhale' or 'exhale'
    this.breathTime = 5000; // 5 seconds per phase
    this.lastBreathTime = Date.now();
    this.baseSize = 200;
    this.minSize = 100;
    this.maxSize = 400;
    
    this.init();
  }

  init() {
    this.setupAudio();
    this.setupEventListeners();
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

  createBrownNoise() {
    const bufferSize = 4096;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    this.brownNoise = this.audioContext.createBufferSource();
    this.brownNoise.buffer = noiseBuffer;
    this.brownNoise.loop = true;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 100;
    filter.Q.value = 1;
    
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0.1;
    
    this.brownNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    this.brownNoise.start();
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
  }

  createCircle(x, y) {
    const circle = document.createElement('div');
    circle.className = 'breath-circle';
    
    // Set initial position (centered on click)
    const size = this.baseSize;
    circle.style.left = (x - size / 2) + 'px';
    circle.style.top = (y - size / 2) + 'px';
    circle.style.width = size + 'px';
    circle.style.height = size + 'px';
    
    // Set initial background color based on current breath phase
    const progress = (Date.now() - this.lastBreathTime) / this.breathTime;
    const color = this.getBreathColor(progress);
    circle.style.background = color;
    
    // Store circle data
    const circleData = {
      element: circle,
      x: x - size / 2,
      y: y - size / 2,
      size: size,
      scale: 1
    };
    
    this.circles.push(circleData);
    document.body.appendChild(circle);
    
    return circleData;
  }

  deleteCircle(circleElement) {
    const index = this.circles.findIndex(circle => circle.element === circleElement);
    if (index !== -1) {
      this.circles.splice(index, 1);
      circleElement.remove();
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
    
    // Adjust position to keep center
    const rect = circle.element.getBoundingClientRect();
    circle.x = rect.left;
    circle.y = rect.top;
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
      if (this.brownNoise && this.isPlaying) {
        const volume = this.breathPhase === 'inhale' ? 
          this.easeInOut(progress, 0.1, 0.3) : 
          this.easeInOut(progress, 0.3, 0.1);
        
        if (this.brownNoise.gain) {
          this.brownNoise.gain.value = volume;
        }
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
    
    // Update position to keep center
    const sizeDiff = currentSize - baseSize;
    circle.element.style.left = (circle.x - sizeDiff / 2) + 'px';
    circle.element.style.top = (circle.y - sizeDiff / 2) + 'px';
    
    // Update color
    const color = this.getBreathColor(progress);
    circle.element.style.background = color;
  }

  getBreathColor(progress) {
    const inhaleColor = '#A8D5BA'; // Soft green
    const exhaleColor = '#B7E7A7'; // Lighter green
    
    if (this.breathPhase === 'inhale') {
      return this.interpolateColor(exhaleColor, inhaleColor, progress);
    } else {
      return this.interpolateColor(inhaleColor, exhaleColor, progress);
    }
  }

  interpolateColor(color1, color2, factor) {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `rgb(${r}, ${g}, ${b})`;
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