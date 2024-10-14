import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // Correct imports
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
import Background from './components/Background';

function App() {
  const [historyRequest, setHistoryRequest] = useState(null);

  // Function to handle loading previous requests from History
  const handleLoadHistory = (entry) => {
    setHistoryRequest(entry);
  };

  // Clear localStorage when the window is closed
  useEffect(() => {
    // When the page is loaded, set a session flag
    sessionStorage.setItem('page_loaded', 'true');

    // Handle the beforeunload event
    window.onbeforeunload = (e) => {
      // Check if the page is being refreshed or the user is leaving the site
      if (!sessionStorage.getItem('page_loaded')) {
        localStorage.removeItem('history');  // Clear localStorage only when the page is left, not refreshed
      }
    };

    return () => {
      // When the component unmounts (page is closed), remove the session flag
      sessionStorage.removeItem('page_loaded');
    };
  }, []);

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/modeling" element={<Modeling historyRequest={historyRequest} />} />
        <Route path="/history" element={<History onLoadHistory={handleLoadHistory} />} />
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
