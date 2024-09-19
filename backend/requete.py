import requests

# URL du serveur local
url = "http://127.0.0.1:8000/price/blackscholes"

# Les données de la requête
data = {
    "time_to_maturity": 2,
    "strike": 130,
    "current_price": 200,
    "volatility": 0.30,
    "interest_rate": 0.05,
    "option_type": "call"
}

# Envoyer la requête POST
response = requests.post(url, json=data)

# Afficher la réponse
print(response.status_code)  # Pour vérifier le code de statut
print(response.json())       # Pour voir la réponse JSON
