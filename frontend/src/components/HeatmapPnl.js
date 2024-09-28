import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { fetchHeatmapPnl } from '../services/api';

const HeatmapPnl = ({ strikePrice, timeToMaturity, interestRate }) => {
  const [purchasePrice, setPurchasePrice] = useState('');
  const [volatilityRange, setVolatilityRange] = useState({ min: '', max: '' });
  const [spotPriceRange, setSpotPriceRange] = useState({ min: '', max: '' });
  const [heatmapData, setHeatmapData] = useState(null);
  const [optionType, setOptionType] = useState('call');  // Valeur par défaut : "call"

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
    setOptionType(e.target.value);  // Met à jour l'option choisie (call ou put)
  };

  const generateHeatmap = async () => {
    if (!purchasePrice || !volatilityRange.min || !volatilityRange.max || !spotPriceRange.min || !spotPriceRange.max) {
      console.error('Tous les champs doivent être remplis');
      return;
    }

    // Conversion des pourcentages en décimales pour la volatilité et le taux d'intérêt
    const interestRateDecimal = parseFloat(interestRate) / 100;  // Convertir l'interest rate
    const minVolatilityDecimal = parseFloat(volatilityRange.min) / 100;  // Convertir min volatility
    const maxVolatilityDecimal = parseFloat(volatilityRange.max) / 100;  // Convertir max volatility

    const data = {
      purchase_price: parseFloat(purchasePrice),
      min_volatility: minVolatilityDecimal,
      max_volatility: maxVolatilityDecimal,
      min_spot_price: parseFloat(spotPriceRange.min),
      max_spot_price: parseFloat(spotPriceRange.max),
      strike: parseFloat(strikePrice),
      time_to_maturity: parseFloat(timeToMaturity),
      interest_rate: interestRateDecimal  // Utilisation du taux d'intérêt converti
    };

    try {
      const response = await fetchHeatmapPnl(data);

      // Utilise la matrice correspondante (call ou put) en fonction du choix de l'utilisateur
      const pnlMatrix = optionType === 'call' ? response.pnl_matrix_call : response.pnl_matrix_put;

      setHeatmapData({
        x: response.volatilities,
        y: response.spot_prices,
        z: pnlMatrix,  // Sélectionner la bonne matrice en fonction du choix
        type: 'heatmap',
        colorscale: [
          [0, 'rgb(165, 0, 38)'],    // Rouge profond pour le P&L négatif
          [0.5, 'rgb(255, 255, 191)'],  // Jaune pour les valeurs neutres
          [1, 'rgb(0, 104, 55)']    // Vert foncé pour le P&L positif
        ],
        zmin: -50,
        zmax: 50
      });
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
    }
  };

  return (
    <div>
      <h3>Heatmap P&L</h3>
      <form onSubmit={(e) => { e.preventDefault(); generateHeatmap(); }}>
        <label>
          Purchase Price:
          <input type="number" name="purchasePrice" value={purchasePrice} onChange={handleInputChange} required />
        </label>
        <label>
          Volatility Min (%):
          <input type="number" name="volatilityMin" value={volatilityRange.min} onChange={handleInputChange} required />
        </label>
        <label>
          Volatility Max (%):
          <input type="number" name="volatilityMax" value={volatilityRange.max} onChange={handleInputChange} required />
        </label>
        <label>
          Spot Price Min:
          <input type="number" name="spotPriceMin" value={spotPriceRange.min} onChange={handleInputChange} required />
        </label>
        <label>
          Spot Price Max:
          <input type="number" name="spotPriceMax" value={spotPriceRange.max} onChange={handleInputChange} required />
        </label>

        {/* Sélection du type d'option */}
        <div>
          <label>
            <input type="radio" name="optionType" value="call" checked={optionType === 'call'} onChange={handleOptionTypeChange} />
            Call
          </label>
          <label>
            <input type="radio" name="optionType" value="put" checked={optionType === 'put'} onChange={handleOptionTypeChange} />
            Put
          </label>
        </div>

        <button type="submit">Generate Heatmap</button>
      </form>

      {/* Affichage de la Heatmap */}
      {heatmapData && (
        <Plot
          data={[heatmapData]}
          layout={{
            title: `P&L Heatmap (${optionType.toUpperCase()})`,
            xaxis: { 
              title: 'Volatility',
              tickmode: 'linear',
              dtick: 0.05  // Ticks pour la volatilité
            },
            yaxis: { 
              title: 'Spot Price',
              tickmode: 'linear',
              dtick: 10  // Ticks pour le prix spot
            },
            autosize: true
          }}
          style={{ width: "100%", height: "500px" }}
        />
      )}
    </div>
  );
};

export default HeatmapPnl;
