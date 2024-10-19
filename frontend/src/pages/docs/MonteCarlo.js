// src/pages/docs/MonteCarlo.js
import React from 'react';
import '../../styles/MonteCarlo.css'; 
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

const MonteCarlo = () => {
    return (
        <div className="documentation-container">
            <h1 className="doc-title">Monte Carlo Model Documentation</h1>
            
            <div className="doc-section">
                <p>
                    The Monte Carlo model is a numerical method used to estimate option prices by simulating numerous possible scenarios of the underlying asset's price evolution. 
                    Unlike analytical models like Black-Scholes, Monte Carlo does not rely on closed-form formulas but uses simulation techniques to generate random trajectories. 
                    This makes it suitable for evaluating options with complex features that cannot be easily modeled by other methods.
                </p>
            </div>

            <div className="doc-section">
                <h2>Assumptions</h2>
                  <ul>
                      <li>Stochastic Process: Prices evolve randomly following a log-normal distribution.</li>
                      <li>Absence of Arbitrage: Simulations respect market conditions with no opportunities for risk-free profit.</li>
                      <li>Constant Interest Rate and Volatility: These parameters are assumed to be constant throughout the life of the option.</li>
                      <li>Random Sampling: Each simulation represents a possible scenario, and the model averages these simulations.</li>
                  </ul>
            </div>
            


            <div className="doc-section">
              <h2>Formulas & Methods</h2>
              <div className="doc-equations">
 
                    <p>
                        The simulation is based on geometric Brownian motion, where future prices are modeled by:
                    </p>
                    <BlockMath>
                        {`S(t + \\Delta t) = S(t) \\cdot e^{(r - \\frac{1}{2}\\sigma^2)\\Delta t + \\sigma \\sqrt{\\Delta t}Z}`}
                    </BlockMath>
                    <p>
                        where:
                        <ul>
                            <li><InlineMath>S(t)</InlineMath> is the current price of the underlying asset,</li>
                            <li><InlineMath>r</InlineMath> is the risk-free interest rate,</li>
                            <li><InlineMath>\sigma</InlineMath> is the volatility,</li>
                            <li><InlineMath>\Delta t</InlineMath> is the time step duration (in years),</li>
                            <li><InlineMath>Z</InlineMath> is a random variable following a normal distribution.</li>
                        </ul>
                    </p>

                <h3>Simulated Path Calculation:</h3>
                <p>Generate multiple possible paths for the underlying asset price using the formula above.
                Then, take the average of the final values to calculate the option price.</p>
                
                <h3>Option Pricing Calculation:</h3>
                <p>For European Call and Put options, the formulas are:</p>

                  <BlockMath>
                      {`\\text{Call} = \\text{max}(S - X, 0)`}
                  </BlockMath>
                  <BlockMath>
                      {`\\text{Put} = \\text{max}(X - S, 0)`}
                  </BlockMath>

                <p>The final price is the average of the discounted values obtained for each simulation.</p>
              </div>
            </div>

            <div className="doc-section">
                <h2>Limitations</h2>
                <ul>
                    <li>Computation Speed: Since the model relies on generating thousands or even millions of scenarios, computations can be lengthy and resource-intensive.</li>
                    <li>Parameter Sensitivity: Results can vary depending on the number of simulations, time steps, and the precision of other parameters.</li>
                    <li>Market Assumptions: While flexible, the model still relies on simplifying assumptions (constant volatility, no arbitrage).</li>
                </ul>
            </div>
    
        </div>
    );
};

export default MonteCarlo;
