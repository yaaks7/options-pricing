from fastapi import FastAPI
from pydantic import BaseModel
from model import BlackScholes, Binomial, MonteCarlo
from greeks import Greeks
from mlp_model import NeuralNetwork

# Initialize FastAPI
app = FastAPI()

# Data model for option pricing input
class OptionPricingInput(BaseModel):
    time_to_maturity: float  # In years
    strike: float
    current_price: float
    volatility: float
    interest_rate: float
    type_choose: str  # 'black_scholes', 'binomial', 'monte_carlo', 'mlp'
    option_type: str = 'call'  # 'call' or 'put'
    steps: int = 100  # Number of steps for Binomial model
    num_simulations: int = 10000  # Number of simulations for Monte Carlo model

    class Config:
        protected_namespaces = ()  # Autorise l'utilisation de 'model_type'

@app.post("/calculate_price/")
def calculate_price(data: OptionPricingInput):

    if data.type_choose == 'black_scholes':
        model = BlackScholes(data.time_to_maturity, data.strike, data.current_price, data.volatility, data.interest_rate)
    elif data.type_choose == 'binomial':
        model = Binomial(data.time_to_maturity, data.strike, data.current_price, data.volatility, data.interest_rate, steps=data.steps, option_type=data.option_type)
    elif data.type_choose == 'monte_carlo':
        model = MonteCarlo(data.time_to_maturity, data.strike, data.current_price, data.volatility, data.interest_rate, num_simulations=data.num_simulations, num_steps=data.steps, option_type=data.option_type)
    elif data.type_choose == 'mlp':
        model = NeuralNetwork(data.time_to_maturity, data.strike, data.current_price, data.volatility, data.interest_rate, data.option_type)
        model.load()  # Load the trained model
    else:
        return {"error": "Invalid model type"}

    model.calculate()

    # Use get_option_price for all models
    return {"option_price": model.get_option_price(data.option_type)}

# Endpoint for calculating Greeks (Black-Scholes only)
@app.post("/calculate_greeks/")
def calculate_greeks(data: OptionPricingInput):
    model = BlackScholes(data.time_to_maturity, data.strike, data.current_price, data.volatility, data.interest_rate)
    model.calculate()
    greeks = Greeks(model, data.option_type)

    return {
        "delta": greeks.delta(),
        "gamma": greeks.gamma(),
        "vega": greeks.vega(),
        "theta": greeks.theta(),
        "rho": greeks.rho()
    }

# Test endpoint to verify the API is running
@app.get("/")
def read_root():
    return {"message": "API is running successfully!"}
