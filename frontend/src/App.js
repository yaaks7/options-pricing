// src/App.js
import React, { useState } from 'react';
import FormComponent from './components/FormComponent';
import ResultComponent from './components/ResultComponent';
import './App.css';

function App() {
  const [results, setResults] = useState(null);

  return (
    <div className="App">
      <h1>Options Pricing App</h1>
      <FormComponent setResults={setResults} />
      <ResultComponent results={results} />
    </div>
  );
}

export default App;
