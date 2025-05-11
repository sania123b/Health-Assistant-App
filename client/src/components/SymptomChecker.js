import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SymptomChecker.css';

function SymptomChecker({ userToken }) {
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeDisease, setActiveDisease] = useState(null);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState('');

  // Fetch symptoms from API
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        setLoading(true);
        setCurrentLoadingMessage('Loading symptoms...');
        const response = await axios.get('http://localhost:5000/api/symptoms', {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        
        if (response.data.success) {
          setSymptoms(response.data.symptoms);
        } else {
          setError(response.data.message || 'Failed to load symptoms');
        }
      } catch (err) {
        handleApiError(err);
      } finally {
        setLoading(false);
        setCurrentLoadingMessage('');
      }
    };

    fetchSymptoms();
  }, [userToken]);

  const handleApiError = (err) => {
    if (err.response) {
      setError(err.response.data.message || 'Request failed');
    } else if (err.request) {
      setError('No response from server. Please try again.');
    } else {
      setError('Error: ' + err.message);
    }
    console.error('API Error:', err);
  };

  const toggleSymptom = (symptomId) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(id => id !== symptomId) 
        : [...prev, symptomId]
    );
    setResults(null);
    setActiveDisease(null);
  };

  const checkSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom');
      return;
    }

    try {
      setLoading(true);
      setCurrentLoadingMessage('Analyzing symptoms...');
      setError('');
      
      const response = await axios.post(
        'http://localhost:5000/api/check-symptoms', 
        { selectedSymptoms },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      if (response.data.success) {
        setResults(response.data.possibleConditions);
      } else {
        setError(response.data.message || 'Analysis failed');
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
      setCurrentLoadingMessage('');
    }
  };

  const getDiseaseDetails = async (diseaseName) => {
    try {
      setLoading(true);
      setCurrentLoadingMessage('Loading disease details...');
      
      const response = await axios.get(
        `http://localhost:5000/api/disease/${encodeURIComponent(diseaseName)}`, 
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      if (response.data.success) {
        setActiveDisease(response.data.disease);
      } else {
        setError(response.data.message || 'Failed to load details');
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
      setCurrentLoadingMessage('');
    }
  };

  const backToResults = () => setActiveDisease(null);
  const resetChecker = () => {
    setSelectedSymptoms([]);
    setResults(null);
    setActiveDisease(null);
    setError('');
  };

  return (
    <div className="symptom-checker">
      <button 
        className="back-button"
        onClick={() => window.history.back()}
        disabled={loading}
      >
        ← Back
      </button>

      <h2>Symptom Checker</h2>
      
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">{currentLoadingMessage}</div>}
      
      {!results && !activeDisease && (
        <>
          <p>Select all symptoms you are experiencing:</p>
          
          {symptoms.length === 0 && !loading && (
            <div className="empty-message">No symptoms available</div>
          )}
          
          <div className="symptoms-list">
            {symptoms.map(symptom => (
              <div 
                key={symptom.id} 
                className={`symptom-item ${selectedSymptoms.includes(symptom.id) ? 'selected' : ''}`}
                onClick={() => toggleSymptom(symptom.id)}
              >
                {symptom.name}
              </div>
            ))}
          </div>
          
          {selectedSymptoms.length > 0 && (
            <div className="selected-count">
              {selectedSymptoms.length} symptom(s) selected
            </div>
          )}
          
          <button 
            className="check-button"
            onClick={checkSymptoms}
            disabled={selectedSymptoms.length === 0 || loading}
          >
            {loading ? 'Processing...' : 'Check Symptoms'}
          </button>
        </>
      )}
      
      {results && !activeDisease && (
        <div className="results-container">
          <h3>Possible Conditions</h3>
          <p>Based on your symptoms, you might have:</p>
          
          <div className="results-list">
            {results.map((result, index) => (
              <div key={index} className="result-item">
                <div className="result-header">
                  <h4>{result.name}</h4>
                  <span className="match-percentage">{result.matchPercentage}% match</span>
                </div>
                <p className="disease-description">{result.description}</p>
                <button 
                  className="details-button"
                  onClick={() => getDiseaseDetails(result.name)}
                  disabled={loading}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
          
          <button className="reset-button" onClick={resetChecker} disabled={loading}>
            Check Different Symptoms
          </button>
        </div>
      )}
      
      {activeDisease && (
        <div className="disease-details">
          <button className="back-button" onClick={backToResults} disabled={loading}>
            ← Back to Results
          </button>
          
          <h3>{activeDisease.name}</h3>
          <p className="disease-description">{activeDisease.description}</p>
          
          <div className="details-section">
            <h4>Common Symptoms</h4>
            <ul>
              {activeDisease.symptoms?.map((symptom, index) => (
                <li key={index}>{symptom}</li>
              ))}
            </ul>
          </div>
          
          <div className="details-section">
            <h4>Recommended Treatments</h4>
            <ul>
              {activeDisease.treatments?.map((treatment, index) => (
                <li key={index}>{treatment}</li>
              ))}
            </ul>
          </div>
          
          <div className="details-section">
            <h4>Specialists to Consult</h4>
            <ul>
              {activeDisease.specialists?.map((specialist, index) => (
                <li key={index}>{specialist}</li>
              ))}
            </ul>
          </div>
          
          <div className="action-buttons">
            <button className="reset-button" onClick={resetChecker} disabled={loading}>
              Check Different Symptoms
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SymptomChecker;