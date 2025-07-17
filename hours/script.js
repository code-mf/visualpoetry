class HoursVisualization {
  constructor() {
    this.hoursContainer = document.getElementById('hoursContainer');
    this.circles = [];
    
    this.init();
  }
  
  init() {
    this.createHourCircles();
    this.updateDisplay();
    
    // Update every minute
    setInterval(() => {
      this.updateDisplay();
    }, 60000);
    
    // Also update every 10 seconds for testing
    setInterval(() => {
      this.updateDisplay();
    }, 10000);
  }
  
  createHourCircles() {
    // Create 24 circles for 24 hours (0-23)
    for (let i = 0; i < 24; i++) {
      const circle = document.createElement('div');
      circle.className = 'hour-circle empty'; // Start with empty class
      circle.setAttribute('data-hour', i);
      
      this.hoursContainer.appendChild(circle);
      this.circles.push(circle);
    }
  }
  
  updateDisplay() {
    const now = new Date();
    const currentHour = now.getHours(); // 0-23
    
    // Update circles - fill the remaining hours (current hour onwards)
    this.circles.forEach((circle, index) => {
      // If this circle represents current hour or later, fill it
      if (index >= currentHour) {
        circle.classList.remove('empty');
        circle.classList.add('filled');
      } else {
        circle.classList.remove('filled');
        circle.classList.add('empty');
      }
    });
    
    // Console log for debugging (remove in production)
    console.log(`Current hour: ${currentHour}, Filled circles: ${currentHour}-23`);
  }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.hoursViz = new HoursVisualization();
});

// Handle visibility change to update when user returns to tab
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && window.hoursViz) {
    window.hoursViz.updateDisplay();
  }
});