//src/services/api.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;
// Function for Black-Scholes
export const fetchBlackScholesPrice = async (data) => {
  const response = await axios.post(`${BASE_URL}/price/blackscholes`, data);
  return response.data;
};

// Function for Binomial
export const fetchBinomialPrice = async (data) => {
  const response = await axios.post(`${BASE_URL}/price/binomial`, data);
  return response.data;
};

// Function for Monte Carlo
export const fetchMonteCarloPrice = async (data) => {
  const response = await axios.post(`${BASE_URL}/price/montecarlo`, data);
  return response.data;
};

// Function for Neural Network
export const fetchNeuralNetworkPrice = async (data) => {
  const response = await axios.post(`${BASE_URL}/price/neuralnetwork`, data);
  return response.data;
};

// Function for Greeks
export const fetchGreeks = async (data) => {
  const response = await axios.post(`${BASE_URL}/greeks`, data);
  return response.data;
};

// Function for Heatmap P&L
export const fetchHeatmapPnl = async (data) => {
  const response = await axios.post(`${BASE_URL}/heatmap_pnl/`, data);
  return response.data;
};

// Function for Option Sensitivity
export const fetchOptionSensitivity = async (data) => {
    const response = await axios.post(`${BASE_URL}/option_sensitivity/`, data);
    return response.data;
};

// Function for Greeks Sensitivity
export const fetchGreeksSensitivity = async (data) => {
  const response = await axios.post(`${BASE_URL}/greeks_sensitivity/`, data);
  return response.data;
};


