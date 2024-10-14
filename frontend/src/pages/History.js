// src/pages/History.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import '../App.css'; 
import '../styles/History.css'; 

const History = ({ onLoadHistory }) => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('history')) || [];
    setHistory(savedHistory);
  }, []);

  const handleLoad = (entry) => {
    if (onLoadHistory) {
      // Adjust the data to round the values before sending to the form
      const adjustedEntry = {
        ...entry,
        requestData: {
          ...entry.requestData,
          volatility: parseFloat((entry.requestData.volatility * 100).toFixed(2)) / 100, 
          interest_rate: parseFloat((entry.requestData.interest_rate * 100).toFixed(2)) / 100
        }
      };
      onLoadHistory(adjustedEntry);  // Transmit request data to parent
      navigate('/modeling');  // Navigate to the modeling page
    }
  };

  return (
    <div>
      <h2>Request History</h2>
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
