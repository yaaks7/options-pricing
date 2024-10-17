// src/pages/Home.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css'; 
import stockTradingImage from '../images/stock-trading.jpg';

const Home = () => {
  return (
    <div>
    <h1 className="home-title">Options Price Calculator</h1>
      <div className="homepage-container">
        <div className="content-container">
          <div className="scroll-section">
            <div className="scroll-card">
              <h2>What</h2>
              <p>
              This application is an option pricing calculator. It allows you to use various models such as  
              <strong> Black-Scholes</strong>, <strong>Monte-Carlo</strong>, <strong>Binomial</strong>, and 
              a <strong>Neural Network</strong> to calculate option prices and the "Greeks" (Delta, Gamma, etc.). You can 
              compare the results of the different models with charts and save your simulations for future analysis.

              </p>
            </div>
            <div className="scroll-card">
              <h2>Who</h2>
              <p>
              I am a senior year mechanical engineering student based in Montreal, with a strong interest in both programming and financial markets. Alongside my studies, I acquired skills in programming and market finance. This growing interest in these two fields led me to create this web app.
              </p>
            </div>
            <div className="scroll-card">
              <h2>Why</h2>
              <p>
                This web app is a practical application of my theoretical finance knowledge. This project reflects my ambition to combine my skills in finance and programming to create a simple financial tool accessible to all.  
              </p>
            </div>
          </div>

          {/* Image container */}
          <div className="image-container">
            <img src={stockTradingImage} alt="Stock Trading" className="image" />
          </div>
        </div>

        <div className="button-container">
          <Link to="/modeling">
            <button className="start-button">Start Pricing</button>
          </Link>
        </div>

        <div className="documentation-section">
          <h3>Documentations</h3>
          <p>
            This section provides explanations of the models used, including formulas, assumptions and limitations
          </p>
          <div className="doc-links">
            <Link to="/documentation/black-scholes">Black-Scholes</Link>
            <Link to="/documentation/binomial">Binomial</Link>
            <Link to="/documentation/monte-carlo">Monte-Carlo</Link>
            <Link to="/documentation/neural-network">Neural Network</Link>
            <Link to="/documentation/greeks">Greeks</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

