// src/pages/Modeling.js
import React, { useState } from 'react';
import axios from 'axios';

const Modeling = () => {
  const [params, setParams] = useState({
    modelType: 'Black-Scholes',
    currentPrice: '',
    strikePrice: '',
    timeToMaturity: '',
    volatility: '',
    interestRate: ''
  });

  const handleChange = (e) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/pricing', params); // URL de ton API backend
      console.log(response.data); // On affichera les résultats plus tard
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Modélisation des Options</h2>
      <form onSubmit={handleSubmit}>
        <label>Prix actuel :</label>
        <input name="currentPrice" value={params.currentPrice} onChange={handleChange} />
        <label>Prix d'exercice :</label>
        <input name="strikePrice" value={params.strikePrice} onChange={handleChange} />
        <label>Temps jusqu'à l'échéance :</label>
        <input name="timeToMaturity" value={params.timeToMaturity} onChange={handleChange} />
        <label>Volatilité :</label>
        <input name="volatility" value={params.volatility} onChange={handleChange} />
        <label>Taux d'intérêt :</label>
        <input name="interestRate" value={params.interestRate} onChange={handleChange} />
        <button type="submit">Calculer</button>
      </form>
    </div>
  );
};

export default Modeling;
