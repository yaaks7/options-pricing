// src/pages/Contributions.js
import React from 'react';
import '../styles/Contributions.css';

const Contributions = () => {
  return (
    <div className="contributions-container">
      <h1 className="contributions-title">Contributions & Acknowledgements</h1>
      <div className="contributions-section">
        <ul className="contributions-list">
          <li>
            Information on the Binomial Option Pricing Model was adapted from:{" "}
            <a href="https://www.linkedin.com/pulse/binomial-option-pricing-model-javeria-saif-igrlf/" target="_blank" rel="noopener noreferrer">
              Binomial Option Pricing Model by Javeria Saif
            </a>.
          </li>
          <li>
            Details on the Black-Scholes formula were obtained from:{" "}
            <a href="https://www.mathworks.com/help/symbolic/the-black-scholes-formula-for-call-option-price.html" target="_blank" rel="noopener noreferrer">
              MathWorks - The Black-Scholes Formula
            </a>.
          </li>
          <li>
            Icons used in this application were sourced from:{" "}
            <a href="https://www.flaticon.com/free-icons/trading" title="trading icons" target="_blank" rel="noopener noreferrer">
              Trading icons created by Freepik - Flaticon
            </a>.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Contributions;
