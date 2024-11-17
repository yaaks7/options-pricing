import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import tradingImage from '../images/stock-trading.jpg';

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section avec effet de gradient */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="gradient-text">Options Price Calculator</h1>
          <p className="hero-description">
            A simple and intuitive tool to calculate options prices using different models: 
            Black-Scholes, Monte-Carlo, Binomial, and Neural Network approaches.
          </p>
          <Link to="/modeling">
            <button className="cta-button">
              <span>Start Pricing</span>
              <svg className="arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </Link>
        </div>
        <div className="hero-image-container">
          <div className="image-overlay"></div>
          <img src={tradingImage} alt="Trading Dashboard" className="hero-image" />
        </div>
      </section>

      {/* Features Section avec meilleure mise en page */}
      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h2>Multiple Models</h2>
          <p>Compare results between different pricing models to get a better understanding of option values.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎯</div>
          <h2>Easy to Use</h2>
          <p>Simple interface to input your parameters and get instant pricing results.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📈</div>
          <h2>Visual Results</h2>
          <p>View option prices and Greeks through interactive charts and graphs.</p>
        </div>
      </section>

      {/* Documentation Section avec style amélioré */}
      <section className="docs-section">
        <h2>Learn More</h2>
        <div className="docs-grid">
          {['Black-Scholes', 'Binomial', 'Monte-Carlo', 'Neural Network', 'Greeks'].map((doc) => (
            <Link 
              to={`/documentation/${doc.toLowerCase().replace(' ', '-')}`} 
              className="doc-link"
              key={doc}
            >
              {doc}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;