// src/pages/docs/Binomial.js
import React from 'react';
import '../../styles/Binomial.css'; 
import binomialImage from '../../images/binomial.png';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

const Binomial = () => {
    return (
        <div className="documentation-container">
            <h1 className="doc-title">Binomial Model Documentation</h1>
            
            <div className="doc-section">
                <p>
                    The Binomial Model is a numerical method used to calculate the prices of European and American options. 
                    It is particularly useful for American options as it considers the possibility of exercising the option at any time before expiration.
                </p>
            </div>

            <div className="doc-section">
                <h2>Assumptions</h2>
                <ul>
                    <li>Discrete price evolution: The underlying asset's price can move in two ways at each time step: it either goes up (up factor <InlineMath>u</InlineMath>) or down (down factor <InlineMath>d</InlineMath>).</li>
                    <li>No-arbitrage markets: Risk-neutral probabilities are calculated to eliminate any risk-free profit opportunities.</li>
                    <li>Constant interest rate: The model assumes a constant risk-free interest rate over the life of the option.</li>
                    <li>Constant volatility: The volatility of the underlying asset is assumed to be constant throughout the life of the option.</li>
                </ul>
            </div>

            <div className="doc-section">
              <h2>Formulas</h2>
              <div className="doc-equations">
                  <p>
                      The up (<InlineMath>u</InlineMath>) and down (<InlineMath>d</InlineMath>) factors are calculated as follows:
                  </p>
                  <BlockMath>
                      {`u = e^{\\sigma\\sqrt{\\Delta t}}`}
                  </BlockMath>
                  <BlockMath>
                      {`d = e^{-\\sigma\\sqrt{\\Delta t}} = \\frac{1}{u}`}
                  </BlockMath>
                  <p>
                      Where <InlineMath>\sigma</InlineMath> is the volatility of the asset and <InlineMath>\Delta t</InlineMath> is the time step duration.
                  </p>
                  <p>
                      The risk-neutral probabilities of an upward movement (<InlineMath>p</InlineMath>) and a downward movement (<InlineMath>1 - p</InlineMath>) are defined as:
                  </p>
                  <BlockMath>
                      {`p = \\frac{e^{r\\Delta t} - d}{u - d}`}
                  </BlockMath>
                  <p>
                      Where <InlineMath>r</InlineMath> is the risk-free interest rate.
                  </p>
                  <p>
                      For a European call option, the payoff at maturity is:
                  </p>
                  <BlockMath>
                      {`C = \\text{max}(S - X, 0)`}
                  </BlockMath>
                  <p>
                      For a European put option, the payoff at maturity is:
                  </p>
                  <BlockMath>
                      {`P = \\text{max}(X - S, 0)`}
                  </BlockMath>
                  <p>
                      Where:
                      <ul>
                          <li><InlineMath>S</InlineMath> is the current price of the underlying asset.</li>
                          <li><InlineMath>X</InlineMath> is the exercise price of the option.</li>
                      </ul>
                  </p>
              </div>
          </div>


          <div className="doc-section">
          <h2>Binomial Tree</h2>
                <p>
                    Below is a visual representation of a binomial tree, which illustrates the possible paths the underlying asset price can take 
                    at each step in time. Each node represents a potential price, calculated using the up and down factors discussed above.
                </p>
                <div className="doc-image">
                    <img src={binomialImage} alt="Binomial Tree" />
                </div>
            </div>


            <div className="doc-section">
                <h2>Limitations</h2>
                <ul>
                    <li>Parameter Sensitivity: The model relies on multiple parameters (volatility, interest rate, number of steps). Errors in these values can affect result accuracy.</li>
                    <li>Complexity with Large Steps: To achieve more precise results, the number of steps in the tree must be increased, making the calculations more cumbersome.</li>
                    <li>Simplified Assumptions: The model assumes constant volatility and interest rates, which may not always reflect real market conditions.</li>
                    <li>Discrepancy with Real Options: The model is less effective for options with dividends or complex features, sometimes requiring additional adjustments.</li>
                </ul>
            </div>
        </div>
    );
};

export default Binomial;
