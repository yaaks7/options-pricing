from fastapi import FastAPI
from pydantic import BaseModel
from model import BlackScholes, Binomial, MonteCarlo
from greeks import Greeks

# Initialiser l'application FastAPI
app = FastAPI()

# Modèle de données d'entrée pour les calculs d'options
class OptionPricingInput(BaseModel):
    time_to_maturity: float  # En années
    strike: float
    current_price: float
    volatility: float
    interest_rate: float
    model_type: str  # 'black_scholes', 'binomial', 'monte_carlo'
    option_type: str = 'call'  # 'call' ou 'put'
    steps: int = 100  # Nombre de pas pour le modèle binomial
    num_simulations: int = 10000  # Nombre de simulations pour le modèle Monte Carlo

# Endpoint pour calculer le prix des options
@app.post("/calculate_price/")
def calculate_price(data: OptionPricingInput):
    if data.model_type == 'black_scholes':
        model = BlackScholes(data.time_to_maturity, data.strike, data.current_price, data.volatility, data.interest_rate)
    elif data.model_type == 'binomial':
        model = Binomial(data.time_to_maturity, data.strike, data.current_price, data.volatility, data.interest_rate, steps=data.steps, option_type=data.option_type)
    elif data.model_type == 'monte_carlo':
        model = MonteCarlo(data.time_to_maturity, data.strike, data.current_price, data.volatility, data.interest_rate, num_simulations=data.num_simulations, num_steps=data.steps, option_type=data.option_type)
    else:
        return {"error": "Invalid model type"}

    # Calcul du prix
    model.calculate()
    if data.option_type == 'call':
        return {"call_price": model.get_call_price()}
    elif data.option_type == 'put':
        return {"put_price": model.get_put_price()}

# Endpoint pour calculer les Greeks (seulement Black-Scholes)
@app.post("/calculate_greeks/")
def calculate_greeks(data: OptionPricingInput):
    # Utiliser le modèle Black-Scholes pour calculer les Greeks
    model = BlackScholes(data.time_to_maturity, data.strike, data.current_price, data.volatility, data.interest_rate)
    model.calculate()
    greeks = Greeks(model, data.option_type)

    # Retourner les Greeks
    return {
        "delta": greeks.delta(),
        "gamma": greeks.gamma(),
        "vega": greeks.vega(),
        "theta": greeks.theta(),
        "rho": greeks.rho()
    }

# Endpoint de test pour vérifier que l'API fonctionne
@app.get("/")
def read_root():
    return {"message": "API is running successfully!"}
