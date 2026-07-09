import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, MousePointerClick, LineChart, ArrowRight } from 'lucide-react';
import '../styles/Home.css';
import tradingImage from '../images/stock-trading.jpg';

const MODELS = ['Black-Scholes', 'Binomial', 'Monte Carlo', 'Neural Network'];

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-eyebrow">Pricing engine</span>
          <h1 className="hero-title">Four models. One engine.</h1>
          <p className="hero-description">
            Price options with Black-Scholes, Binomial, Monte Carlo, and a trained neural
            network, then inspect the Greeks and sensitivity across every parameter.
          </p>
          <div className="hero-model-list">
            {MODELS.map((model) => (
              <span className="hero-model-chip" key={model}>{model}</span>
            ))}
          </div>
          <Link to="/modeling">
            <button className="cta-button">
              <span>Start pricing</span>
              <ArrowRight size={18} strokeWidth={2} />
            </button>
          </Link>
        </div>
        <div className="hero-image-container">
          <div className="image-overlay"></div>
          <img src={tradingImage} alt="Trading dashboard" className="hero-image" />
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="feature-card">
          <Layers className="feature-icon" size={28} strokeWidth={1.5} />
          <h2>Multiple models</h2>
          <p>Compare results across pricing models to understand how each one values an option.</p>
        </div>
        <div className="feature-card">
          <MousePointerClick className="feature-icon" size={28} strokeWidth={1.5} />
          <h2>Straightforward inputs</h2>
          <p>Set your parameters once and get pricing results back instantly.</p>
        </div>
        <div className="feature-card">
          <LineChart className="feature-icon" size={28} strokeWidth={1.5} />
          <h2>Visual results</h2>
          <p>Read prices and Greeks through interactive charts, heatmaps, and sensitivity curves.</p>
        </div>
      </section>

      {/* Documentation */}
      <section className="docs-section">
        <h2>Learn more</h2>
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