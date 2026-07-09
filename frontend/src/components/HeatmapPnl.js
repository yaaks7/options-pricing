// src/components/HeatmapPnL.js
import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { fetchHeatmapPnl } from '../services/api';
import { baseLayout, axisStyle, titleStyle, PNL_COLORSCALE } from '../styles/plotlyTheme';
import '../App.css';
import '../styles/Graph.css';

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
        colorscale: PNL_COLORSCALE,
        zmin: -50,
        zmax: 50
      });
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
    }

    setLoading(false);
  };


  return (
    <div className="sensitivity-graph">
      
      <div className="controls-grid">
        <div className="input-field">
          <label>Purchase Price ($):</label>
          <input
            type="number"
            name="purchasePrice"
            value={purchasePrice}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="input-field">
          <label>Volatility Min (%):</label>
          <input
            type="number"
            name="volatilityMin"
            value={volatilityRange.min}
            onChange={handleInputChange}
            min="0"
            required
          />
        </div>

        <div className="input-field">
          <label>Volatility Max (%):</label>
          <input
            type="number"
            name="volatilityMax"
            value={volatilityRange.max}
            onChange={handleInputChange}
            min="0"
            required
          />
        </div>

        <div className="input-field">
          <label>Spot Price Min ($):</label>
          <input
            type="number"
            name="spotPriceMin"
            value={spotPriceRange.min}
            onChange={handleInputChange}
            min="0"
            required
          />
        </div>

        <div className="input-field">
          <label>Spot Price Max ($):</label>
          <input
            type="number"
            name="spotPriceMax"
            value={spotPriceRange.max}
            onChange={handleInputChange}
            min="0"
            required
          />
        </div>

        <div className="input-field">
          <label>Option Type:</label>
          <select
            value={optionType}
            onChange={(e) => setOptionType(e.target.value)}
          >
            <option value="call">Call</option>
            <option value="put">Put</option>
          </select>
        </div>
      </div>

      <button onClick={generateHeatmap} className="generate-button">
        Generate
      </button>

      {heatmapData && (
        <Plot
          data={[heatmapData]}
          layout={{
            ...baseLayout,
            responsive: true,
            useResizeHandler: true,
            title: titleStyle(`P&L Heatmap (${optionType.toUpperCase()})`),
            xaxis: { ...axisStyle('Volatility'), tickmode: 'linear', dtick: 0.05 },
            yaxis: { ...axisStyle('Spot Price'), tickmode: 'linear', dtick: 10 },
            autosize: true,
            margin: { t: 50, r: 50, b: 50, l: 50 }
          }}
          className="plotly-graph"
          config={{ responsive: true }}
        />
      )}
    </div>
  );
};

export default HeatmapPnl;
