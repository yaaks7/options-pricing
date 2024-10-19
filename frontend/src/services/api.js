//src/services/api.js
import axios from 'axios';

// Function for Black-Scholes
export const fetchBlackScholesPrice = async (data) => {
  const response = await axios.post('http://localhost:8000/price/blackscholes', data);
  return response.data;
};

// Function for Binomial
export const fetchBinomialPrice = async (data) => {
  const response = await axios.post('http://localhost:8000/price/binomial', data);
  return response.data;
};

// Function for Monte Carlo
export const fetchMonteCarloPrice = async (data) => {
  const response = await axios.post('http://localhost:8000/price/montecarlo', data);
  return response.data;
};

// Function for Neural Network
export const fetchNeuralNetworkPrice = async (data) => {
  const response = await axios.post('http://localhost:8000/price/neuralnetwork', data);
  return response.data;
};

// Function for Greeks
export const fetchGreeks = async (data) => {
  const response = await axios.post('http://localhost:8000/greeks', data);
  return response.data;
};

// Function for Heatmap P&L
export const fetchHeatmapPnl = async (data) => {
  const response = await axios.post('http://localhost:8000/heatmap_pnl/', data);
  return response.data;
};

// Function for Option Sensitivity
export const fetchOptionSensitivity = async (data) => {
    const response = await axios.post('http://localhost:8000/option_sensitivity/', data);
    return response.data;
};

// Function for Greeks Sensitivity
export const fetchGreeksSensitivity = async (data) => {
  const response = await axios.post('http://localhost:8000/greeks_sensitivity/', data);
  return response.data;
};


