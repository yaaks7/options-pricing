// src/services/api.js
import axios from 'axios';

// Fonction pour Black-Scholes
export const fetchBlackScholesPrice = async (data) => {
  const response = await axios.post('http://localhost:8000/price/blackscholes', data);
  return response.data;
};

// Fonction pour Binomial
export const fetchBinomialPrice = async (data) => {
  const response = await axios.post('http://localhost:8000/price/binomial', data);
  return response.data;
};

// Fonction pour Monte Carlo
export const fetchMonteCarloPrice = async (data) => {
  const response = await axios.post('http://localhost:8000/price/montecarlo', data);
  return response.data;
};

// Fonction pour Neural Network
export const fetchNeuralNetworkPrice = async (data) => {
  const response = await axios.post('http://localhost:8000/price/neuralnetwork', data);
  return response.data;
};

// Fonction pour calculer les Greeks
export const fetchGreeks = async (data) => {
  const response = await axios.post('http://localhost:8000/greeks', data);
  return response.data;
};

