"""
api_requests.py

This script is designed to test the backend API endpoints for the option pricing models and other functionalities 
(such as Greeks calculation). It sends requests to a local FastAPI server and outputs the results.

Features:
---------
- Tests multiple option pricing models including Black-Scholes, Binomial, Monte Carlo, and Neural Network.
- Sends requests to calculate Greeks (e.g., delta, gamma, theta, vega, rho).
- Can be run directly to start testing the API functionality by automatically sending requests.

Author:
---------
- Yanis AKS
- Project: Options Pricing Application
- Date: October 2024
"""
import requests
import subprocess
import time

# API URL
BASE_URL = "https://kind-linet-yanis-42a45c58.koyeb.app/"

# Data for option requests
option_data = {
    "time_to_maturity": 2,
    "strike": 130,
    "current_price": 200,
    "volatility": 0.30,
    "interest_rate": 0.05
}

montecarlo_data = {
    **option_data,
    "num_simulations": 10000,
    "num_steps": 100
}

binomial_data = {
    **option_data,
    "steps": 100,
    "is_american": False
}

def start_api_server():
    subprocess.Popen(["start", "cmd", "/k", "start_api.bat"], shell=True)
    time.sleep(3)

def send_black_scholes():
    """Send request for Black-Scholes."""
    url = f"{BASE_URL}/price/blackscholes"
    response = requests.post(url, json=option_data)
    print("Black-Scholes Prices:", response.json())

def send_binomial():
    """Send request for Binomial."""
    url = f"{BASE_URL}/price/binomial"
    response = requests.post(url, json=binomial_data)
    print("Binomial Prices:", response.json())

def send_montecarlo():
    """Send request for Monte Carlo."""
    url = f"{BASE_URL}/price/montecarlo"
    response = requests.post(url, json=montecarlo_data)
    print("Monte Carlo Prices:", response.json())

def send_neural_network():
    """Send request for Neural Network."""
    url = f"{BASE_URL}/price/neuralnetwork"
    response = requests.post(url, json=option_data)
    print("Neural Network Prices:", response.json())

def send_greeks():
    """Send request for Greeks."""
    url = f"{BASE_URL}/greeks"
    response = requests.post(url, json=option_data)
    print("Greeks:", response.json())


if __name__ == "__main__":
    start_api_server()
    time.sleep(2)  

    # Testing all 4 models
    print("---- Testing Black-Scholes ----")
    send_black_scholes()

    print("---- Testing Binomial ----")
    send_binomial()

    print("---- Testing Monte Carlo ----")
    send_montecarlo()

    print("---- Testing Neural Network ----")
    send_neural_network()

    # Testing Greeks
    print("---- Testing Greeks ----")
    send_greeks()
