// src/pages/Modeling.js
import React, { useState } from 'react';
import { fetchBlackScholesPrice, fetchBinomialPrice, fetchMonteCarloPrice, fetchNeuralNetworkPrice, fetchGreeks } from '../services/api';
import HeatmapPnl from '../components/HeatmapPnl';
import OptionSensitivityGraph from '../components/OptionSensitivity';

const Modeling = () => {
  const [selectedModels, setSelectedModels] = useState({
    blackScholes: false,
    binomial: false,
    monteCarlo: false,
    neuralNetwork: false,
  });

  const [formData, setFormData] = useState({
    currentPrice: '',
    strikePrice: '',
    timeToMaturity: '',
    volatility: '',
    interestRate: ''
  });

  const [errors, setErrors] = useState({});
  const [results, setResults] = useState(null);
  const [greeks, setGreeks] = useState(null); 
  const [modelNames, setModelNames] = useState([]); // Ajout pour stocker les noms des modèles

  // Validation des données avant l'envoi
  const validateForm = () => {
    let formErrors = {};
    let valid = true;

    if (formData.volatility < 0 || formData.volatility > 100 || formData.volatility === '') {
      formErrors.volatility = 'Volatility must be between 0 and 100';
      valid = false;
    }

    if (formData.interestRate < 0 || formData.interestRate > 100 || formData.interestRate === '') {
      formErrors.interestRate = 'Interest Rate must be between 0 and 100';
      valid = false;
    }

    setErrors(formErrors);
    return valid;
  };

  const handleModelChange = (e) => {
    const { name, checked } = e.target;
    setSelectedModels({ ...selectedModels, [name]: checked });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const requestData = {
      time_to_maturity: formData.timeToMaturity,
      strike: formData.strikePrice,
      current_price: formData.currentPrice,
      volatility: formData.volatility / 100,
      interest_rate: formData.interestRate / 100
    };

    const promises = [];
    const models = []; // Stocke les noms des modèles sélectionnés

    // Requêtes pour les prix avec noms des modèles
    if (selectedModels.blackScholes) {
      promises.push(fetchBlackScholesPrice(requestData));
      models.push("Black-Scholes");
    }
    if (selectedModels.neuralNetwork) {
      promises.push(fetchNeuralNetworkPrice(requestData));
      models.push("Neural Network");
    }
    if (selectedModels.monteCarlo) {
      const monteCarloData = {
        ...requestData,
        num_simulations: 10000,
        num_steps: 100
      };
      promises.push(fetchMonteCarloPrice(monteCarloData));
      models.push("Monte Carlo");
    }
    if (selectedModels.binomial) {
      const binomialData = {
        ...requestData,
        steps: 100,
        is_american: false
      };
      promises.push(fetchBinomialPrice(binomialData));
      models.push("Binomial");
    }

    // Requête pour les Greeks
    const greeksPromise = fetchGreeks(requestData);
    promises.push(greeksPromise);

    try {
      const responses = await Promise.all(promises);

      const greeksData = responses.pop();  // Récupérer les Greeks
      setResults(responses);  // Récupérer les résultats des prix des options
      setGreeks(greeksData);  // Stocker les Greeks
      setModelNames(models);  // Stocker les noms des modèles
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div>
      <h2>Option Pricing Modeling</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Current Price:
          <input
            type="number"
            name="currentPrice"
            value={formData.currentPrice}
            onChange={handleChange}
            required
          />
        </label>
        
        <label>
          Strike Price:
          <input
            type="number"
            name="strikePrice"
            value={formData.strikePrice}
            onChange={handleChange}
            required
          />
        </label>
        
        <label>
          Time to Maturity (Years):
          <input
            type="number"
            name="timeToMaturity"
            value={formData.timeToMaturity}
            onChange={handleChange}
            required
          />
        </label>
        
        <label>
          Volatility (%):
          <input
            type="number"
            name="volatility"
            value={formData.volatility}
            onChange={handleChange}
            required
          />
          {errors.volatility && <p style={{ color: 'red' }}>{errors.volatility}</p>}
        </label>
        
        <label>
          Interest Rate (%):
          <input
            type="number"
            name="interestRate"
            value={formData.interestRate}
            onChange={handleChange}
            required
          />
          {errors.interestRate && <p style={{ color: 'red' }}>{errors.interestRate}</p>}
        </label>
        
        <div>
          <h3>Select Models</h3>
          <label>
            <input
              type="checkbox"
              name="blackScholes"
              checked={selectedModels.blackScholes}
              onChange={handleModelChange}
            />
            Black-Scholes
          </label>
          <label>
            <input
              type="checkbox"
              name="binomial"
              checked={selectedModels.binomial}
              onChange={handleModelChange}
            />
            Binomial
          </label>
          <label>
            <input
              type="checkbox"
              name="monteCarlo"
              checked={selectedModels.monteCarlo}
              onChange={handleModelChange}
            />
            Monte-Carlo
          </label>
          <label>
            <input
              type="checkbox"
              name="neuralNetwork"
              checked={selectedModels.neuralNetwork}
              onChange={handleModelChange}
            />
            Neural Network
          </label>
        </div>

        <button type="submit">Generate Prices</button>
      </form>

      {/* Affichage des résultats des prix */}
      {results && (
        <div>
          <h3>Results:</h3>
          {results.map((result, index) => (
            <div key={index}>
              <h4>{modelNames[index]}</h4> {/* Afficher le nom du modèle */}
              <p>Call Price: {result.call_price}</p>
              <p>Put Price: {result.put_price}</p>
            </div>
          ))}
        </div>
      )}

      {/* Affichage des Greeks */}
      {greeks && (
        <div>
          <h3>Greeks:</h3>
          <div>
            <h4>Call Greeks</h4>
            <p>Delta: {greeks.call.delta}</p>
            <p>Gamma: {greeks.call.gamma}</p>
            <p>Vega: {greeks.call.vega}</p>
            <p>Theta: {greeks.call.theta}</p>
            <p>Rho: {greeks.call.rho}</p>
          </div>
          <div>
            <h4>Put Greeks</h4>
            <p>Delta: {greeks.put.delta}</p>
            <p>Gamma: {greeks.put.gamma}</p>
            <p>Vega: {greeks.put.vega}</p>
            <p>Theta: {greeks.put.theta}</p>
            <p>Rho: {greeks.put.rho}</p>
          </div>
        </div>
      )}

      {/* Section pour la Heatmap */}
      <HeatmapPnl
        strikePrice={formData.strikePrice}
        timeToMaturity={formData.timeToMaturity}
        interestRate={formData.interestRate}
      />

      {/* Composant Option Sensitivity Graph */}
      <OptionSensitivityGraph
        currentPrice={formData.currentPrice}
        strikePrice={formData.strikePrice}
        timeToMaturity={formData.timeToMaturity}
        volatility={formData.volatility}
        interestRate={formData.interestRate}
        selectedModels={Object.keys(selectedModels).filter((model) => selectedModels[model])}  // Filtrer uniquement les modèles sélectionnés
      />



    </div>
  );
};

export default Modeling;
