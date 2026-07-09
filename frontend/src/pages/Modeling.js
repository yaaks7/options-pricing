// src/pages/Modeling.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchBlackScholesPrice, fetchBinomialPrice, fetchMonteCarloPrice, fetchNeuralNetworkPrice, fetchGreeks } from '../services/api';
import { Calculator, BarChart2, Activity, RefreshCcw,Info,ChevronRight,Percent,Clock,DollarSign,TrendingUp,AlertTriangle} from 'lucide-react';
import HeatmapPnl from '../components/HeatmapPnl';
import OptionSensitivityGraph from '../components/OptionSensitivity';
import GreeksSensitivityGraph from '../components/GreeksSensitivity';
import '../App.css';
import '../styles/Modelling.css';

const GREEK_SYMBOLS = { delta: 'Δ', gamma: 'Γ', theta: 'Θ', vega: 'ν', rho: 'ρ' };

const Modeling = ({ historyRequest, clearHistoryRequest }) => {
  const location = useLocation();

  const [formData, setFormData] = useState({
    currentPrice: '',
    strikePrice: '',
    timeToMaturity: '',
    volatility: '',
    interestRate: ''
  });

  const [selectedModels, setSelectedModels] = useState({
    blackScholes: false,
    binomial: false,
    monteCarlo: false,
    neuralNetwork: false,
  });

  const [activeTab, setActiveTab] = useState('pricing'); 
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [greeks, setGreeks] = useState(null);
  const [modelNames, setModelNames] = useState([]);
  const [errors, setErrors] = useState({});
  const [lastCalculation, setLastCalculation] = useState(null);
  const [calculationHistory, setCalculationHistory] = useState([]);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pricesGenerated, setPricesGenerated] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState('heatmap');

  // Configuration Constants
  const PARAMETER_RANGES = {
    currentPrice: { min: 0.01, max: 10000, step: 0.01 },
    strikePrice: { min: 0.01, max: 10000, step: 0.01 },
    timeToMaturity: { min: 0.01, max: 50, step: 0.01 },
    volatility: { min: 1, max: 100, step: 0.01 },
    interestRate: { min: 0, max: 100, step: 0.01 }
  };

  const TOOLTIPS = {
    currentPrice: "Current market price of the underlying asset",
    strikePrice: "Exercise price of the option at maturity",
    timeToMaturity: "Time until expiration in years (e.g., 0.5 for 6 months)",
    volatility: "Annual volatility of the underlying asset in percentage",
    interestRate: "Annual risk-free interest rate in percentage",
  };

  // Model Configuration
