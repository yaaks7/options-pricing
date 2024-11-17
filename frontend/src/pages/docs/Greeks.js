// src/pages/docs/Greeks.js
import React from 'react';
import '../../styles/Greeks.css';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

const Greeks = () => {
    return (
        <div className="documentation-container">
            <h1 className="doc-title">The Greeks</h1>
            
            <div className="doc-section">
                <p>
                    The "Greeks" are sensitivity measures that indicate how the price of an option varies in response to different risk factors. 
                    The main Greeks are Delta, Gamma, Theta, Vega, and Rho. These measures are essential for traders and risk managers to evaluate and manage the risk associated with options portfolios.
                </p>
            </div>

            <div className="doc-section">
                <h2>Delta (<InlineMath>\Delta</InlineMath>):</h2>
                <p>
                    <strong>Delta</strong> measures the sensitivity of the option price to changes in the price of the underlying asset. 
                    For a call option, Delta is usually positive and ranges between 0 and 1. For a put option, Delta is usually negative and ranges between -1 and 0.
                </p>
                <div className="doc-equations">
                    <p><strong>Formula for a European Call Option:</strong></p>
                    <BlockMath>{`\\Delta_{call} = N(d_1)`}</BlockMath>
                    
                    <p><strong>Formula for a European Put Option:</strong></p>
                    <BlockMath>{`\\Delta_{put} = N(d_1) - 1`}</BlockMath>
                </div>

                <h2>Gamma (<InlineMath>\Gamma</InlineMath>):</h2>
                <p>
                    <strong>Gamma</strong> measures the sensitivity of Delta to changes in the price of the underlying asset. 
                    It indicates how much Delta will change for a unit movement in the price of the underlying asset.
                </p>
                <div className="doc-equations">
                    <p><strong>Formula for a European Call or Put Option:</strong></p>
                    <BlockMath>{`\\Gamma = \\frac{N'(d_1)}{S_0 \\sigma \\sqrt{T}}`}</BlockMath>
                    <p>
                        Where <InlineMath>N'(d_1)</InlineMath> is the standard normal distribution density, often noted as the probability density function.
                    </p>
                </div>

                <h2>Theta (<InlineMath>\Theta</InlineMath>):</h2>
                <p>
                    <strong>Theta</strong> measures the sensitivity of the option price to the passage of time, 
                    in other words, the "decay" of the option price. Theta is generally negative as the passage of time decreases the value of an option.
                </p>
                <div className="doc-equations">
                    <p><strong>Formula for a European Call Option:</strong></p>
                    <BlockMath>{`\\Theta_{call} = -\\frac{S_0 N'(d_1) \\sigma}{2\\sqrt{T}} - r Xe^{-rT}N(d_2)`}</BlockMath>
                    
                    <p><strong>Formula for a European Put Option:</strong></p>
                    <BlockMath>{`\\Theta_{put} = -\\frac{S_0 N'(d_1) \\sigma}{2\\sqrt{T}} + r Xe^{-rT}N(-d_2)`}</BlockMath>
                </div>

                <h2>Vega (<InlineMath>\nu</InlineMath>):</h2>
                <p>
                    <strong>Vega</strong> measures the sensitivity of the option price to the volatility of the underlying asset. 
                    Vega is identical for both call and put options and is always positive.
                </p>
                <div className="doc-equations">
                    <p><strong>Formula for a European Call or Put Option:</strong></p>
                    <BlockMath>{`\\nu = S_0 N'(d_1) \\sqrt{T}`}</BlockMath>
                </div>

                <h2>Rho (<InlineMath>\rho</InlineMath>):</h2>
                <p>
                    <strong>Rho</strong> measures the sensitivity of the option price to the risk-free interest rate. 
                    For call options, Rho is generally positive, while for put options, it is negative.
                </p>
                <div className="doc-equations">
                    <p><strong>Formula for a European Call Option:</strong></p>
                    <BlockMath>{`\\rho_{call} = XTe^{-rT}N(d_2)`}</BlockMath>
                    
                    <p><strong>Formula for a European Put Option:</strong></p>
                    <BlockMath>{`\\rho_{put} = -XTe^{-rT}N(-d_2)`}</BlockMath>
                </div>
            </div>
        </div>
    );
};

export default Greeks;
