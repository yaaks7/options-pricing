// src/pages/Documentation.js
import React from 'react';
import '../styles/Documentations.css';  
import { Link } from 'react-router-dom';

const Documentation = () => {
  return (
    <div>
      <h1 className="doc-title">Options Pricing Models Documentation</h1>
      <div className="doc-container">

        <div className="doc-grid">
          <div className="doc-item">
            <h3>Black-Scholes</h3>
            <p>A model used to determine the price of options, assuming constant volatility and no dividends.</p>
            <Link to="/documentation/black-scholes">
              <button className="doc-button">Learn More</button>
            </Link>
          </div>

          <div className="doc-item">
            <h3>Binomial</h3>
            <p>A model that uses a binomial tree to estimate the price of options by simulating multiple future outcomes.</p>
            <Link to="/documentation/binomial">
              <button className="doc-button">Learn More</button>
            </Link>
          </div>

          <div className="doc-item">
            <h3>Monte-Carlo</h3>
            <p>A probabilistic model that estimates option prices by simulating thousands of possible future outcomes.</p>
            <Link to="/documentation/monte-carlo">
              <button className="doc-button">Learn More</button>
            </Link>
          </div>

          <div className="doc-item">
            <h3>Neural Network</h3>
            <p>A machine learning model to predict option prices based on historical data.</p>
            <Link to="/documentation/neural-network">
              <button className="doc-button">Learn More</button>
            </Link>
          </div>

          <div className="doc-item doc-item-greeks">
            <h3>The Greeks</h3>
            <p>Metrics that measure the sensitivity of the option price to different factors such as volatility, time, and the underlying asset’s price.</p>
            <Link to="/documentation/greeks">
              <button className="doc-button">Learn More</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;

