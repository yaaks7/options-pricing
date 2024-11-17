// src/components/GreeksSensitivity.js
import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { fetchGreeksSensitivity } from '../services/api';
import '../App.css'; 
import '../styles/Modelling.css'; 

const GreeksSensitivityGraph = ({ currentPrice, strikePrice, timeToMaturity, volatility, interestRate, pricesGenerated, setLoading }) => {
  const [parameter, setParameter] = useState('volatility');  
  const [greek, setGreek] = useState('delta');  
  const [minParam, setMinParam] = useState(0.1); 
  const [maxParam, setMaxParam] = useState(0.5); 
  const [graphData, setGraphData] = useState(null); 
  const [optionType, setOptionType] = useState('call'); 

  useEffect(() => {
    switch (parameter) {
      case 'volatility':
        setMinParam(10); 
        setMaxParam(50);
        break;
      case 'current_price':
        setMinParam(10); 
        setMaxParam(100);
        break;
      case 'strike':
        setMinParam(50);  
        setMaxParam(150);
        break;
      case 'time_to_maturity':
        setMinParam(0.1);
        setMaxParam(5);
        break;
      default:
        break;
    }
  }, [parameter]);

  const generateGraph = async () => {
    setLoading(true);
    const volatilityDecimal = parameter === 'volatility'
      ? { min_volatility: parseFloat(minParam) / 100, max_volatility: parseFloat(maxParam) / 100 }
      : {};

    const fixedParams = {
      current_price: parseFloat(currentPrice),
      strike: parseFloat(strikePrice),
      time_to_maturity: parseFloat(timeToMaturity),
      interest_rate: parseFloat(interestRate) / 100,  // Taux d'intérêt en décimal
      ...volatilityDecimal,
      min_strike: parameter === 'strike' ? parseFloat(minParam) : undefined,
      max_strike: parameter === 'strike' ? parseFloat(maxParam) : undefined,
      min_current_price: parameter === 'current_price' ? parseFloat(minParam) : undefined,
      max_current_price: parameter === 'current_price' ? parseFloat(maxParam) : undefined,
      min_time_to_maturity: parameter === 'time_to_maturity' ? parseFloat(minParam) : undefined,
      max_time_to_maturity: parameter === 'time_to_maturity' ? parseFloat(maxParam) : undefined,
      steps: 50
    };

    const data = {
      greek: greek, 
      parameter: parameter, 
      fixed_params: fixedParams,
      steps: 50
    };

    try {
      const response = await fetchGreeksSensitivity(data); 

      console.log('API Response:', response);

      const plotData = {
        x: response.values,
        y: response[optionType], 
        type: 'scatter',
        mode: 'lines',
        name: `${greek.toUpperCase()} Sensitivity (${optionType})`
      };

      setGraphData([plotData]); 
    } catch (error) {
      console.error('Error fetching sensitivity data:', error);
    }

    if (!pricesGenerated) {
      alert("Please generate the option prices first.");
      return;
    }
    setLoading(false);
  };

  const getLabel = (param) => {
    switch (param) {
      case 'volatility':
        return ['Volatility Min (%) :', 'Volatility Max (%) :'];
      case 'current_price':
        return ['Current Price Min ($) :', 'Current Price Max ($) :'];
      case 'strike':
        return ['Strike Price Min ($) :', 'Strike Price Max ($) :'];
      case 'time_to_maturity':
        return ['Time To Maturity Min (Years) :', 'Time To Maturity Max (Years) :'];
      default:
        return ['Min:', 'Max:'];
    }
  };

  const [minLabel, maxLabel] = getLabel(parameter); 

  return (
    <div className="sensitivity-graph">
      <h3>Greeks Sensitivity Graph</h3>

      {/* Greek Selection */}
      <div className="controls-grid">
        <div className="input-field">
          <label>
            Greek to calculate :
            <select value={greek} onChange={(e) => setGreek(e.target.value)}>
              <option value="delta">Delta</option>
              <option value="gamma">Gamma</option>
              <option value="theta">Theta</option>
              <option value="vega">Vega</option>
              <option value="rho">Rho</option>
            </select>
          </label>
        </div>

        {/* Parameter to vary */}
        <div className="input-field">
        <label>
          Parameter to vary :
          <select value={parameter} onChange={(e) => setParameter(e.target.value)}>
            <option value="volatility">Volatility</option>
            <option value="strike">Strike Price</option>
            <option value="current_price">Current Price</option>
            <option value="time_to_maturity">Time to Maturity</option>
          </select>
        </label>
        </div>
      

        {/* Min & Max */}
        <div className="input-field">
          <label>
            {minLabel}
            <input type="number" value={minParam} onChange={(e) => setMinParam(e.target.value)} min="0" required />
          </label>
          </div>
          <div className="input-field">
          <label>
            {maxLabel}
            <input type="number" value={maxParam} onChange={(e) => setMaxParam(e.target.value)} min="0" required />
          </label>
        </div>

        {/* Call or Put */}
        <div className="input-field">
        <label>
          Option Type :
          <select value={optionType} onChange={(e) => setOptionType(e.target.value)}>
            <option value="call">Call</option>
            <option value="put">Put</option>
          </select>
        </label> 
        </div>
      </div>
      <button onClick={generateGraph} className="generate-button">Generate</button>

        {/* Plot */}
        {graphData && (
          <Plot
            data={graphData}
            layout={{
              title: {
                text: `${greek.toUpperCase()} vs ${parameter.replace('_', ' ')}`,
                font: { color: "#7C3AED" } 
              },
              xaxis: { 
                title: {
                  text: parameter.replace('_', ' '),
                  font: { color: "#7C3AED" } 
                },
                color: "#7C3AED"  
              },
              yaxis: { 
                title: {
                  text: `${greek.toUpperCase()} Value`,
                  font: { color: "#7C3AED" } 
                },
                color: "#7C3AED"  
              },
              autosize: true,
              paper_bgcolor: "#1E1E1E",  
              plot_bgcolor: "#121212", 
            }}
            style={{ width: "100%", height: "500px" }}
            className="plotly-graph"
          />
        )}

    </div>
  );
};

export default GreeksSensitivityGraph;
