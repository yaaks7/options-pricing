// src/components/FormComponent.js
import React, { useState } from 'react';
import axios from 'axios';

const FormComponent = ({ setResults }) => {
  const [formData, setFormData] = useState({
    time_to_maturity: '',
    strike: '',
    current_price: '',
    volatility: '',
    interest_rate: '',
    option_type: 'call', // Default to 'call'
    model_type: 'black_scholes', // Default model
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/calculate_price/', formData);
      setResults(response.data);
    } catch (error) {
      console.error('Error calculating option price', error);
      alert('Something went wrong!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Time to Maturity:
        <input type="number" name="time_to_maturity" value={formData.time_to_maturity} onChange={handleChange} />
      </label>
      <label>
        Strike Price:
        <input type="number" name="strike" value={formData.strike} onChange={handleChange} />
      </label>
      <label>
        Current Price:
        <input type="number" name="current_price" value={formData.current_price} onChange={handleChange} />
      </label>
      <label>
        Volatility:
        <input type="number" name="volatility" value={formData.volatility} onChange={handleChange} />
      </label>
      <label>
        Interest Rate:
        <input type="number" name="interest_rate" value={formData.interest_rate} onChange={handleChange} />
      </label>
      <label>
        Option Type:
        <select name="option_type" value={formData.option_type} onChange={handleChange}>
          <option value="call">Call</option>
          <option value="put">Put</option>
        </select>
      </label>
      <label>
        Model Type:
        <select name="model_type" value={formData.model_type} onChange={handleChange}>
          <option value="black_scholes">Black-Scholes</option>
          <option value="binomial">Binomial</option>
          <option value="monte_carlo">Monte Carlo</option>
          <option value="mlp">Neural Network</option>
        </select>
      </label>
      <button type="submit">Calculate</button>
    </form>
  );
};

export default FormComponent;
