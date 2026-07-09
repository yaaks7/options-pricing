// src/components/OptionSensitivity.js
import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { fetchOptionSensitivity } from '../services/api';
import { baseLayout, axisStyle, titleStyle } from '../styles/plotlyTheme';
import '../App.css';
import '../styles/Modelling.css';

const OptionSensitivityGraph = ({ currentPrice, strikePrice, timeToMaturity, volatility, selectedModels, pricesGenerated, setLoading }) => {
  const [parameter, setParameter] = useState('volatility');  
  const [minParam, setMinParam] = useState('0.1');  
  const [maxParam, setMaxParam] = useState('0.5'); 
  const [selectedModelTypes, setSelectedModelTypes] = useState(selectedModels); 
  const [graphData, setGraphData] = useState(null); 
  const [optionType, setOptionType] = useState('call');  

  // Correspondance to Backend name
  const modelMap = {
    'BlackScholes': 'Black-Scholes',
    'Binomial': 'Binomial',
    'MonteCarlo': 'Monte-Carlo',
    'NeuralNetwork': 'Neural Network',
  };

  const backendModelMap = {
    'Black-Scholes': 'BlackScholes',
    'Binomial': 'Binomial',
    'Monte-Carlo': 'MonteCarlo',
    'Neural Network': 'NeuralNetwork',
  };


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

    if (!pricesGenerated) {
      alert("Please generate the option prices first.");
      return;
    }

    if (!selectedModelTypes || selectedModelTypes.length === 0) {
      alert("Please select at least one model.");
      return;
    }

    const backendModelTypes = selectedModelTypes.map(model => backendModelMap[model]);

    const volatilityDecimal = parameter === 'volatility'
      ? { min_volatility: parseFloat(minParam) / 100, max_volatility: parseFloat(maxParam) / 100 }
      : {};


    const fixedParams = {
      current_price: parseFloat(currentPrice),
      strike: parseFloat(strikePrice),
      time_to_maturity: parseFloat(timeToMaturity),
      ...volatilityDecimal,  
      min_strike: parameter === 'strike' ? parseFloat(minParam) : undefined,
      max_strike: parameter === 'strike' ? parseFloat(maxParam) : undefined,
      min_current_price: parameter === 'current_price' ? parseFloat(minParam) : undefined,
      max_current_price: parameter === 'current_price' ? parseFloat(maxParam) : undefined,
      min_time_to_maturity: parameter === 'time_to_maturity' ? parseFloat(minParam) : undefined,
      max_time_to_maturity: parameter === 'time_to_maturity' ? parseFloat(maxParam) : undefined,
      steps: 50 
    };

    // Prepare Data for API request
    const data = {
      model_type: backendModelTypes, 
      parameter: parameter,  
      fixed_params: fixedParams,
      steps: 15 
    };

    try {
      const response = await fetchOptionSensitivity(data);  

      console.log('API Response:', response);

      if (!response[optionType] || Object.keys(response[optionType]).length === 0) {
        console.error(`No data returned from API for ${optionType} prices`);
        return;
      }

      const plotData = Object.keys(response[optionType]).map((model) => ({
        x: response.values,
        y: response[optionType][model],
        type: 'scatter',
        mode: 'lines',
        name: `${modelMap[model]} (${optionType === 'call' ? 'Call' : 'Put'})` 
      }));

      setGraphData(plotData);
    } catch (error) {
      console.error('Error fetching sensitivity data:', error);
    }
    setLoading(false);
  };

  const handleModelSelection = (model) => {
    setSelectedModelTypes((prevSelected) =>
      prevSelected.includes(model)
        ? prevSelected.filter((m) => m !== model)
        : [...prevSelected, model]
    );
  };



  return (
    <div className="sensitivity-graph">
      <div className="controls-grid">
        <div className="input-field">
          <label>Parameter to vary:</label>
          <select 
            value={parameter} 
            onChange={(e) => setParameter(e.target.value)}
          >
            <option value="volatility">Volatility</option>
            <option value="strike">Strike Price</option>
            <option value="current_price">Current Price</option>
            <option value="time_to_maturity">Time to Maturity</option>
          </select>
        </div>

        <div className="input-field">
          <label>Minimum value:</label>
          <input
            type="number"
            value={minParam}
            onChange={(e) => setMinParam(e.target.value)}
            min="0"
            required
          />
        </div>

        <div className="input-field">
          <label>Maximum value:</label>
          <input
            type="number"
            value={maxParam}
            onChange={(e) => setMaxParam(e.target.value)}
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

      {/* Model Selection */}
      <div className="model-selection">
        <h4>Select Models for Sensitivity Graph:</h4>
        {Object.keys(modelMap).map((model) => (
          <label key={model} className="checkbox-group">
            <input
              type="checkbox"
              checked={selectedModelTypes.includes(modelMap[model])}
              onChange={() => handleModelSelection(modelMap[model])}
            />
            <span>{modelMap[model]}</span>
          </label>
        ))}
      </div>

      <button onClick={generateGraph} className="generate-button">
        Generate
      </button>

      {graphData && (
        <Plot
          data={graphData}
          layout={{
            ...baseLayout,
            responsive: true,
            useResizeHandler: true,
            title: titleStyle(`Option Price vs ${parameter.replace('_', ' ')}`),
            xaxis: axisStyle(parameter.replace('_', ' ')),
            yaxis: axisStyle('Option Price'),
            autosize: true,
            margin: { t: 50, r: 50, b: 50, l: 50 },
            showlegend: true,
          }}
          className="plotly-graph"
          config={{ 
            responsive: true,
            displayModeBar: true,
            displaylogo: false
          }}
        />
      )}
    </div>
  );
};

export default OptionSensitivityGraph;
