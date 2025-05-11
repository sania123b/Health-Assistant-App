import React, { useState } from 'react';
import axios from 'axios';
import './DiseaseResearch.css';

function DiseaseResearch({ userToken }) {
  const [disease, setDisease] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [research, setResearch] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!disease.trim()) {
      setError('Please enter a disease name');
      return;
    }

    setIsLoading(true);
    setError('');
    setResearch(null);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/disease-research',
        { disease },
        {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        }
      );

      if (response.data.success) {
        setResearch(response.data.research);
      } else {
        setError(response.data.message || 'Error fetching disease information');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to fetch disease information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDisease('');
    setResearch(null);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' }); // smooth scroll to top
  };

  return (
    <div className="disease-research-container">
      <h2>Disease Research</h2>
      <p className="instruction-text">Enter a disease name to learn more about it:</p>

      {!research ? (
        <>
          <form onSubmit={handleSubmit} className="research-form">
            <div className="input-group">
              <input
                type="text"
                className="disease-input"
                value={disease}
                onChange={(e) => setDisease(e.target.value)}
                placeholder="e.g., Diabetes, Hypertension, Asthma"
                required
              />
            </div>
            <div className="button-group">
              <button
                type="submit"
                className="research-button"
                disabled={isLoading}
              >
                {isLoading ? 'Researching...' : 'Get Information'}
              </button>
              <button
                type="button"
                className="reset-button"
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset
              </button>
            </div>
          </form>

          {error && (
            <div className="error-message">
              <span>{error}</span>
              <button
                className="try-again-button"
                onClick={() => setError('')}
              >
                Try Again
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="research-results">
          <div className="research-header">
            <h3>Research about {disease}</h3>
          </div>

          <div
            className="research-content"
            dangerouslySetInnerHTML={{ __html: research.replace(/\n/g, '<br />') }}
          />

          <div className="floating-reset">
            <button
              className="round-reset-button"
              onClick={handleReset}
              title="Search another"
            >
              🔄
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiseaseResearch;
