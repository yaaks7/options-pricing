// src/pages/History.js
import React from 'react';

const History = () => {
  return (
    <div>
      <h2>Historique des Requêtes</h2>
      <p>Voici un aperçu de vos requêtes passées :</p>
      <ul>
        <li>Requête 1 : Black-Scholes, Prix actuel : 100, Strike : 105, Volatilité : 0.2</li>
        <li>Requête 2 : Monte-Carlo, Prix actuel : 90, Strike : 100, Volatilité : 0.25</li>
        {/* On remplacera par les vraies données plus tard */}
      </ul>
    </div>
  );
};

export default History;
