// src/pages/docs/NeuralNetwork.js
import React from 'react';
import '../../styles/NeuralNetwork.css'; 
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

const NeuralNetwork = () => {
  return (
    <div className="documentation-containerN">
      <h1 className="doc-titleN">Neural Network Model Documentation</h1>
      
      <div className="doc-sectionN">
        <p>
          The neural network model we developed allows for predicting the prices of options (calls and puts) using a set of characteristics, including time to maturity, strike price, current price of the underlying asset, volatility, interest rate, and the type of option (call or put). Unlike analytical models such as Black-Scholes, this model relies on machine learning techniques to approximate the complex relationships between these parameters.
        </p>
      </div>

      <div className="doc-sectionN">
        <h2>Assumptions and Methodology:</h2>
        <ul>
          <li>
            <strong>Training Data Generation:</strong> Training data was generated using the Black-Scholes model. In the absence of real historical data, we assumed that the prices calculated by the Black-Scholes model are representative of actual market prices.
            The model assumes, therefore, that the Black-Scholes predictions are accurate, and it uses these synthetic data to learn the underlying relationships.
          </li>
          <li>
            The generated data cover specific parameter ranges, for example:
            <ul>
              <li>Time to maturity: between 0.5 and 10 years.</li>
              <li>Strike price: between 10 and 500.</li>
              <li>Current price of the underlying asset: between 10 and 500.</li>
              <li>Volatility: between 0.01 (1%) and 0.80 (80%).</li>
              <li>Interest rate: between 0.01 (1%) and 0.50 (50%).</li>
            </ul>
          </li>
          <li>
            <strong>Neural Network Structure:</strong> The model is a Multi-Layer Perceptron (MLP) consisting of several hidden layers:
            <ul>
              <li>128 units in the first two layers,</li>
              <li>64 units in the third layer,</li>
              <li>32 units in the fourth layer,</li>
              <li>and a single output unit predicting the option price.</li>
            </ul>
            The network uses the ReLU activation function and is trained with the Adam gradient descent algorithm.
          </li>
          <li>
            <strong>Training and Validation:</strong> The model is trained on a large dataset (up to 1 million samples). Early stopping is implemented to avoid overfitting, with the process halting automatically if the loss on the validation set does not improve after 15 consecutive epochs. The data are normalized using a MinMaxScaler to help the network learn more effectively.
          </li>
        </ul>
      </div>

      <div className="doc-sectionN">
        <h2>Limitations</h2>
        <ul>
          <li>
            <strong>Dependency on Black-Scholes Model:</strong> Since the training data comes from the Black-Scholes model, all assumptions and limitations of that model are also inherited by the neural network. For example, the model does not account for dividends and assumes constant volatility. If the Black-Scholes model does not accurately reflect market conditions, the neural network’s predictions will also be inaccurate.
          </li>
          <li>
            <strong>Range of Validity of Data:</strong> The neural network makes accurate predictions only for parameter values within the training ranges. For example:
            <ul>
              <li>Strike: 10 to 500</li>
              <li>Current Price: 10 to 500</li>
              <li>Volatility: 0.01 to 0.80</li>
            </ul>
            If the user enters values outside these ranges, the model may return aberrant results, as it has not learned to handle these scenarios.
          </li>
          <li>
            <strong>Generalized Predictions:</strong> Unlike analytical models that provide results based on precise mathematical formulas, the neural network is an approximation. This means it can produce faster predictions, but it can also be less accurate in particular cases, especially for extreme parameters or situations that the model has never encountered during training.
          </li>
        </ul>
      </div>

    </div>
  );
};

export default NeuralNetwork;
