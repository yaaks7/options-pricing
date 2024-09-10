import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from keras.models import Sequential
from keras.layers import Dense
from sklearn.preprocessing import MinMaxScaler
from keras.models import load_model
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

    def generate_data(self, num_samples=100000):
        from model import BlackScholes

        # Generate synthetic data using Black-Scholes model
        data = []
        for _ in range(num_samples):
            time_to_maturity = np.random.uniform(0.01, 2)  # in years
            strike = np.random.uniform(50, 150)
            current_price = np.random.uniform(50, 150)
            volatility = np.random.uniform(0.1, 0.5)
            interest_rate = np.random.uniform(0.01, 0.05)

            # Use Black-Scholes model for price calculation
            BS = BlackScholes(time_to_maturity, strike, current_price, volatility, interest_rate)
            BS.calculate()

            if self.option_type == 'call':
                price = BS.get_call_price()
            else:
                price = BS.get_put_price()

            data.append([time_to_maturity, strike, current_price, volatility, interest_rate, price])

        return pd.DataFrame(data, columns=['time_to_maturity', 'strike', 'current_price', 'volatility', 'interest_rate', 'price'])

    def MLP(self, input_shape):
        # Create an MLP model
        model = Sequential()
        model.add(Dense(64, input_dim=input_shape, activation='relu'))
        model.add(Dense(64, activation='relu'))
        model.add(Dense(1))  # Single output: option price

        model.compile(optimizer='adam', loss='mean_squared_error')
        self.model = model

    def train(self, num_samples=100000):
        # Generate data and train the model
        df = self.generate_data(num_samples)
        X = df[['time_to_maturity', 'strike', 'current_price', 'volatility', 'interest_rate']]
        y = df['price']

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Scale the data
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Create and train the model
        self.MLP(input_shape=X_train_scaled.shape[1])
        self.model.fit(X_train_scaled, y_train, epochs=10, batch_size=32, verbose=1)

        # Save the trained model and the scaler to the 'mlp' folder
        self.model.save(os.path.join(self.save_dir, 'NeuralNetwork.h5'))
        joblib.dump(self.scaler, os.path.join(self.save_dir, 'scaler.pkl'))
        print("Model and scaler saved successfully in the 'mlp' folder.")

    def load(self):
        # Load the saved model and scaler from the 'mlp' folder
        self.model = load_model(os.path.join(self.save_dir, 'NeuralNetwork.h5'))
        self.scaler = joblib.load(os.path.join(self.save_dir, 'scaler.pkl'))
        print("Model and scaler loaded successfully.")

    def calculate(self):
        # Scale the input data and predict
        inputs = np.array([[self.time_to_maturity, self.strike, self.current_price, self.volatility, self.interest_rate]])
        inputs_scaled = self.scaler.transform(inputs)

        # Predict the price
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



