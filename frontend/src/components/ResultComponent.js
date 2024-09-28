// src/components/ResultComponent.js
import React from 'react';

const ResultComponent = ({ results }) => {
  return (
    <div>
      <h2>Option Pricing Results</h2>
      {results ? (
        <div>
          <p>Option Price: {results.option_price}</p>
          <h3>Greeks</h3>
          <p>Delta: {results.greeks?.delta}</p>
          <p>Gamma: {results.greeks?.gamma}</p>
          <p>Theta: {results.greeks?.theta}</p>
          <p>Vega: {results.greeks?.vega}</p>
          <p>Rho: {results.greeks?.rho}</p>
        </div>
      ) : (
        <p>No results yet</p>
      )}
    </div>
  );
};

export default ResultComponent;
