// src/pages/Documentation.js
import React from 'react';
import { Link } from 'react-router-dom';

const Documentation = () => {
  return (
    <div>
      <h2>Documentation des Modèles</h2>
      <ul>
        <li><Link to="/documentation/black-scholes">Modèle Black-Scholes</Link></li>
        <li><Link to="/documentation/binomial">Modèle Binomial</Link></li>
        <li><Link to="/documentation/monte-carlo">Modèle Monte Carlo</Link></li>
        <li><Link to="/documentation/neural-network">Réseau Neuronal</Link></li>
        <li><Link to="/documentation/greeks">Les Greeks</Link></li>
      </ul>
    </div>
  );
};

export default Documentation;
