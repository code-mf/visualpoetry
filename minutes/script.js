class DayMinutesVisualization {
  constructor() {
    this.container = document.getElementById('container');
    this.minutes = [];
    this.init();
  }

  init() {
    this.createMinutes();
    this.updateTime();
    
    // Update every second for real-time tracking
    setInterval(() => this.updateTime(), 1000);
  }

  createMinutes() {
    // Clear container
    this.container.innerHTML = '';
    this.minutes = [];
    
    // Create 1,440 minutes (24 hours × 60 minutes)
    for (let i = 0; i < 1440; i++) {
      const minute = document.createElement('div');
      minute.className = 'minute empty';
      minute.dataset.minute = i;
      
      // Calculate hour and minute for this index
      const hour = Math.floor(i / 60);
      const min = i % 60;
      minute.title = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      
      this.container.appendChild(minute);
      this.minutes.push(minute);
    }
  }

  updateTime() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    // Calculate current minute index (0-1439)
    const currentMinuteIndex = (currentHour * 60) + currentMinute;
    
    // Calculate remaining minutes in the day
    const remainingMinutes = 1440 - currentMinuteIndex;
    
    // Update each minute circle
    this.minutes.forEach((minute, index) => {
      if (index === currentMinuteIndex) {
        // Current minute - special highlight
        minute.className = 'minute current';
      } else if (index > currentMinuteIndex) {
        // Future minutes - filled
        minute.className = 'minute filled';
      } else {
        // Past minutes - empty
        minute.className = 'minute empty';
      }
    });
    
    // Debug info
    const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}:${currentSecond.toString().padStart(2, '0')}`;
    console.log(`Time: ${timeString}`);
    console.log(`Current minute index: ${currentMinuteIndex} of 1440`);
    console.log(`Minutes passed: ${currentMinuteIndex}, Minutes remaining: ${remainingMinutes}`);
    console.log(`Progress: ${((currentMinuteIndex / 1440) * 100).toFixed(2)}% of day complete`);
  }
}

// Start the visualization when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.dayMinutesViz = new DayMinutesVisualization();
});

// Update when tab becomes visible again
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && window.dayMinutesViz) {
    window.dayMinutesViz.updateTime();
  }
});