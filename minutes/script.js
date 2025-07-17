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
    
    // Update every second for smooth fading
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
        const minuteIndex = row * this.cols + col;
        
        // Only create circles for valid minutes (0-1439)
        if (minuteIndex < this.totalMinutes) {
          const minute = document.createElement('div');
          minute.className = 'minute past';
          minute.dataset.index = minuteIndex;
          
          // Calculate hour and minute for tooltip
          const hour = Math.floor(minuteIndex / 60);
          const min = minuteIndex % 60;
          minute.title = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
          
          rowElement.appendChild(minute);
          rowMinutes.push(minute);
        }
      }
      
      this.container.appendChild(rowElement);
      this.minutes.push(rowMinutes);
    }
  }

  updateTime() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    // Calculate current minute index (0-1439)
    const currentMinuteIndex = currentHour * 60 + currentMinute;
    
    // Calculate how much of the current minute has passed (0-1)
    const secondsProgress = currentSecond / 60;
    
    // Calculate opacity for current minute (fade from 1 to 0)
    const currentMinuteOpacity = 1 - secondsProgress;
    
    console.log(`Time: ${currentHour}:${currentMinute.toString().padStart(2, '0')}:${currentSecond.toString().padStart(2, '0')}`);
    console.log(`Current minute index: ${currentMinuteIndex}, Opacity: ${currentMinuteOpacity.toFixed(2)}`);
    console.log(`Remaining minutes in day: ${1440 - currentMinuteIndex - 1}`);
    
    // Update all minute circles
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const minuteIndex = row * this.cols + col;
        
        if (minuteIndex < this.totalMinutes && this.minutes[row] && this.minutes[row][col]) {
          const minuteElement = this.minutes[row][col];
          
          // Remove all state classes
          minuteElement.classList.remove('past', 'current', 'future');
          
          if (minuteIndex < currentMinuteIndex) {
            // Past minutes: stroke only
            minuteElement.classList.add('past');
            minuteElement.style.opacity = '';
          } else if (minuteIndex === currentMinuteIndex) {
            // Current minute: fading from white to transparent
            minuteElement.classList.add('current');
            minuteElement.style.opacity = currentMinuteOpacity;
          } else {
            // Future minutes (remaining minutes): filled white
            minuteElement.classList.add('future');
            minuteElement.style.opacity = '';
          }
        }
      }
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MinutesVisualization();
});