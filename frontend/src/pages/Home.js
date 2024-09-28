// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Bienvenue sur le site de Pricing d'Options</h1>
      <p>
        Utilisez ce site pour modéliser le prix des options financières à l'aide de divers modèles (Black-Scholes, Monte Carlo, etc.), visualiser les résultats, et consulter l'historique de vos simulations.
      </p>
      <nav>
        <ul>
          <li><Link to="/modeling">Modélisation des Options</Link></li>
          <li><Link to="/history">Historique des Requêtes</Link></li>
          <li><Link to="/documentation">Documentation</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;
