// src/pages/History.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 
import '../styles/History.css'; 

const History = ({ onLoadHistory }) => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  // Effect to load history and remove entries older than 7 days
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('history')) || [];
    const oneWeekAgo = new Date().getTime() - (7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
  
    // Filter out old history
    const filteredHistory = savedHistory.filter(entry => 
      new Date(entry.timestamp).getTime() > oneWeekAgo
    );
    
    setHistory(filteredHistory);
  
    // Save the filtered history back to localStorage
    localStorage.setItem('history', JSON.stringify(filteredHistory));
  }, []);
  

  // Function to handle the clearing of history with confirmation
  const handleClearHistory = () => {
    const confirmClear = window.confirm('Are you sure you want to clear the history?');
    if (confirmClear) {
      localStorage.removeItem('history');
      setHistory([]);  // Clear the history in the state
      alert('History has been successfully cleared.');
    }
  };

  const handleLoad = (entry) => {
    if (onLoadHistory) {
      const adjustedEntry = {
        ...entry,
        requestData: {
          ...entry.requestData,
          volatility: parseFloat((entry.requestData.volatility * 100).toFixed(2)) / 100,
          interest_rate: parseFloat((entry.requestData.interest_rate * 100).toFixed(2)) / 100
        }
      };
      onLoadHistory(adjustedEntry);
      navigate('/modeling');
    }
  };

  return (
    <div>

      {/* Clear History Button */}
      <button className="clear-history-btn" onClick={handleClearHistory}>
        <svg viewBox="0 0 448 512" class="svgIcon"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"></path></svg>
      </button>
      <div>
        {history.length > 0 ? (
          history.map((entry, index) => (
            <div key={index} className="history-item">
              <span>
                Request {index + 1} | Model : {entry.models.join(", ")} | Current Price : $ {entry.requestData.current_price} | 
                Strike : $ {entry.requestData.strike} | Time to Maturity : {entry.requestData.time_to_maturity} y | 
                Volatility : {(entry.requestData.volatility * 100).toFixed(2)} % | Interest Rate : {(entry.requestData.interest_rate * 100).toFixed(2)} %
              </span>
              <button className="load-request-btn" onClick={() => handleLoad(entry)}>Load Request</button>
            </div>
          ))
        ) : (
          <p>No requests saved yet.</p>
        )}
      </div>
    </div>
  );
};

export default History;
