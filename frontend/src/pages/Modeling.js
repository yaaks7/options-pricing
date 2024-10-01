import React, { useState } from 'react';
import { fetchBlackScholesPrice, fetchBinomialPrice, fetchMonteCarloPrice, fetchNeuralNetworkPrice, fetchGreeks } from '../services/api';
import HeatmapPnl from '../components/HeatmapPnl';
import OptionSensitivityGraph from '../components/OptionSensitivity';
import GreeksSensitivityGraph from '../components/GreeksSensitivity';
import '../App.css'; 
import '../styles/Modelling.css'; 

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

  const [activeTab, setActiveTab] = useState('heatmap'); // Add state to track active tab
  const [errors, setErrors] = useState({});
  const [results, setResults] = useState(null);
  const [greeks, setGreeks] = useState(null); 
  const [modelNames, setModelNames] = useState([]);
  const [pricesGenerated, setPricesGenerated] = useState(false); // State for tracking if prices are generated

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
    const models = [];

    if (selectedModels.blackScholes) {
      promises.push(fetchBlackScholesPrice(requestData));
      models.push("Black-Scholes");
    }
    if (selectedModels.neuralNetwork) {
      promises.push(fetchNeuralNetworkPrice(requestData));
      models.push("Neural Network");
    }
    if (selectedModels.monteCarlo) {
      const monteCarloData = { ...requestData, num_simulations: 10000, num_steps: 100 };
      promises.push(fetchMonteCarloPrice(monteCarloData));
      models.push("Monte Carlo");
    }
    if (selectedModels.binomial) {
      const binomialData = { ...requestData, steps: 100, is_american: false };
      promises.push(fetchBinomialPrice(binomialData));
      models.push("Binomial");
    }

    const greeksPromise = fetchGreeks(requestData);
    promises.push(greeksPromise);

    try {
      const responses = await Promise.all(promises);

      const greeksData = responses.pop();
      setResults(responses);
      setGreeks(greeksData);
      setModelNames(models);
      setPricesGenerated(true); // Set pricesGenerated to true after fetching prices
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleGraphButtonClick = (e, graphType) => {
    if (!pricesGenerated) {
      e.preventDefault();
      alert("Please generate the option prices first before generating the graph.");
    }
  };
  

  return (

    <div className="modeling-container">
      {/* Sidebar */}
      <div className="sidebar">
        <form onSubmit={handleSubmit}>
          <h3 className="centered-title">Enter Parameters</h3>

          <label>Current Price ($) :</label>
          <input type="number" name="currentPrice" value={formData.currentPrice} onChange={handleChange} required />
          
          <label>Strike Price ($) :</label>
          <input type="number" name="strikePrice" value={formData.strikePrice} onChange={handleChange} required />
          
          <label>Time to Maturity (Years) :</label>
          <input type="number" name="timeToMaturity" value={formData.timeToMaturity} onChange={handleChange} required />
          
          <label>Volatility (%) :</label>
          <input type="number" name="volatility" value={formData.volatility} onChange={handleChange} required />
          {errors.volatility && <p className="error">{errors.volatility}</p>}
          
          <label>Interest Rate (%) :</label>
          <input type="number" name="interestRate" value={formData.interestRate} onChange={handleChange} required />
          {errors.interestRate && <p className="error">{errors.interestRate}</p>}

          <h3>Select Models</h3>
          <label className="wrapper">
            <span>Black-Scholes</span>
            <span><input type="checkbox" name="blackScholes" checked={selectedModels.blackScholes} onChange={handleModelChange} /></span>
          </label>

          <label className="wrapper">
            <span>Binomial</span>
            <span><input type="checkbox" name="binomial" checked={selectedModels.binomial} onChange={handleModelChange} /></span>
          </label>

          <label className="wrapper">
            <span>Monte-Carlo</span>
            <span><input type="checkbox" name="monteCarlo" checked={selectedModels.monteCarlo} onChange={handleModelChange} /></span>
          </label>

          <label className="wrapper">
            <span>Neural Network</span>
            <span><input type="checkbox" name="neuralNetwork" checked={selectedModels.neuralNetwork} onChange={handleModelChange} /></span>
          </label>

          <div className="clearboth"></div>  {/* Clear floats */}

          <button type="submit">Generate</button>
        </form>
      </div>

      {/* Results Section */}
      <div className="results-container">
        <div className="results-header">
          <div className="results-section">
            <h4 className="centered-title">Call Prices</h4>
            {results && results.map((result, index) => (
              <div key={index}><p>{modelNames[index]} Call : {result.call_price.toFixed(2)} $</p></div>
            ))}
          </div>
          <div className="results-section">
            <h4 className="centered-title">Put Prices</h4>
            {results && results.map((result, index) => (
              <div key={index}><p>{modelNames[index]} Put : {result.put_price.toFixed(2)} $</p></div>
            ))}
          </div>
        </div>

        <div className="greeks-section boxed-container">
          <h4 className="centered-title">Greeks</h4>
          {greeks && (
            <>
              <div className="greek-values">
                <h5>Call Greeks</h5>
                <p>Delta: {greeks.call.delta.toFixed(2)}</p>
                <p>Gamma: {greeks.call.gamma.toFixed(2)}</p>
                <p>Vega: {greeks.call.vega.toFixed(2)}</p>
                <p>Theta: {greeks.call.theta.toFixed(2)}</p>
                <p>Rho: {greeks.call.rho.toFixed(2)}</p>
              </div>
              <div className="greek-values">
                <h5>Put Greeks</h5>
                <p>Delta: {greeks.put.delta.toFixed(2)}</p>
                <p>Gamma: {greeks.put.gamma.toFixed(2)}</p>
                <p>Vega: {greeks.put.vega.toFixed(2)}</p>
                <p>Theta: {greeks.put.theta.toFixed(2)}</p>
                <p>Rho: {greeks.put.rho.toFixed(2)}</p>
              </div>
            </>
          )}
        </div>

        {/* Tabs for switching between graphs */}
        <div className="tabs">
          <button onClick={() => setActiveTab('heatmap')}>Heatmap P&L</button>
          <button onClick={() => setActiveTab('optionSensitivity')}>Options Sensitivity</button>
          <button onClick={() => setActiveTab('greeksSensitivity')}>Greeks Sensitivity</button>
        </div>

        {/* Display selected tab */}
        <div className="graph-container">
          {activeTab === 'heatmap' && (
            <HeatmapPnl
              strikePrice={formData.strikePrice}
              timeToMaturity={formData.timeToMaturity}
              interestRate={formData.interestRate}
              pricesGenerated={pricesGenerated}
            />
          )}

          {activeTab === 'optionSensitivity' && (
            <OptionSensitivityGraph
              currentPrice={formData.currentPrice}
              strikePrice={formData.strikePrice}
              timeToMaturity={formData.timeToMaturity}
              volatility={formData.volatility}
              interestRate={formData.interestRate}
              selectedModels={Object.keys(selectedModels).filter((model) => selectedModels[model])}
              pricesGenerated={pricesGenerated}
            />
          )}

          {activeTab === 'greeksSensitivity' && (
            <GreeksSensitivityGraph
              currentPrice={formData.currentPrice}
              strikePrice={formData.strikePrice}
              timeToMaturity={formData.timeToMaturity}
              volatility={formData.volatility}
              interestRate={formData.interestRate}
              pricesGenerated={pricesGenerated}
            />
          )}
        </div>
      </div>
    </div>

  );
};

export default Modeling;
