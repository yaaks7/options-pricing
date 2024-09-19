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

    if response.status_code != 200:
        print(f"HTTP error {response.status_code}: {response.text}")
        return
    
    try:
        response_data = response.json()
        print(f"Réponse de l'API : {response_data}")
        return response_data
    except Exception as e:
        print(f"Erreur lors de l'interprétation de la réponse : {e}, Réponse brute : {response.text}")
        raise e


def calculate_greeks(data):
    url = f"{BASE_URL}/calculate_greeks/"
    response = requests.post(url, json=data)
    return response.json()

if __name__ == "__main__":
    start_api_server()
    time.sleep(2)  # Wait for the server to start

    model_types = ['black_scholes', 'binomial', 'monte_carlo', 'mlp']

    for model_type in model_types:
        price_data = {
            "time_to_maturity": 2,
            "strike": 120,
            "current_price": 110,
            "volatility": 0.25,
            "interest_rate": 0.03,
            "model_type": model_type,
            "option_type": "call",
            "steps": 100,  # Binomial-specific
            "num_simulations": 10000  # Monte Carlo-specific
        }

        try:
            price_result = calculate_price(price_data)
            print(f"Prix de l'option ({model_type}) :", price_result)
        except Exception as e:
            print(f"Erreur pour {model_type}: {e}")

        # Appeler l'API pour calculer les Greeks avec Black-Scholes
        #greeks_result = calculate_greeks(price_data)
        #print("Greeks :", greeks_result)

