class MinutesVisualization {
  constructor() {
    this.container = document.getElementById('container');
    this.circles = [];
    this.init();
  }

  init() {
    this.createCircles();
    this.updateTime();
    
    // Update every second for real-time minute tracking
    setInterval(() => this.updateTime(), 1000);
  }

  createCircles() {
    // Clear container
    this.container.innerHTML = '';
    this.circles = [];
    
    // Create 60 circles (one for each minute: 0-59)
    for (let i = 0; i < 60; i++) {
      const circle = document.createElement('div');
      circle.className = 'circle empty';
      circle.dataset.minute = i;
      
      this.container.appendChild(circle);
      this.circles.push(circle);
    }
  }

  updateTime() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    // Calculate remaining minutes in the current hour (including current minute)
    const remainingMinutes = 60 - currentMinute;
    
    // Update each circle
    this.circles.forEach((circle, index) => {
      if (index >= currentMinute) {
        // This minute hasn't passed yet - fill it
        circle.className = 'circle filled';
      } else {
        // This minute has passed - leave it empty
        circle.className = 'circle empty';
      }
    });
    
    // Debug info
    const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}:${currentSecond.toString().padStart(2, '0')}`;
    console.log(`Time: ${timeString}`);
    console.log(`Current minute: ${currentMinute}, Remaining minutes: ${remainingMinutes}`);
    console.log(`Filled circles: ${currentMinute} to 59 (${remainingMinutes} circles)`);
  }
}

// Start the visualization when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.minutesViz = new MinutesVisualization();
});

// Update when tab becomes visible again
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && window.minutesViz) {
    window.minutesViz.updateTime();
  }
});