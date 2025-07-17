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
  }
  
  createHourCircles() {
    // Create 24 circles for 24 hours
    for (let i = 0; i < 24; i++) {
      const circle = document.createElement('div');
      circle.className = 'hour-circle';
      circle.setAttribute('data-hour', i);
      
      this.hoursContainer.appendChild(circle);
      this.circles.push(circle);
    }
  }
  
  updateDisplay() {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Calculate how many hours are left in the day (including current hour)
    const hoursRemaining = 24 - currentHour;
    
    // Update circles - only the remaining hours should be filled
    this.circles.forEach((circle, index) => {
      const hour = index;
      
      // If this hour is one of the remaining hours of the day, fill it
      if (hour >= currentHour) {
        circle.classList.remove('empty');
        circle.classList.add('filled');
      } else {
        circle.classList.remove('filled');
        circle.classList.add('empty');
      }
    });
  }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new HoursVisualization();
});

// Handle visibility change to update when user returns to tab
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    // Force update when tab becomes visible again
    setTimeout(() => {
      if (window.hoursViz) {
        window.hoursViz.updateDisplay();
      }
    }, 100);
  }
});

// Store reference globally
document.addEventListener('DOMContentLoaded', () => {
  window.hoursViz = new HoursVisualization();
});