// src/services/api.js
import axios from 'axios';

// Fonction pour Black-Scholes
export const fetchBlackScholesPrice = async (data) => {
  const response = await axios.post('https://options-pricing-rpzm.vercel.app/price/blackscholes', data);
  return response.data;
};

// Fonction pour Binomial
export const fetchBinomialPrice = async (data) => {
  const response = await axios.post('https://options-pricing-rpzm.vercel.app/price/binomial', data);
  return response.data;
};

// Fonction pour Monte Carlo
export const fetchMonteCarloPrice = async (data) => {
  const response = await axios.post('https://options-pricing-rpzm.vercel.app/price/montecarlo', data);
  return response.data;
};

// Fonction pour Neural Network
export const fetchNeuralNetworkPrice = async (data) => {
  const response = await axios.post('https://options-pricing-rpzm.vercel.app/price/neuralnetwork', data);
  return response.data;
};

// Fonction pour calculer les Greeks
export const fetchGreeks = async (data) => {
  const response = await axios.post('https://options-pricing-rpzm.vercel.app/greeks', data);
  return response.data;
};

// Requête pour récupérer la Heatmap P&L
export const fetchHeatmapPnl = async (data) => {
  const response = await axios.post('https://options-pricing-rpzm.vercel.app/heatmap_pnl/', data);
  return response.data;
};

// Requête pour récupérer le graphique de sensibilité des options
export const fetchOptionSensitivity = async (data) => {
    const response = await axios.post('https://options-pricing-rpzm.vercel.app/option_sensitivity/', data);
    return response.data;
};

// Requête pour récupérer le graphique de sensibilité des options
export const fetchGreeksSensitivity = async (data) => {
  const response = await axios.post('https://options-pricing-rpzm.vercel.app/greeks_sensitivity/', data);
  return response.data;
};


