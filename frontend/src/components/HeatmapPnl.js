// src/components/HeatmapPnL.js
import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { fetchHeatmapPnl } from '../services/api';
import '../App.css'; 
import '../styles/Modelling.css'; 

const HeatmapPnl = ({ strikePrice, timeToMaturity, interestRate, pricesGenerated, setLoading }) => {
  const [purchasePrice, setPurchasePrice] = useState('');
  const [volatilityRange, setVolatilityRange] = useState({ min: '', max: '' });
  const [spotPriceRange, setSpotPriceRange] = useState({ min: '', max: '' });
  const [heatmapData, setHeatmapData] = useState(null);
  const [optionType, setOptionType] = useState('call');  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'purchasePrice') {
      setPurchasePrice(value);
    } else if (name === 'volatilityMin' || name === 'volatilityMax') {
      setVolatilityRange({ ...volatilityRange, [name === 'volatilityMin' ? 'min' : 'max']: value });
    } else if (name === 'spotPriceMin' || name === 'spotPriceMax') {
      setSpotPriceRange({ ...spotPriceRange, [name === 'spotPriceMin' ? 'min' : 'max']: value });
    }
  };

  const handleOptionTypeChange = (e) => {
    setOptionType(e.target.value); 
  };

  const generateHeatmap = async () => {
    setLoading(true);

    if (!pricesGenerated) {
      alert("Please generate the option prices first.");
      return;
    }

    if (!purchasePrice || !volatilityRange.min || !volatilityRange.max || !spotPriceRange.min || !spotPriceRange.max) {
      console.error('All fields must be filled out');
      return;
    }

    // Conversion %
    const interestRateDecimal = parseFloat(interestRate) / 100;  
    const minVolatilityDecimal = parseFloat(volatilityRange.min) / 100;  
    const maxVolatilityDecimal = parseFloat(volatilityRange.max) / 100;  

    const data = {
      purchase_price: parseFloat(purchasePrice),
      min_volatility: minVolatilityDecimal,
      max_volatility: maxVolatilityDecimal,
      min_spot_price: parseFloat(spotPriceRange.min),
      max_spot_price: parseFloat(spotPriceRange.max),
      strike: parseFloat(strikePrice),
      time_to_maturity: parseFloat(timeToMaturity),
      interest_rate: interestRateDecimal  
    };

    try {
      const response = await fetchHeatmapPnl(data);

      const pnlMatrix = optionType === 'call' ? response.pnl_matrix_call : response.pnl_matrix_put;

      setHeatmapData({
        x: response.volatilities,
        y: response.spot_prices,
        z: pnlMatrix,  
        type: 'heatmap',
        colorscale: [
          [0, 'rgb(165, 0, 38)'],    // Red negative P&L 
          [0.5, 'rgb(255, 255, 191)'],  // Yellow neutral value
          [1, 'rgb(0, 104, 55)']    // Green Positive P&L
        ],
        zmin: -50,
        zmax: 50
      });
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
    }

    setLoading(false);
  };

  return (
    <div>
      <h3>Heatmap P&L</h3>
      <form onSubmit={(e) => { e.preventDefault(); generateHeatmap(); }}>
        <div style={{ justifyContent: 'space-between', marginBottom: '10px', marginTop: '10px' }}>
          <label>
            Purchase Price ($) :
            <input type="number" name="purchasePrice" value={purchasePrice} onChange={handleInputChange} min="0" step="0.01" required />
          </label>
          <label>
            Volatility Min (%) :
            <input type="number" name="volatilityMin" value={volatilityRange.min} onChange={handleInputChange} min="0" required />
          </label>
          <label>
            Volatility Max (%) :
            <input type="number" name="volatilityMax" value={volatilityRange.max} onChange={handleInputChange} min="0" required />
          </label>
        </div>
        <div style={{ justifyContent: 'space-between', marginBottom: '10px'}}>
          <label>
            Spot Price Min ($) :
            <input type="number" name="spotPriceMin" value={spotPriceRange.min} onChange={handleInputChange} min="0" required />
          </label>
          <label>
            Spot Price Max ($) :
            <input type="number" name="spotPriceMax" value={spotPriceRange.max} onChange={handleInputChange} min="0" required />
          </label>
          <label>
            Option Type :
            <select value={optionType} onChange={(e) => setOptionType(e.target.value)}>
              <option value="call">Call</option>
              <option value="put">Put</option>
            </select>
          </label>
        </div>
        <button type="submit">Generate</button>
      </form>


      {/* Heatmap */}
      {heatmapData && (
          <Plot
            data={[heatmapData]}
            layout={{
              title: {
                text: `P&L Heatmap (${optionType.toUpperCase()})`,
                font: { color: "#E5EFC1" } 
              },
              xaxis: { 
                title: {
                  text: 'Volatility',
                  font: { color: "#E5EFC1" } 
                },
                tickmode: 'linear',
                dtick: 0.05,  // Ticks for volatility
                color: "#E5EFC1"  
              },
              yaxis: { 
                title: {
                  text: 'Spot Price',
                  font: { color: "#E5EFC1" }  
                },
                tickmode: 'linear',
                dtick: 10,  
                color: "#E5EFC1"  
              },
              autosize: true,
              paper_bgcolor: "#1E1E1E", 
              plot_bgcolor: "#121212",   
            }}
            style={{ width: "100%", height: "500px" }}
          />
      )}

    </div>
  );
};

export default HeatmapPnl;
