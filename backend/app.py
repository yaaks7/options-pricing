from fastapi import FastAPI
from pydantic import BaseModel
from model import BlackScholes, Binomial, MonteCarlo
from mlp_model import NeuralNetwork
from greeks import Greeks

app = FastAPI()

class OptionData(BaseModel):
    time_to_maturity: float
    strike: float
    current_price: float
    volatility: float
    interest_rate: float
    option_type: str  # 'call' or 'put'

class MonteCarloData(OptionData):
    num_simulations: int
    num_steps: int

class BinomialData(OptionData):
    steps: int
    is_american: bool

@app.post("/price/blackscholes")
def calculate_black_scholes(option_data: OptionData):
    model = BlackScholes(
        time_to_maturity=option_data.time_to_maturity,
        strike=option_data.strike,
        current_price=option_data.current_price,
        volatility=option_data.volatility,
        interest_rate=option_data.interest_rate,
        option_type=option_data.option_type
    )
    model.calculate()
    return {"price": model.get_option_price()}

@app.post("/price/binomial")
def calculate_binomial(option_data: BinomialData):
    model = Binomial(
        time_to_maturity=option_data.time_to_maturity,
        strike=option_data.strike,
        current_price=option_data.current_price,
        volatility=option_data.volatility,
        interest_rate=option_data.interest_rate,
        steps=option_data.steps,
        option_type=option_data.option_type,
        is_american=option_data.is_american
    )
    model.calculate()
    return {"price": model.get_option_price()}

@app.post("/price/montecarlo")
def calculate_monte_carlo(option_data: MonteCarloData):
    model = MonteCarlo(
        time_to_maturity=option_data.time_to_maturity,
        strike=option_data.strike,
        current_price=option_data.current_price,
        volatility=option_data.volatility,
        interest_rate=option_data.interest_rate,
        num_simulations=option_data.num_simulations,
        num_steps=option_data.num_steps,
        option_type=option_data.option_type
    )
    model.calculate()
    return {"price": model.get_option_price()}

@app.post("/price/neuralnetwork")
def calculate_neural_network(option_data: OptionData):
    model = NeuralNetwork(
        time_to_maturity=option_data.time_to_maturity,
        strike=option_data.strike,
        current_price=option_data.current_price,
        volatility=option_data.volatility,
        interest_rate=option_data.interest_rate,
        option_type=option_data.option_type
    )
    model.load()
    price = model.get_option_price()
    return {"price": float(price)}  # Convertir numpy.float32 en float standard


@app.post("/greeks")
def calculate_greeks(option_data: OptionData):
    bs_model = BlackScholes(
        time_to_maturity=option_data.time_to_maturity,
        strike=option_data.strike,
        current_price=option_data.current_price,
        volatility=option_data.volatility,
        interest_rate=option_data.interest_rate,
        option_type=option_data.option_type
    )
    bs_model.calculate()

    greeks = Greeks(bs_model, option_type=option_data.option_type)
    return {
        "delta": greeks.delta(),
        "gamma": greeks.gamma(),
        "vega": greeks.vega(),
        "theta": greeks.theta(),
        "rho": greeks.rho()
    }

# Run the FastAPI application with Uvicorn (e.g., from terminal)
# uvicorn app:app --reload
