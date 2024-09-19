import requests
import subprocess
import time

# URL de base de l'API
BASE_URL = "http://127.0.0.1:8000"

# Données de l'option pour les requêtes
option_data = {
    "time_to_maturity": 2,
    "strike": 130,
    "current_price": 200,
    "volatility": 0.30,
    "interest_rate": 0.05,
    "option_type": "call"
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
    # Lancer le fichier batch pour démarrer Uvicorn
    subprocess.Popen(["start", "cmd", "/k", "start_api.bat"], shell=True)
    # Attendre quelques secondes pour que le serveur démarre
    time.sleep(3)

def send_black_scholes():
    """Envoie une requête pour tester le modèle Black-Scholes."""
    url = f"{BASE_URL}/price/blackscholes"
    response = requests.post(url, json=option_data)
    print("Black-Scholes Price:", response.json())

def send_binomial():
    """Envoie une requête pour tester le modèle Binomial."""
    url = f"{BASE_URL}/price/binomial"
    response = requests.post(url, json=binomial_data)
    print("Binomial Price:", response.json())

def send_montecarlo():
    """Envoie une requête pour tester le modèle Monte Carlo."""
    url = f"{BASE_URL}/price/montecarlo"
    response = requests.post(url, json=montecarlo_data)
    print("Monte Carlo Price:", response.json())

def send_neural_network():
    """Envoie une requête pour tester le modèle Neural Network."""
    url = f"{BASE_URL}/price/neuralnetwork"
    response = requests.post(url, json=option_data)
    print("Neural Network Price:", response.json())

def send_greeks():
    """Envoie une requête pour calculer les Greeks."""
    url = f"{BASE_URL}/greeks"
    response = requests.post(url, json=option_data)
    print("Greeks:", response.json())


if __name__ == "__main__":
    start_api_server()
    time.sleep(2)  # Wait for the server to start
    
    # Test des 4 modèles de pricing
    print("---- Testing Black-Scholes ----")
    send_black_scholes()

    print("---- Testing Binomial ----")
    send_binomial()

    print("---- Testing Monte Carlo ----")
    send_montecarlo()

    print("---- Testing Neural Network ----")
    send_neural_network()

    # Test des Greeks
    print("---- Testing Greeks ----")
    send_greeks()
