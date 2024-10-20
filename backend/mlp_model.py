"""
mlp_model.py

This module implements a neural network model for pricing options. The model is based on a Multi-Layer Perceptron (MLP) architecture and uses synthetic data generated from the Black-Scholes model for training. It can predict the price of both call and put options based on several input parameters.

The primary functions include:
- Generating synthetic training data using the Black-Scholes model
- Defining and training an MLP model for option pricing
- Saving and loading the trained model and data scaler
- Using the trained model to predict option prices

Classes:
----------
    NeuralNetwork: A class that encapsulates the MLP model, including methods for generating data, training, and prediction.


Author:
---------
- Yanis AKS
- Project: Options Pricing Application
- Date: October 2024
"""
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras import layers, models, optimizers, regularizers # type: ignore
from sklearn.model_selection import train_test_split
from keras.models import Sequential # type: ignore
from keras.layers import Dense # type: ignore
from sklearn.preprocessing import MinMaxScaler
from keras.models import load_model # type: ignore
from keras.layers import Dropout # type: ignore
from keras.regularizers import l2 # type: ignore
from keras.callbacks import EarlyStopping # type: ignore
from keras.optimizers import Adam # type: ignore
import os
import joblib  # For saving and loading the scaler

class NeuralNetwork:
    def __init__(self, time_to_maturity, strike, current_price, volatility, interest_rate, option_type='call'):
        self.time_to_maturity = time_to_maturity
        self.strike = strike
        self.current_price = current_price
        self.volatility = volatility
        self.interest_rate = interest_rate
        self.option_type = option_type
        self.model = None
        self.scaler = MinMaxScaler()

        # Ensure the 'mlp' folder exists to store model and scaler
        self.save_dir = "mlp"
        if not os.path.exists(self.save_dir):
            os.makedirs(self.save_dir)

    def generate_data(self, num_samples=1000000):
        from model import BlackScholes

        # Generate synthetic data using Black-Scholes model
        data = []
        for _ in range(num_samples):
            time_to_maturity = np.random.uniform(0.5, 10)  # in years
            strike = np.random.uniform(10, 500)
            current_price = np.random.uniform(10, 500)
            volatility = np.random.uniform(0.01, 0.80)
            interest_rate = np.random.uniform(0.01, 0.50)
            option_type = np.random.choice(['call', 'put'])  # Randomly choose call or put

            # Use Black-Scholes model for price calculation
            BS = BlackScholes(time_to_maturity, strike, current_price, volatility, interest_rate, option_type)
            BS.calculate()

            price = BS.get_option_price()

            # Append all inputs, including option_type (0 for put, 1 for call)
            option_type_binary = 1 if option_type == 'call' else 0
            data.append([time_to_maturity, strike, current_price, volatility, interest_rate, option_type_binary, price])

        return pd.DataFrame(data, columns=['time_to_maturity', 'strike', 'current_price', 'volatility', 'interest_rate', 'option_type', 'price'])

    def MLP(self, input_shape):
    # Create an MLP model with more layers and units
        model = Sequential()
        model.add(Dense(128, input_dim=input_shape, activation='relu'))
        model.add(Dense(128, activation='relu'))
        model.add(Dense(64, activation='relu'))
        model.add(Dense(32, activation='relu'))
        model.add(Dense(1))  # Single output: option price

        model.compile(optimizer='adam', loss='mean_squared_error')
        self.model = model
        
    def train(self, num_samples=1000000):
        df = self.generate_data(num_samples)

        X = df[['time_to_maturity', 'strike', 'current_price', 'volatility', 'interest_rate', 'option_type']]
        y = df['price']

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)


        self.MLP(input_shape=X_train_scaled.shape[1])

        # EarlyStopping 
        early_stopping = tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=15, restore_best_weights=True)

        self.model.fit(X_train_scaled, y_train, epochs=50, batch_size=64, validation_data=(X_test_scaled, y_test),
                       callbacks=[early_stopping], verbose=1)

        # Final Evalutation
        test_loss = self.model.evaluate(X_test_scaled, y_test, verbose=1)
        print(f"Test set evaluation - Loss: {test_loss}")

        # Save
        self.model.save(os.path.join(self.save_dir, 'NeuralNetwork.h5'))
        joblib.dump(self.scaler, os.path.join(self.save_dir, 'scaler.pkl'))
        print("Modèle et scaler sauvegardés.")
    
    def load(self):
        # Check if the model and scaler exist, else train the model
        if not os.path.exists(os.path.join(self.save_dir, 'NeuralNetwork.h5')):
            self.train()
        else:
            self.model = load_model(os.path.join(self.save_dir, 'NeuralNetwork.h5'))
            self.scaler = joblib.load(os.path.join(self.save_dir, 'scaler.pkl'))

    def calculate(self):
        # Prepares the inputs for prediction, including the option_type
        inputs = np.array([[self.time_to_maturity, self.strike, self.current_price, self.volatility, self.interest_rate, 1 if self.option_type == 'call' else 0]])
    
        # Scale the inputs
        inputs_scaled = self.scaler.transform(inputs)
    
        # Predict the price using the neural network model
        predicted_price = self.model.predict(inputs_scaled)
    
        return predicted_price[0][0]


    def get_option_price(self):
        return self.calculate()
    
    def calculate_with_dataframe(self, input_data):
        # Scale the input data using the DataFrame, not a raw array
        inputs_scaled = self.scaler.transform(input_data)

        # Predict the price
        predicted_price = self.model.predict(inputs_scaled)
        return predicted_price[0][0]