const MODEL_CONFIG = {
  monteCarlo: {
    num_simulations: 10000,
    num_steps: 100
  },
  binomial: {
    steps: 100,
    is_american: false
  }
  };

  // History Load Effect
  useEffect(() => {
    if (historyRequest) {
      try {
        setFormData({
          currentPrice: historyRequest.requestData.current_price,
          strikePrice: historyRequest.requestData.strike,
          timeToMaturity: historyRequest.requestData.time_to_maturity,
          volatility: (historyRequest.requestData.volatility * 100).toFixed(2),
          interestRate: (historyRequest.requestData.interest_rate * 100).toFixed(2)
        });

        setSelectedModels({
          blackScholes: historyRequest.models.includes('Black-Scholes'),
          binomial: historyRequest.models.includes('Binomial'),
          monteCarlo: historyRequest.models.includes('Monte Carlo'),
          neuralNetwork: historyRequest.models.includes('Neural Network')
        });

        clearHistoryRequest();
      } catch (error) {
        showError('Error loading history request');
      }
    }
  }, [historyRequest, clearHistoryRequest]);

  // Navigation Reset Effect
  useEffect(() => {
    if (location.pathname !== '/modeling') {
      resetForm();
    }
  }, [location.pathname]);

  // Local Storage Effect
  useEffect(() => {
    try {
      const savedHistory = JSON.parse(localStorage.getItem('calculationHistory'));
      if (savedHistory) {
        setCalculationHistory(savedHistory);
      }
    } catch (error) {
      console.error('Error loading calculation history:', error);
    }
  }, []);

  // Error Handling Function
  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorNotification(true);
    setTimeout(() => setShowErrorNotification(false), 5000);
  };

  // Form Validation
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    // Validate numeric inputs
    Object.entries(formData).forEach(([key, value]) => {

      const numValue = parseFloat(value);

      if (!value || isNaN(numValue)) {
        newErrors[key] = `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
        isValid = false;
      }
    });

    // Validate model selection
    const selectedModelCount = Object.values(selectedModels).filter(Boolean).length;
    if (selectedModelCount === 0) {
      newErrors.models = 'Select at least one pricing model';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Input Handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Format value based on step size
    const range = PARAMETER_RANGES[name];
    let formattedValue = value;

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Clear existing error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time validation
    const numValue = parseFloat(value);
    if (value && (!isNaN(numValue))) {
      if (numValue < range.min || numValue > range.max) {
        setErrors(prev => ({
          ...prev,
          [name]: `Must be between ${range.min} and ${range.max}`
        }));
      }
    }
  };

  // Model Selection
  const handleModelSelection = (modelKey) => {
    setSelectedModels(prev => ({
      ...prev,
      [modelKey]: !prev[modelKey]
    }));

    // Clear model selection error if present
    if (errors.models) {
      setErrors(prev => ({
        ...prev,
        models: ''
      }));
    }
  };

  // Calculation Functions
  const calculatePrices = async (requestData) => {
    const promises = [];
    const models = [];

    if (selectedModels.blackScholes) {
      promises.push(fetchBlackScholesPrice(requestData));
      models.push("Black-Scholes");
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

  if (selectedModels.monteCarlo) {
    const monteCarloData = {
      ...requestData,
      num_simulations: 10000, 
      num_steps: 100          
    };
    promises.push(fetchMonteCarloPrice(monteCarloData));
    models.push("Monte Carlo"); 
  }
    
    if (selectedModels.neuralNetwork) {
      promises.push(fetchNeuralNetworkPrice(requestData));
      models.push("Neural Network");
    }

    return { promises, models };
  };

  // Main Calculation Handler
  const handleCalculation = async () => {
    if (!validateForm()) {
      showError('Please correct the errors before calculating');
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        current_price: parseFloat(formData.currentPrice),
        strike: parseFloat(formData.strikePrice),
        time_to_maturity: parseFloat(formData.timeToMaturity),
        volatility: parseFloat(formData.volatility) / 100,
        interest_rate: parseFloat(formData.interestRate) / 100
      };

      const { promises, models } = await calculatePrices(requestData);
      const greeksPromise = fetchGreeks(requestData);

      // Wait for all calculations
      const [priceResponses, greeksData] = await Promise.all([
        Promise.all(promises),
        greeksPromise
      ]);

      // Update state with results
      setResults(priceResponses);
      setGreeks(greeksData);
      setModelNames(models);
      setPricesGenerated(true);

      // Save calculation
      const calculationData = {
        models,
        requestData,
        results: priceResponses,
        greeks: greeksData,
        timestamp: new Date().toISOString()
      };

      saveToHistory(calculationData);
      setLastCalculation(calculationData);

    } catch (error) {
      console.error('Calculation error:', error);
      showError('Error calculating option prices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // History Management
  const saveToHistory = (newEntry) => {
    try {
      const history = JSON.parse(localStorage.getItem('history')) || [];
      const isDuplicate = history.some(entry =>
        JSON.stringify(entry.requestData) === JSON.stringify(newEntry.requestData) &&
        JSON.stringify(entry.models) === JSON.stringify(newEntry.models)
      );

      if (!isDuplicate) {
        const updatedHistory = [...history, newEntry].slice(-50); // Keep last 50 calculations
        localStorage.setItem('history', JSON.stringify(updatedHistory));
        setCalculationHistory(updatedHistory);
      }
    } catch (error) {
      console.error('Error saving to history:', error);
      showError('Could not save calculation to history');
    }
  };

  // Form Reset
  const resetForm = () => {
    setFormData({
      currentPrice: '',
      strikePrice: '',
      timeToMaturity: '',
      volatility: '',
      interestRate: ''
    });
    setSelectedModels({
      blackScholes: false,
      binomial: false,
      monteCarlo: false,
      neuralNetwork: false
    });
    setResults(null);
    setGreeks(null);
    setErrors({});
    setActiveTab('pricing');
    setPricesGenerated(false);
  };

  return (
    <div className="modeling-container">
      {/* Error Notification */}
      {showErrorNotification && (
        <div className="error-notification">
          <AlertTriangle size={20} />
          <span>{errorMessage}</span>
          <button onClick={() => setShowErrorNotification(false)}>×</button>
        </div>
      )}
  
      {/* Configuration Panel (Left Side) */}
      <div className="config-panel">
        {/* Header */}
        <div className="panel-header">
          <Calculator className="header-icon" />
          <h2>Options Calculator</h2>
          <button 
            className="reset-button"
            onClick={resetForm}
            title="Reset all fields"
          >
            <RefreshCcw size={16} />
          </button>
        </div>
  
        <form onSubmit={(e) => { e.preventDefault(); handleCalculation(); }}>
          {/* Parameters Section */}
          <div className="parameters-section">
            <h3>Parameters</h3>
  
            {/* Current Price Input */}
            <div className="input-group">
              <div className="input-wrapper">
                <DollarSign className="input-icon" />
                <input
                  type="number"
                  id="currentPrice"
                  name="currentPrice"
                  value={formData.currentPrice}
                  onChange={handleInputChange}
                  step={PARAMETER_RANGES.currentPrice.step}
                  min={PARAMETER_RANGES.currentPrice.min}
                  max={PARAMETER_RANGES.currentPrice.max}
                  required
                />
                <label htmlFor="currentPrice">Current Price ($)</label>
                <div className="tooltip-icon" data-tooltip={TOOLTIPS.currentPrice}>
                  <Info size={16} />
                </div>
              </div>
              {errors.currentPrice && (
                <span className="error-message">{errors.currentPrice}</span>
              )}
            </div>
  
            {/* Strike Price Input */}
            <div className="input-group">
              <div className="input-wrapper">
                <DollarSign className="input-icon" />
                <input
                  type="number"
                  id="strikePrice"
                  name="strikePrice"
                  value={formData.strikePrice}
                  onChange={handleInputChange}
                  step={PARAMETER_RANGES.strikePrice.step}
                  min={PARAMETER_RANGES.strikePrice.min}
                  max={PARAMETER_RANGES.strikePrice.max}
                  required
                />
                <label htmlFor="strikePrice">Strike Price ($)</label>
                <div className="tooltip-icon" data-tooltip={TOOLTIPS.strikePrice}>
                  <Info size={16} />
                </div>
              </div>
              {errors.strikePrice && (
                <span className="error-message">{errors.strikePrice}</span>
              )}
            </div>
  
            {/* Time to Maturity Input */}
            <div className="input-group">
              <div className="input-wrapper">
                <Clock className="input-icon" />
                <input
                  type="number"
                  id="timeToMaturity"
                  name="timeToMaturity"
                  value={formData.timeToMaturity}
                  onChange={handleInputChange}
                  step={PARAMETER_RANGES.timeToMaturity.step}
                  min={PARAMETER_RANGES.timeToMaturity.min}
                  max={PARAMETER_RANGES.timeToMaturity.max}
                  required
                />
                <label htmlFor="timeToMaturity">Time to Maturity (Years)</label>
                <div className="tooltip-icon" data-tooltip={TOOLTIPS.timeToMaturity}>
                  <Info size={16} />
                </div>
              </div>
              {errors.timeToMaturity && (
                <span className="error-message">{errors.timeToMaturity}</span>
              )}
            </div>
  
            {/* Volatility Input */}
            <div className="input-group">
              <div className="input-wrapper">
                <TrendingUp className="input-icon" />
                <input
                  type="number"
                  id="volatility"
                  name="volatility"
                  value={formData.volatility}
                  onChange={handleInputChange}
                  step={PARAMETER_RANGES.volatility.step}
                  min={PARAMETER_RANGES.volatility.min}
                  max={PARAMETER_RANGES.volatility.max}
                  required
                />
                <label htmlFor="volatility">Volatility (%)</label>
                <div className="tooltip-icon" data-tooltip={TOOLTIPS.volatility}>
                  <Info size={16} />
                </div>
              </div>
              {errors.volatility && (
                <span className="error-message">{errors.volatility}</span>
              )}
            </div>
  
            {/* Interest Rate Input */}
            <div className="input-group">
              <div className="input-wrapper">
                <Percent className="input-icon" />
                <input
                  type="number"
                  id="interestRate"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={handleInputChange}
                  step={PARAMETER_RANGES.interestRate.step}
                  min={PARAMETER_RANGES.interestRate.min}
                  max={PARAMETER_RANGES.interestRate.max}
                  required
                />
                <label htmlFor="interestRate">Interest Rate (%)</label>
                <div className="tooltip-icon" data-tooltip={TOOLTIPS.interestRate}>
                  <Info size={16} />
                </div>
              </div>
              {errors.interestRate && (
                <span className="error-message">{errors.interestRate}</span>
              )}
            </div>
          </div>
  
          {/* Models Selection */}
          <div className="models-section">
            <h3>Pricing Models</h3>
            <div className="models-grid">
              {[
                { key: 'blackScholes', label: 'Black-Scholes' },
                { key: 'binomial', label: 'Binomial' },
                { key: 'monteCarlo', label: 'Monte-Carlo' },
                { key: 'neuralNetwork', label: 'Neural Network' }
              ].map(({ key, label }) => (
                <div 
                  key={key}
                  className={`model-card ${selectedModels[key] ? 'selected' : ''}`}
                  onClick={() => handleModelSelection(key)}
                >
                  <BarChart2 className="model-icon" />
                  <span>{label}</span>
                  {selectedModels[key] && <div className="selected-indicator" />}
                </div>
              ))}
            </div>
            {errors.models && (
              <span className="error-message models-error">{errors.models}</span>
            )}
          </div>
  
          {/* Calculate Button */}
          <button 
            type="submit" 
            className={`calculate-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCcw className="spin" />
                <span>Calculating...</span>
              </>
            ) : (
              <>
                <span>Calculate Prices</span>
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>

        {/* Results Panel (Right Side) */}
        <div className="results-panel">
            {/* Results Navigation */}
            <div className="results-nav">
                <div className="nav-tabs">
                <button 
                    className={`tab-button ${activeTab === 'pricing' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pricing')}
                >
                    <Activity className="tab-icon" />
                    <span>Pricing Results</span>
                </button>
                <button 
                    className={`tab-button ${activeTab === 'greeks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('greeks')}
                >
                    <BarChart2 className="tab-icon" />
                    <span>Greeks Analysis</span>
                </button>
                <button 
                    className={`tab-button ${activeTab === 'analysis' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analysis')}
                >
                    <TrendingUp className="tab-icon" />
                    <span>Sensitivity Analysis</span>
                </button>
                </div>
            </div>

            {/* Results Content */}
            <div className="results-content">
                {loading && (
                <div className="loading-overlay">
                    <RefreshCcw className="spin" />
                    <span>Calculating results...</span>
                </div>
                )}

                {!results ? (
                <div className="no-results">
                    <Calculator size={48} />
                    <h3>No calculations yet</h3>
                    <p>Enter parameters and select models to calculate option prices</p>
                </div>
                ) : (
                <>
                    {/* Pricing Results Tab */}
                    {activeTab === 'pricing' && (
                    <div className="pricing-results">
                        <div className="results-grid">
                        {modelNames.map((model, index) => (
                            <div key={model} className="result-card">
                            <div className="card-header">
                                <h4>{model}</h4>
                            </div>
                            <div className="price-details">
                                <div className="price-item">
                                <span className="price-label">Call Option</span>
                                <strong className="price-value">
                                    ${results[index].call_price.toFixed(4)}
                                </strong>
                                </div>
                                <div className="price-item">
                                <span className="price-label">Put Option</span>
                                <strong className="price-value">
                                    ${results[index].put_price.toFixed(4)}
                                </strong>
                                </div>
                            </div>
                            </div>
                        ))}
                        </div>
                    </div>
                    )}

                    {/* Greeks Analysis Tab */}
                    {activeTab === 'greeks' && greeks && (
                    <div className="greeks-analysis">
                        <div className="greeks-cards">
                        <div className="greeks-section">
                            <h3>Call Option Greeks</h3>
                            <div className="greeks-grid">
                            {Object.entries(greeks.call).map(([greek, value]) => (
                                <div key={greek} className="greek-card">
                                <h4><span className="greek-symbol">{GREEK_SYMBOLS[greek]}</span> {greek}</h4>
                                <strong className="greek-value">{value.toFixed(4)}</strong>
                                <div 
                                    className="greek-indicator"
                                    style={{ 
                                    backgroundColor: value > 0 ? 'var(--success)' : 'var(--error)',
                                    width: `${Math.min(Math.abs(value * 100), 100)}%`
                                    }}
                                />
                                </div>
                            ))}
                            </div>
                        </div>

                        <div className="greeks-section">
                            <h3>Put Option Greeks</h3>
                            <div className="greeks-grid">
                            {Object.entries(greeks.put).map(([greek, value]) => (
                                <div key={greek} className="greek-card">
                                <h4><span className="greek-symbol">{GREEK_SYMBOLS[greek]}</span> {greek}</h4>
                                <strong className="greek-value">{value.toFixed(4)}</strong>
                                <div 
                                    className="greek-indicator"
                                    style={{ 
                                    backgroundColor: value > 0 ? 'var(--success)' : 'var(--error)',
                                    width: `${Math.min(Math.abs(value * 100), 100)}%`
                                    }}
                                />
                                </div>
                            ))}
                            </div>
                        </div>
                        </div>
                    </div>
                    )}

                    {/* Sensitivity Analysis Tab */}
                    {activeTab === 'analysis' && (
                    <div className="sensitivity-analysis">
                        <div className="analysis-controls">
                        <button 
                            className={`analysis-tab ${activeAnalysis === 'heatmap' ? 'active' : ''}`}
                            onClick={() => setActiveAnalysis('heatmap')}
                        >
                            Heatmap P&L
                        </button>
                        <button 
                            className={`analysis-tab ${activeAnalysis === 'optionSensitivity' ? 'active' : ''}`}
                            onClick={() => setActiveAnalysis('optionSensitivity')}
                        >
                            Price Sensitivity
                        </button>
                        <button 
                            className={`analysis-tab ${activeAnalysis === 'greeksSensitivity' ? 'active' : ''}`}
                            onClick={() => setActiveAnalysis('greeksSensitivity')}
                        >
                            Greeks Sensitivity
                        </button>
                        </div>

                        <div className="graph-container">
                        {loading && (
                            <div className="loader">
                            <RefreshCcw className="spin" />
                            <span>Generating graph...</span>
                            </div>
                        )}

                        {activeAnalysis === 'heatmap' && (
                            <HeatmapPnl
                            setLoading={setLoading}
                            strikePrice={formData.strikePrice}
                            timeToMaturity={formData.timeToMaturity}
                            interestRate={formData.interestRate}
                            pricesGenerated={pricesGenerated}
                            />
                        )}

                        {activeAnalysis === 'optionSensitivity' && (
                            <OptionSensitivityGraph
                            setLoading={setLoading}
                            currentPrice={formData.currentPrice}
                            strikePrice={formData.strikePrice}
                            timeToMaturity={formData.timeToMaturity}
                            volatility={formData.volatility}
                            interestRate={formData.interestRate}
                            selectedModels={modelNames}
                            pricesGenerated={pricesGenerated}
                            />
                        )}

                        {activeAnalysis === 'greeksSensitivity' && (
                            <GreeksSensitivityGraph
                            setLoading={setLoading}
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
                    )}
                </>
                )}
            </div>
        </div>
    </div>
  );
};
export default Modeling;