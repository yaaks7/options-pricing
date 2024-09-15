import requests
import subprocess
import time

BASE_URL = "http://127.0.0.1:8000"

def start_api_server():
    # Lancer le fichier batch pour démarrer Uvicorn
    subprocess.Popen(["start", "cmd", "/k", "start_api.bat"], shell=True)
    # Attendre quelques secondes pour que le serveur démarre
    time.sleep(3)

def calculate_price(data):
    url = f"{BASE_URL}/calculate_price/"
    response = requests.post(url, json=data)
    return response.json()

def calculate_greeks(data):
    url = f"{BASE_URL}/calculate_greeks/"
    response = requests.post(url, json=data)
    return response.json()

if __name__ == "__main__":
    # Démarrer le serveur Uvicorn via le script batch
    start_api_server()

    # Attendre quelques secondes pour s'assurer que le serveur est prêt
    time.sleep(2)

    try:
        # Test des différents modèles
        model_types = ['black_scholes', 'binomial', 'monte_carlo', 'mlp']

        for model_type in model_types:
            # Données d'entrée pour calculer le prix d'une option
            price_data = {
                "time_to_maturity": 2,
                "strike": 120,
                "current_price": 110,
                "volatility": 0.25,
                "interest_rate": 0.03,
                "model_type": "binomial",  
                "option_type": "call",
                "steps": 100,  # Utilisé pour le modèle binomial et Monte Carlo
                "num_simulations": 10000  # Utilisé pour le modèle Monte Carlo
            }

            # Appeler l'API pour calculer le prix
            price_result = calculate_price(price_data)
            print(f"Prix de l'option ({model_type}) :", price_result)

        # Appeler l'API pour calculer les Greeks avec Black-Scholes
        greeks_result = calculate_greeks(price_data)
        print("Greeks :", greeks_result)

    except Exception as e:
        print(f"Erreur : {e}")
