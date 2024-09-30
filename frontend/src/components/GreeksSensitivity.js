import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { fetchGreeksSensitivity } from '../services/api';

const GreeksSensitivityGraph = ({ currentPrice, strikePrice, timeToMaturity, volatility, interestRate }) => {
  const [parameter, setParameter] = useState('volatility');  // Paramètre à faire varier
  const [greek, setGreek] = useState('delta');  // Greek à calculer
  const [minParam, setMinParam] = useState(0.1);  // Valeur min
  const [maxParam, setMaxParam] = useState(0.5);  // Valeur max
  const [graphData, setGraphData] = useState(null);  // Données du graphique
  const [optionType, setOptionType] = useState('call');  // Type d'option (Call ou Put)

  // Mettre à jour les valeurs par défaut selon le paramètre sélectionné
  useEffect(() => {
    switch (parameter) {
      case 'volatility':
        setMinParam(10);  // Volatilité en %
        setMaxParam(50);
        break;
      case 'current_price':
        setMinParam(10);  // Prix courant en $
        setMaxParam(100);
        break;
      case 'strike':
        setMinParam(50);  // Strike en $
        setMaxParam(150);
        break;
      case 'time_to_maturity':
        setMinParam(0.1);  // Temps à maturité en années
        setMaxParam(5);
        break;
      default:
        break;
    }
  }, [parameter]);

  // Fonction pour générer le graphique
  const generateGraph = async () => {
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
      greek: greek,  // Greek sélectionné
      parameter: parameter,  // Paramètre à faire varier
      fixed_params: fixedParams,
      steps: 50
    };

    try {
      const response = await fetchGreeksSensitivity(data);  // Appel à l'API

      // Affichage des réponses dans la console pour déboguer
      console.log('API Response:', response);

      const plotData = {
        x: response.values,
        y: response[optionType],  // Call ou Put
        type: 'scatter',
        mode: 'lines',
        name: `${greek.toUpperCase()} Sensitivity (${optionType})`
      };

      setGraphData([plotData]);  // Mise à jour des données du graphique
    } catch (error) {
      console.error('Error fetching sensitivity data:', error);
    }
  };

  // Gérer l'affichage des labels min et max selon le paramètre sélectionné
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

  const [minLabel, maxLabel] = getLabel(parameter);  // Obtenir les labels appropriés

  return (
    <div>
      <h3>Greeks Sensitivity Graph</h3>

      {/* Sélection du greek à calculer */}
      <label>
        Greek to calculate:
        <select value={greek} onChange={(e) => setGreek(e.target.value)}>
          <option value="delta">Delta</option>
          <option value="gamma">Gamma</option>
          <option value="theta">Theta</option>
          <option value="vega">Vega</option>
          <option value="rho">Rho</option>
        </select>
      </label>

      {/* Sélection du paramètre à faire varier */}
      <label>
        Parameter to vary:
        <select value={parameter} onChange={(e) => setParameter(e.target.value)}>
          <option value="volatility">Volatility</option>
          <option value="strike">Strike Price</option>
          <option value="current_price">Current Price</option>
          <option value="time_to_maturity">Time to Maturity</option>
        </select>
      </label>

      {/* Champs pour entrer les valeurs min et max */}
      <label>
        {minLabel}
        <input type="number" value={minParam} onChange={(e) => setMinParam(e.target.value)} required />
      </label>
      <label>
        {maxLabel}
        <input type="number" value={maxParam} onChange={(e) => setMaxParam(e.target.value)} required />
      </label>

      {/* Sélection entre Call et Put */}
      <label>
        Option Type:
        <select value={optionType} onChange={(e) => setOptionType(e.target.value)}>
          <option value="call">Call</option>
          <option value="put">Put</option>
        </select>
      </label>      

      <button onClick={generateGraph}>Generate Sensitivity Graph</button>

      {/* Affichage du graphique */}
      {graphData && (
        <Plot
          data={graphData}
          layout={{
            title: `${greek.toUpperCase()} vs ${parameter.replace('_', ' ')}`,
            xaxis: { title: parameter.replace('_', ' ') },
            yaxis: { title: `${greek.toUpperCase()} Value` },
            autosize: true
          }}
          style={{ width: "100%", height: "500px" }}
        />
      )}
    </div>
  );
};

export default GreeksSensitivityGraph;
