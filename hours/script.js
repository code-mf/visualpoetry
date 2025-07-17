class HoursVisualization {
  constructor() {
    this.hoursContainer = document.getElementById('hoursContainer');
    this.timeDisplay = document.getElementById('timeDisplay');
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
      
      // Add hour number to circle
      const hourDisplay = i === 0 ? '12 AM' : 
                         i < 12 ? `${i} AM` : 
                         i === 12 ? '12 PM' : 
                         `${i - 12} PM`;
      
      circle.textContent = hourDisplay;
      
      this.hoursContainer.appendChild(circle);
      this.circles.push(circle);
    }
  }
  
  updateDisplay() {
    const now = new Date();
    const currentHour = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // Calculate how many hours are left in the day
    // Hours left = 24 - current hour - (if we've passed the current hour significantly)
    const hoursLeft = 24 - currentHour;
    
    // Update time display
    const timeString = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    const dateString = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    this.timeDisplay.innerHTML = `
      <div>${timeString}</div>
      <div style="font-size: 0.8em; opacity: 0.8; margin-top: 0.5em;">${dateString}</div>
      <div style="font-size: 0.7em; opacity: 0.6; margin-top: 0.5em;">${hoursLeft} hours remaining today</div>
    `;
    
    // Update circles
    this.circles.forEach((circle, index) => {
      const hour = index;
      
      // Logic: if the hour hasn't passed yet, it should be filled
      // If current hour is 14 (2 PM), then hours 14, 15, 16, ..., 23 should be filled
      if (hour >= currentHour) {
        circle.classList.remove('empty');
        circle.classList.add('filled');
      } else {
        circle.classList.remove('filled');
        circle.classList.add('empty');
      }
      
      // Add subtle animation based on how close we are to the current hour
      if (hour === currentHour) {
        // Current hour gets a subtle pulse
        const progress = (minutes * 60 + seconds) / 3600; // 0 to 1 through the hour
        const opacity = 0.7 + 0.3 * Math.sin(Date.now() / 1000); // Gentle pulse
        circle.style.opacity = opacity;
      } else {
        circle.style.opacity = 1;
      }
    });
  }
  
  // Method to get a nice color for each hour (optional enhancement)
  getHourColor(hour) {
    // Could implement different colors for different times of day
    // Morning (6-12): warm yellows/oranges
    // Afternoon (12-18): bright blues/whites  
    // Evening (18-24): cool purples/blues
    // Night (0-6): deep blues/blacks
    
    if (hour >= 6 && hour < 12) {
      return '#FFD700'; // Gold for morning
    } else if (hour >= 12 && hour < 18) {
      return '#87CEEB'; // Sky blue for afternoon
    } else if (hour >= 18 && hour < 24) {
      return '#9370DB'; // Medium purple for evening
    } else {
      return '#191970'; // Midnight blue for night
    }
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

// Store reference globally for potential debugging
document.addEventListener('DOMContentLoaded', () => {
  window.hoursViz = new HoursVisualization();
});