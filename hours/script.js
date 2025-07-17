class TimeVisualization {
  constructor() {
    this.container = document.getElementById('container');
    this.circles = [];
    this.init();
  }

  init() {
    this.createCircles();
    this.updateTime();
    
    // Update every minute
    setInterval(() => this.updateTime(), 60000);
    
    // Update every 5 seconds for testing
    setInterval(() => this.updateTime(), 5000);
  }

  createCircles() {
    // Clear container
    this.container.innerHTML = '';
    this.circles = [];
    
    // Create 24 circles (one for each hour: 0-23)
    for (let i = 0; i < 24; i++) {
      const circle = document.createElement('div');
      circle.className = 'circle empty';
      circle.dataset.hour = i;
      
      this.container.appendChild(circle);
      this.circles.push(circle);
    }
  }

  updateTime() {
    const now = new Date();
    const currentHour = now.getHours(); // 0-23
    const currentMinute = now.getMinutes();
    
    // Calculate remaining hours in the day (including current hour)
    const remainingHours = 24 - currentHour;
    
    // Update each circle
    this.circles.forEach((circle, index) => {
      if (index >= currentHour) {
        // This hour hasn't passed yet - fill it
        circle.className = 'circle filled';
      } else {
        // This hour has passed - leave it empty
        circle.className = 'circle empty';
      }
    });
    
    // Debug info
    console.log(`Time: ${currentHour}:${currentMinute.toString().padStart(2, '0')}`);
    console.log(`Current hour: ${currentHour}, Remaining hours: ${remainingHours}`);
    console.log(`Filled circles: ${currentHour} to 23 (${remainingHours} circles)`);
  }
}

// Start the visualization when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.timeViz = new TimeVisualization();
});

// Update when tab becomes visible again
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && window.timeViz) {
    window.timeViz.updateTime();
  }
});