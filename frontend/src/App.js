// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Modeling from './pages/Modeling';
import History from './pages/History';
import Documentation from './pages/Documentation';
import BlackScholes from './pages/docs/BlackScholes';
import Binomial from './pages/docs/Binomial';
import MonteCarlo from './pages/docs/MonteCarlo';
import NeuralNetwork from './pages/docs/NeuralNetwork';
import Greeks from './pages/docs/Greeks';
import Header from './components/Header';
import Background from './components/Background'

function App() {
  return (
    <Router>
      {/*<Background />*/}
      <Header /> {/* Ensure Header appears on every page */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/modeling" element={<Modeling />} />
        <Route path="/history" element={<History />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/documentation/black-scholes" element={<BlackScholes />} />
        <Route path="/documentation/binomial" element={<Binomial />} />
        <Route path="/documentation/monte-carlo" element={<MonteCarlo />} />
        <Route path="/documentation/neural-network" element={<NeuralNetwork />} />
        <Route path="/documentation/greeks" element={<Greeks />} />
      </Routes>
    </Router>
  );
}

export default App;


