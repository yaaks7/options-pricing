"""
app.py

This script serves as the backend API for the Options Pricing application. It is built using FastAPI and provides endpoints 
to calculate option prices, greeks, profit & loss heatmaps, and sensitivities of option pricing and greeks for various models. 
The supported models include Black-Scholes, Binomial, Monte Carlo, and a Neural Network. 

The API facilitates communication between the frontend interface (built with React.js) and backend computation, allowing users 
to input parameters and retrieve calculated results.

Endpoints:
---------
- /price/blackscholes : Calculates Black-Scholes option prices.
- /price/binomial : Calculates Binomial model option prices.
- /price/montecarlo : Calculates Monte Carlo simulation-based option prices.
- /price/neuralnetwork : Retrieves option prices from a trained neural network model.
- /greeks : Calculates Greeks (delta, gamma, vega, theta, rho) for call and put options using Black-Scholes.
- /heatmap_pnl/ : Generates a P&L heatmap for specified volatility and spot price ranges.
- /option_sensitivity/ : Computes the sensitivity of option prices to a chosen parameter across different models.
- /greeks_sensitivity/ : Computes the sensitivity of selected Greeks to a chosen parameter using Black-Scholes.

Author:
---------
- Yanis AKS
- Project: Options Pricing Application
- Date: October 2024
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model import BlackScholes, Binomial, MonteCarlo
from mlp_model import NeuralNetwork
from greeks import Greeks

app = FastAPI()

# Configuration of middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

class OptionData(BaseModel):
    time_to_maturity: float
    strike: float
    current_price: float
    volatility: float
    interest_rate: float

class MonteCarloData(OptionData):
    num_simulations: int
    num_steps: int

class BinomialData(OptionData):
    steps: int
    is_american: bool

@app.post("/price/blackscholes")
def calculate_black_scholes(option_data: OptionData):
    call_model = BlackScholes(
        time_to_maturity=option_data.time_to_maturity,
        strike=option_data.strike,
        current_price=option_data.current_price,
        volatility=option_data.volatility,
        interest_rate=option_data.interest_rate,
        option_type='call'
    )
    call_model.calculate()
    put_model = BlackScholes(
        time_to_maturity=option_data.time_to_maturity,
        strike=option_data.strike,
        current_price=option_data.current_price,
        volatility=option_data.volatility,
        interest_rate=option_data.interest_rate,
        option_type='put'
    )
    put_model.calculate()

    return {
        "call_price": call_model.get_option_price(),
        "put_price": put_model.get_option_price()
    }

@app.post("/price/binomial")
def calculate_binomial(option_data: BinomialData):
    call_model = Binomial(
        time_to_maturity=option_data.time_to_maturity,
        strike=option_data.strike,
        current_price=option_data.current_price,
        volatility=option_data.volatility,
        interest_rate=option_data.interest_rate,
        steps=option_data.steps,
        option_type='call',
        is_american=option_data.is_american
    )
    call_model.calculate()
    
    put_model = Binomial(
        time_to_maturity=option_data.time_to_maturity,
        strike=option_data.strike,
        current_price=option_data.current_price,
        volatility=option_data.volatility,
        interest_rate=option_data.interest_rate,
        steps=option_data.steps,
        option_type='put',
        is_american=option_data.is_american
    )
    put_model.calculate()

    return {
        "call_price": call_model.get_option_price(),
        "put_price": put_model.get_option_price()
    }

@app.post("/price/montecarlo")
def calculate_monte_carlo(option_data: MonteCarloData):
    call_model = MonteCarlo(
        time_to_maturity=option_data.time_to_maturity,
        strike=option_data.strike,
        current_price=option_data.current_price,
        volatility=option_data.volatility,
        interest_rate=option_data.interest_rate,
        num_simulations=option_data.num_simulations,
        num_steps=option_data.num_steps,
        option_type='call'
    )
    call_model.calculate()

    put_model = MonteCarlo(
        time_to_maturity=option_data.time_to_maturity,
        strike=option_data.strike,
        current_price=option_data.current_price,
        volatility=option_data.volatility,
        interest_rate=option_data.interest_rate,
        num_simulations=option_data.num_simulations,
        num_steps=option_data.num_steps,
        option_type='put'
    )
    put_model.calculate()

    return {
        "call_price": call_model.get_option_price(),
        "put_price": put_model.get_option_price()
    }

@app.post("/price/neuralnetwork")
def calculate_neural_network(option_data: OptionData):
    call_model = NeuralNetwork(
        time_to_maturity=option_data.time_to_maturity,
        strike=option_data.strike,
        current_price=option_data.current_price,
        volatility=option_data.volatility,
        interest_rate=option_data.interest_rate,
        option_type='call'
    )
    call_model.load()
    call_price = float(call_model.get_option_price())

    put_model = NeuralNetwork(
        time_to_maturity=option_data.time_to_maturity,
        strike=option_data.strike,
        current_price=option_data.current_price,
        volatility=option_data.volatility,
        interest_rate=option_data.interest_rate,
        option_type='put'
    )
    put_model.load()
    put_price = float(put_model.get_option_price())

    return {
        "call_price": call_price,
        "put_price": put_price
    }

@app.post("/greeks")
def calculate_greeks(option_data: OptionData):
    # Calculation of Greeks for the Call option
    call_bs_model = BlackScholes(
        time_to_maturity=option_data.time_to_maturity,
        strike=option_data.strike,
        current_price=option_data.current_price,
        volatility=option_data.volatility,
        interest_rate=option_data.interest_rate,
        option_type='call'
    )
    call_bs_model.calculate()
    call_greeks = Greeks(call_bs_model, option_type='call')

    # Calculation of Greeks for the Put option
    put_bs_model = BlackScholes(
        time_to_maturity=option_data.time_to_maturity,
        strike=option_data.strike,
        current_price=option_data.current_price,
        volatility=option_data.volatility,
        interest_rate=option_data.interest_rate,
        option_type='put'
    )
    put_bs_model.calculate()
    put_greeks = Greeks(put_bs_model, option_type='put')

    # Return for Call & Put
    return {
        "call": {
            "delta": call_greeks.delta(),
            "gamma": call_greeks.gamma(),
            "vega": call_greeks.vega(),
            "theta": call_greeks.theta(),
            "rho": call_greeks.rho()
        },
        "put": {
            "delta": put_greeks.delta(),
            "gamma": put_greeks.gamma(),
            "vega": put_greeks.vega(),
            "theta": put_greeks.theta(),
            "rho": put_greeks.rho()
        }
    }

from plot import pnl_heatmap

class HeatmapInput(BaseModel):
    purchase_price: float
    min_volatility: float
    max_volatility: float
    min_spot_price: float
    max_spot_price: float
    strike: float
    time_to_maturity: float
    interest_rate: float

@app.post("/heatmap_pnl/")
async def get_heatmap_pnl(data: HeatmapInput):
    pnl_matrix_call, pnl_matrix_put, volatilities, spot_prices = pnl_heatmap(
        data.purchase_price,
        data.min_volatility,
        data.max_volatility,
        data.min_spot_price,
        data.max_spot_price,
        data.strike,
        data.time_to_maturity,
        data.interest_rate
    )
    return {
        "pnl_matrix_call": pnl_matrix_call.tolist(),  # Convert to list for JSON serialization
        "pnl_matrix_put": pnl_matrix_put.tolist(),
        "volatilities": volatilities.tolist(),
        "spot_prices": spot_prices.tolist()
    }

from plot import option_sensitivity

class SensitivityOptionInput(BaseModel):
    model_type: list
    parameter: str
    fixed_params: dict
    steps: int

@app.post("/option_sensitivity/")
async def get_option_sensitivity(data: SensitivityOptionInput):

    results = option_sensitivity(
        model_type=data.model_type,
        parameter=data.parameter,
        fixed_params=data.fixed_params,
        steps=data.steps
    )
    
    # Convert Numpy arrays into lists for JSON serialization
    results['values'] = results['values'].tolist()
    for model in results['call']:
        results['call'][model] = [float(val) for val in results['call'][model]]
    for model in results['put']:
        results['put'][model] = [float(val) for val in results['put'][model]]
    
    return results  

from plot import greeks_sensitivity

class GreeksSensitivityInput(BaseModel):
    greek: str
    parameter: str
    fixed_params: dict
    steps: int

@app.post("/greeks_sensitivity/")
async def get_greeks_sensitivity(data: GreeksSensitivityInput):

    results = greeks_sensitivity(
        greek=data.greek,
        parameter=data.parameter,
        fixed_params=data.fixed_params,
        steps=data.steps
    )

    # Convert Numpy arrays into lists for JSON serialization
    results['values'] = results['values'].tolist()
    results['call'] = [float(val) for val in results['call']]
    results['put'] = [float(val) for val in results['put']]

    return results



