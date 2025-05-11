// src/components/HomePage.js
import React from 'react';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <div className="feature-container">
        <div className="feature-box feature-1">
          <h3>Health Tips</h3>
          <p>Get daily health tips to stay fit and healthy!</p>
        </div>
        <div className="feature-box feature-2">
          <h3>Book Appointment</h3>
          <p>Schedule an appointment with healthcare professionals.</p>
        </div>
      </div>

      <div className="feature-container">
        <div className="feature-box feature-3">
          <h3>Health Tracker</h3>
          <p>Track your health progress and monitor your fitness journey.</p>
        </div>
        <div className="feature-box feature-4">
          <h3>Emergency Services</h3>
          <p>Find emergency services near you quickly and easily.</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
