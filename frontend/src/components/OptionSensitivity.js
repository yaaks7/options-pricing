import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { fetchOptionSensitivity } from '../services/api';

const OptionSensitivityGraph = ({ currentPrice, strikePrice, timeToMaturity, volatility, selectedModels, pricesGenerated }) => {
  const [parameter, setParameter] = useState('volatility');  // Paramètre à faire varier
  const [minParam, setMinParam] = useState('0.1');  // Valeur min
  const [maxParam, setMaxParam] = useState('0.5');  // Valeur max
  const [selectedModelTypes, setSelectedModelTypes] = useState(selectedModels);  // Modèles sélectionnés pour le graphique
  const [graphData, setGraphData] = useState(null);  // Données du graphique
  const [optionType, setOptionType] = useState('call');  // Type d'option (Call ou Put)

  // Correspondance des noms de modèles pour l'utilisateur et le backend
  const modelMap = {
    'BlackScholes': 'Black-Scholes',
    'Binomial': 'Binomial',
    'MonteCarlo': 'Monte-Carlo',
    'NeuralNetwork': 'Neural Network',
  };

  // Correspondance pour le backend
  const backendModelMap = {
    'Black-Scholes': 'BlackScholes',
    'Binomial': 'Binomial',
    'Monte-Carlo': 'MonteCarlo',
    'Neural Network': 'NeuralNetwork',
  };

  // Mettre à jour les valeurs par défaut selon le paramètre sélectionné
  useEffect(() => {
    switch (parameter) {
      case 'volatility':
        setMinParam(10);  // Afficher 10% pour l'utilisateur
        setMaxParam(50);  // Afficher 50% pour l'utilisateur
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

  // Fonction pour générer le graphique
  const generateGraph = async () => {

    if (!pricesGenerated) {
      alert("Please generate the option prices first.");
      return;
    }
    // Vérification que les modèles sont bien sélectionnés
    if (!selectedModelTypes || selectedModelTypes.length === 0) {
      alert("Please select at least one model.");
      return;
    }

    // Créer la liste des modèles à envoyer au backend avec la bonne casse
    const backendModelTypes = selectedModelTypes.map(model => backendModelMap[model]);

    // Conversion de la volatilité en décimal si sélectionnée
    const volatilityDecimal = parameter === 'volatility'
      ? { min_volatility: parseFloat(minParam) / 100, max_volatility: parseFloat(maxParam) / 100 }
      : {};

    // Préparer les paramètres fixes
    const fixedParams = {
      current_price: parseFloat(currentPrice),
      strike: parseFloat(strikePrice),
      time_to_maturity: parseFloat(timeToMaturity),
      ...volatilityDecimal,  // Utiliser la volatilité en décimal
      min_strike: parameter === 'strike' ? parseFloat(minParam) : undefined,
      max_strike: parameter === 'strike' ? parseFloat(maxParam) : undefined,
      min_current_price: parameter === 'current_price' ? parseFloat(minParam) : undefined,
      max_current_price: parameter === 'current_price' ? parseFloat(maxParam) : undefined,
      min_time_to_maturity: parameter === 'time_to_maturity' ? parseFloat(minParam) : undefined,
      max_time_to_maturity: parameter === 'time_to_maturity' ? parseFloat(maxParam) : undefined,
      steps: 50  // Nombre d'étapes fixé à 50
    };

    // Préparer les données pour la requête API
    const data = {
      model_type: backendModelTypes,  // Modèles sélectionnés
      parameter: parameter,  // Paramètre à faire varier
      fixed_params: fixedParams,
      steps: 50  // Nombre de pas (fixé à 50)
    };

    try {
      const response = await fetchOptionSensitivity(data);  // Appel à l'API

      // Affichage des réponses dans la console pour déboguer
      console.log('API Response:', response);

      // Assurer que des données sont retournées
      if (!response[optionType] || Object.keys(response[optionType]).length === 0) {
        console.error(`No data returned from API for ${optionType} prices`);
        return;
      }

      // Préparer les données du graphique pour chaque modèle
      const plotData = Object.keys(response[optionType]).map((model) => ({
        x: response.values,
        y: response[optionType][model],
        type: 'scatter',
        mode: 'lines',
        name: `${modelMap[model]} (${optionType === 'call' ? 'Call' : 'Put'})`  // Nom de la courbe selon le modèle
      }));

      setGraphData(plotData);  // Mise à jour des données du graphique
    } catch (error) {
      console.error('Error fetching sensitivity data:', error);
    }
  };

  // Gérer la sélection des modèles pour le graphique
  const handleModelSelection = (model) => {
    setSelectedModelTypes((prevSelected) =>
      prevSelected.includes(model)
        ? prevSelected.filter((m) => m !== model)  // Retirer le modèle si déjà sélectionné
        : [...prevSelected, model]  // Ajouter le modèle si non sélectionné
    );
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
    <div className="options-sensitivity">
      <h3>Option Sensitivity Graph</h3>

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

      {/* Sélection des modèles disponibles */}
      <div>
        <h4>Select Models for Sensitivity Graph:</h4>
        {Object.keys(modelMap).map((model) => (
          <label className="wrapper" key={model}>
            <span>{modelMap[model]}</span>
            <span>
              <input
                type="checkbox"
                checked={selectedModelTypes.includes(modelMap[model])}
                onChange={() => handleModelSelection(modelMap[model])}
              />
            </span>
            <div className="clearboth"></div> {/* Clear floats */}
          </label>
        ))}
      </div>

      <button onClick={generateGraph}>Generate Sensitivity Graph</button>

      {/* Affichage du graphique */}
      {graphData && (
        <Plot
          data={graphData}
          layout={{
            title: {
              text: `Option Price vs ${parameter.replace('_', ' ')}`,
              font: { color: "#E5EFC1" }  // Text color for title
            },
            xaxis: { 
              title: {
                text: parameter.replace('_', ' '),
                font: { color: "#E5EFC1" }  // Text color for axis
              },
              color: "#E5EFC1"  // Tick labels color
            },
            yaxis: { 
              title: {
                text: 'Option Price',
                font: { color: "#E5EFC1" }  // Text color for axis
              },
              color: "#E5EFC1"  // Tick labels color
            },
            autosize: true,
            paper_bgcolor: "#1E1E1E",  // Background color of the entire chart
            plot_bgcolor: "#121212",   // Background color of the plot area
          }}
          style={{ width: "100%", height: "500px" }}
        />
      )}

    </div>
  );
};

export default OptionSensitivityGraph;
