// src/pages/docs/BlackScholes.js
import React from 'react';
import '../../styles/BlackScholes.css'; 
import BlackScholesImage from '../../images/blackscholes.png';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const BlackScholes = () => {
  return (
    <div className="documentation-container">
      <h1 className="doc-title">Black-Scholes Model</h1>
      
      <section className="doc-section">
        <p>
          The Black-Scholes model is a mathematical tool used to calculate the theoretical price of European call and put options. Developed by Fischer Black and Myron Scholes in 1973, this model relies on several key assumptions regarding market behavior. It is widely used in finance to assess the fair value of options and assists traders, investors, and financial analysts in making decisions.
        </p>
      </section>

      <section className="doc-section">
        <h2>Assumptions</h2>
        <ul>
          <li>Efficient Markets: Asset prices reflect all available information, ensuring markets are efficient.</li>
          <li>No Dividends: The underlying stocks do not pay dividends during the option's life.</li>
          <li>Absence of Arbitrage: There are no risk-free profit opportunities, meaning achievable profits are balanced by the market.</li>
          <li>Log-Normal Distribution of Prices: Asset prices follow a log-normal distribution.</li>
          <li>Constant Interest Rate: The risk-free interest rate is constant during the option's life.</li>
          <li>Constant Volatility: The volatility of the underlying asset's returns is constant during the option's life.</li>
        </ul>
      </section>

      <section className="doc-section">
        <h2>Formulas</h2>

        <div className="doc-equations">
          <p>The formulas for calculating the prices of European call and put options are as follows:</p>
          <BlockMath math={`C = S_0 N(d_1) - X e^{-rT} N(d_2)`} />
          <BlockMath math={`P = X e^{-rT} N(-d_2) - S_0 N(-d_1)`} />
          <p>where:</p>
          <ul>
            <li><InlineMath>C</InlineMath> and <InlineMath>P</InlineMath> represent the call and put option prices, respectively.</li>
            <li><InlineMath>S_0</InlineMath> is the current price of the underlying asset.</li>
            <li><InlineMath>X</InlineMath> is the strike price of the option.</li>
            <li><InlineMath>T</InlineMath> is the time until the option's expiration (in years).</li>
            <li><InlineMath>r</InlineMath> is the risk-free interest rate.</li>
            <li><InlineMath>N(\cdot)</InlineMath> is the cumulative distribution function of the normal distribution.</li>
          </ul>
          <BlockMath math={`d_1 = \\frac{\\ln(\\frac{S_0}{X}) + (r + \\frac{\\sigma^2}{2})T}{\\sigma \\sqrt{T}}`} />
          <BlockMath math={`d_2 = d_1 - \\sigma \\sqrt{T}`} />
          <p>where <InlineMath>\sigma</InlineMath> represents the volatility of the underlying asset's returns.</p>
          <p>
              Intuitively, <strong>d₁</strong> measures the expected growth in the asset price, adjusted for volatility and time, while <strong>d₂</strong> accounts for the uncertainty. 
              Higher values of <strong>d₁</strong> and <strong>d₂</strong> suggest a greater probability of the option finishing "in-the-money".
          </p>
          <h3>Behavior of the Formula Under Different Conditions</h3>
          <p>
            <ul>
                <li><strong>As Time (T) Decreases:</strong> The value of the option approaches its intrinsic value (i.e., max(S₀ - X, 0)). Options lose their "time value" as expiration nears, making them less valuable. This is known as "time decay."</li>
                <li><strong>When Volatility (σ) Increases:</strong> Higher volatility leads to a greater potential range for the underlying asset price, which can increase the call option's value. It reflects the higher chance of the asset reaching the strike price.</li>
                <li><strong>Impact of Interest Rate (r):</strong> A higher risk-free rate reduces the present value of the strike price (X), making the call option more valuable. Conversely, a lower rate has the opposite effect.</li>
            </ul>
          </p>
        </div>
      </section>

      <div className="doc-section">
        <h2>Graphical Representation of the Black-Scholes Model</h2>
        <p>
            The figure below illustrates the theoretical pricing of a European call option using the Black-Scholes model. 
            The graph shows how the call option price varies depending on the underlying asset's spot price and the time 
            remaining until the option's expiry. As the spot price increases, the value of the call option also tends to 
            rise, reflecting the higher likelihood of the option finishing "in-the-money". Additionally, the closer the 
            option is to its expiry date, the steeper the price gradient becomes, highlighting the time-decay effect on 
            the option's value.
        </p>
        <div className="doc-image">
          <img src={BlackScholesImage} alt="Black-Scholes Option Pricing Graph"/>
        </div>
      </div>

      <section className="doc-section">
        <h2>Limitations</h2>
        <ul>
          <li>No Dividend Handling: The classical model does not account for dividends. Adjustments are needed for options on dividend-paying stocks.</li>
          <li>Assumption of Constant Volatility: In reality, market volatility can change over time, which the model does not account for.</li>
          <li>Constant Interest Rate: The interest rate can also fluctuate in the market.</li>
          <li>Perfect Market Assumptions: The assumptions about efficient markets and the absence of arbitrage are not always valid.</li>
        </ul>
      </section>

    </div>
  );
};

export default BlackScholes;
