import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Dropout

class LSTM:
    def __init__(self, time_to_maturity: float, strike: float, current_price: float, volatility: float, interest_rate: float):
        self.time_to_maturity = time_to_maturity
        self.strike = strike
        self.current_price = current_price
        self.volatility = volatility
        self.interest_rate = interest_rate
        self.model = None
        self.scaler = MinMaxScaler(feature_range=(0, 1))
    
    def fetch_data(self, tickers, start_date="2010-01-01", end_date="2023-01-01"):
        """Collecte des données d'actions réelles pour plusieurs tickers"""
        all_data = []
        for ticker in tickers:
            data = yf.download(ticker, start=start_date, end=end_date)
            data['Return'] = np.log(data['Close'] / data['Close'].shift(1))
            data.dropna(inplace=True)
            all_data.append(data[['Close', 'Return']])
        
        combined_data = pd.concat(all_data, axis=0)  # Combine les données de plusieurs actifs
        return combined_data

    def prepare_data(self, data):
        """Prépare les données pour l'entraînement du modèle LSTM"""
        scaled_data = self.scaler.fit_transform(data)

        X, y = [], []
        window_size = 60  # 60 jours de séquences
        for i in range(window_size, len(scaled_data)):
            X.append(scaled_data[i-window_size:i, 0])  # Prix de clôture sur 60 jours
            y.append(scaled_data[i, 0])  # Prix de clôture à prédire

        X, y = np.array(X), np.array(y)
        X = np.reshape(X, (X.shape[0], X.shape[1], 1))  # Reshape pour LSTM
        return X, y

    def create_lstm_model(self, input_shape):
        """Création du modèle LSTM"""
        model = Sequential()
        model.add(LSTM(units=50, return_sequences=True, input_shape=input_shape))
        model.add(Dropout(0.2))
        model.add(LSTM(units=50, return_sequences=False))
        model.add(Dropout(0.2))
        model.add(Dense(units=25))
        model.add(Dense(units=1))  # Prédiction du prix de l'option

        model.compile(optimizer='adam', loss='mean_squared_error')
        self.model = model

    def train_model(self, tickers):
        """Entraîner le modèle avec des données réelles provenant de plusieurs actifs"""
        # Collecter les données
        data = self.fetch_data(tickers=tickers)
        X, y = self.prepare_data(data)

        # Diviser les données en ensembles d'entraînement et de test
        train_size = int(len(X) * 0.8)
        X_train, X_test = X[:train_size], X[train_size:]
        y_train, y_test = y[:train_size], y[train_size:]

        # Créer et entraîner le modèle LSTM
        self.create_lstm_model((X_train.shape[1], 1))
        self.model.fit(X_train, y_train, batch_size=64, epochs=10)

    def calculate(self):
        """Calculer le prix de l'option en utilisant le modèle LSTM"""
        # Utilisation des paramètres time_to_maturity, strike, current_price, volatility, interest_rate
        inputs = np.array([[self.current_price, self.strike, self.time_to_maturity, self.volatility, self.interest_rate]])
        inputs_scaled = self.scaler.transform(inputs)

        # Reshape les inputs pour correspondre aux attentes du LSTM
        inputs_scaled = np.reshape(inputs_scaled, (inputs_scaled.shape[0], 1, inputs_scaled.shape[1]))

        # Prédiction du prix de l'option
        predicted_price = self.model.predict(inputs_scaled)
        predicted_price = self.scaler.inverse_transform(predicted_price)
        self.option_price = predicted_price[0][0]
    
    def get_option_price(self):
        """Retourner le prix de l'option calculé"""
        return self.option_price

if __name__ == "__main__":
    # Exemple d'utilisation
    tickers = ["AAPL", "TSLA", "NVDA", "AMZN", "MSFT", "GOOGL", "META", "AMD", "NFLX", "BABA",
               "INTC", "V", "PYPL", "ADBE", "DIS", "CRM", "JPM", "BAC", "XOM", "WMT"]

    lstm_model = LSTM(time_to_maturity=1, strike=120, current_price=130, volatility=0.25, interest_rate=0.03)
    lstm_model.train_model(tickers=tickers)  # Entraîner le modèle sur plusieurs actifs
    lstm_model.calculate()  # Calculer le prix d'une option avec le LSTM
    print(f"Prix de l'option LSTM : {lstm_model.get_option_price()}")
