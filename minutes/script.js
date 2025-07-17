class MinutesVisualization {
  constructor() {
    this.container = document.getElementById('container');
    this.minutes = [];
    this.rows = 30;
    this.cols = 48;
    this.totalMinutes = 1440; // 24 hours * 60 minutes
    
    this.init();
  }

  init() {
    this.createGrid();
    this.updateTime();
    
    // Update every second
    setInterval(() => this.updateTime(), 1000);
  }

  createGrid() {
    // Clear container
    this.container.innerHTML = '';
    this.minutes = [];
    
    // Create grid using nested loops
    for (let row = 0; row < this.rows; row++) {
      const rowElement = document.createElement('div');
      rowElement.className = 'row';
      
      const rowMinutes = [];
      
      for (let col = 0; col < this.cols; col++) {
        const minuteIndex = (row * this.cols) + col;
        
        // Only create if we haven't exceeded total minutes in a day
        if (minuteIndex < this.totalMinutes) {
          const minute = document.createElement('div');
          minute.className = 'minute';
          minute.dataset.index = minuteIndex;
          
          // Calculate time for tooltip
          const hour = Math.floor(minuteIndex / 60);
          const min = minuteIndex % 60;
          minute.title = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
          
          rowElement.appendChild(minute);
          rowMinutes.push(minute);
        }
      }
      
      if (rowMinutes.length > 0) {
        this.container.appendChild(rowElement);
        this.minutes.push(...rowMinutes);
      }
    }
  }

  updateTime() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    // Calculate current minute index (0-1439)
    const currentMinuteIndex = (currentHour * 60) + currentMinute;
    
    // Calculate remaining minutes including current minute
    const remainingMinutes = this.totalMinutes - currentMinuteIndex;
    
    // Calculate fade for current minute (optional)
    const fadeProgress = currentSecond / 60;
    const opacity = 1.0 - (fadeProgress * 0.5); // Fade from 1.0 to 0.5
    
    // Update each minute circle
    this.minutes.forEach((minute, index) => {
      if (index < currentMinuteIndex) {
        // Past minutes - stroke only (empty)
        minute.className = 'minute';
        minute.style.opacity = '';
      } else if (index === currentMinuteIndex) {
        // Current minute - highlighted with optional fade
        minute.className = 'minute current';
        minute.style.opacity = opacity.toFixed(2);
      } else {
        // Future/remaining minutes - filled
        minute.className = 'minute filled';
        minute.style.opacity = '';
      }
    });
    
    // Debug info
    const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}:${currentSecond.toString().padStart(2, '0')}`;
    console.log(`Time: ${timeString}`);
    console.log(`Current minute: ${currentMinuteIndex} of ${this.totalMinutes}`);
    console.log(`Remaining minutes: ${remainingMinutes} (including current)`);
    console.log(`Progress: ${((currentMinuteIndex / this.totalMinutes) * 100).toFixed(1)}% of day complete`);
  }
}

// Start when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.minutesViz = new MinutesVisualization();
});

// Update when tab becomes visible
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && window.minutesViz) {
    window.minutesViz.updateTime();
  }
});