import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import SymptomChecker from './components/SymptomChecker';
import SpecialistFinder from './components/SpecialistFinder';
import DiseaseResearch from './components/DiseaseResearch';



function App() {
  const [form, setForm] = useState(''); // To track which form (login/signup) to show
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const [userToken, setUserToken] = useState('');
  const [activeSection, setActiveSection] = useState(''); // To track which section is active

  const handleButtonClick = (formType) => {
    setForm(formType);
  };

  const handleLoginSuccess = (token) => {
    setIsLoggedIn(true);
    setUserToken(token);
  };

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  const handleBackToDashboard = () => {
    setActiveSection('');
  };

  return (
    <div className="App">
      {/* Initial page with background color */}
      {!isLoggedIn && (
        <div className="initial-page">
          <h1>Health Assistant</h1>
          <p className="tagline">Your health assistant is just a click away.</p>
          <div className="buttons">
            <button onClick={() => handleButtonClick('login')} className="btn">Login</button>
            <button onClick={() => handleButtonClick('signup')} className="btn">Sign Up</button>
          </div>
        </div>
      )}

      {/* Conditional rendering of forms based on button click */}
      {form === 'login' && !isLoggedIn && <LoginForm setMessage={setMessage} onLoginSuccess={handleLoginSuccess} />}
      {form === 'signup' && !isLoggedIn && <SignupForm setMessage={setMessage} />}

      {/* Displaying response message */}
      {message && <div className="response-message">{message}</div>}

      {/* Render the homepage after successful login */}
      {isLoggedIn && !activeSection && (
        <div className="home-page">
          <h2>Welcome to the Health Assistant Dashboard</h2>
          <div className="options-container">
            <div 
              className="option-card" 
              style={{ backgroundColor: '#FF8C00' }}
              onClick={() => handleSectionClick('symptoms')}
            >
              <h3>Check Symptoms</h3>
              <p>Find out what conditions you might have based on your symptoms.</p>
            </div>
            <div 
              className="option-card" 
              style={{ backgroundColor: '#20B2AA' }}
              onClick={() => handleSectionClick('specialists')}
            >
              <h3>Find Specialists</h3>
              <p>Get recommended specialists in your area based on the disease.</p>
            </div>
            <div 
              className="option-card" 
              style={{ backgroundColor: '#FFD700' }}
              onClick={() => handleSectionClick('research')}
            >
              <h3>Disease Research</h3>
              <p>Learn more details and the latest research about specific diseases.</p>
            </div>
            <div 
              className="option-card" 
              style={{ backgroundColor: '#8A2BE2' }}
              onClick={() => handleSectionClick('patientData')}
            >
              <h3>Past Patient Data</h3>
              <p>View summarized data from past patients on this disease.</p>
            </div>
          </div>
        </div>
      )}

      {/* Render the active section */}
      {isLoggedIn && activeSection && (
        <div className="section-container">
          <button className="back-button" onClick={handleBackToDashboard}>
            ← Back to Dashboard
          </button>
          
          {activeSection === 'symptoms' && <SymptomChecker userToken={userToken} />}
          
          {activeSection === 'specialists' && <SpecialistFinder userToken={userToken} />}
          
          {activeSection === 'research' && <DiseaseResearch userToken={userToken} />}
          
          {activeSection === 'patientData' && (
            <div className="placeholder-section">
              <h2>Past Patient Data</h2>
              <p>This feature is coming soon!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LoginForm({ setMessage, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password,
      });
      setMessage(response.data.message);

      if (response.data.success) {
        onLoginSuccess(response.data.token); // Call the parent function on login success
      }
    } catch (error) {
      console.error(error);
      setMessage('Error logging in');
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="submit-btn">Login</button>
      </form>
    </div>
  );
}

function SignupForm({ setMessage }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/signup', {
        name,
        email,
        password,
      });
      setMessage(response.data.message);
    } catch (error) {
      console.error(error);
      setMessage('Error signing up');
    }
  };

  return (
    <div className="form-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="submit-btn">Sign Up</button>
      </form>
    </div>
  );
}

// New DiseaseResearch component

export default App;