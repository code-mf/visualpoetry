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
    
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0; // Start silent
    
    this.brownNoise.connect(filter);
    filter.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    
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
    const left = x - size / 2;
    const top = y - size / 2;
    
    circle.style.left = left + 'px';
    circle.style.top = top + 'px';
    circle.style.width = size + 'px';
    circle.style.height = size + 'px';
    circle.style.background = '#A8D5BA'; // Solid blue color
    
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
    
    // Start audio when first circle is created
    if (this.circles.length === 1 && this.gainNode) {
      this.gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
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
          this.easeInOut(progress, 0.1, 0.3) : 
          this.easeInOut(progress, 0.3, 0.1);
        
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