from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model import BlackScholes, Binomial, MonteCarlo
from mlp_model import NeuralNetwork
from greeks import Greeks

app = FastAPI()

# Configuration du middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://options-pricing-alcn8opp1-yaaks7s-projects.vercel.app/"],  # Autorise seulement les requêtes venant de ton frontend
    allow_credentials=True,
    allow_methods=["*"],  # Autorise toutes les méthodes (GET, POST, etc.)
    allow_headers=["*"],  # Autorise tous les headers (Content-Type, Authorization, etc.)
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
    # Calcul des Greeks pour l'option Call
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

    # Calcul des Greeks pour l'option Put
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

    # Retourner les deux ensembles de résultats pour Call et Put
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
    # Calcul des résultats
    results = option_sensitivity(
        model_type=data.model_type,
        parameter=data.parameter,
        fixed_params=data.fixed_params,
        steps=data.steps
    )
    
    # Convertir les arrays Numpy en listes pour sérialisation JSON
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
    # Calcul des résultats de la sensibilité des greeks
    results = greeks_sensitivity(
        greek=data.greek,
        parameter=data.parameter,
        fixed_params=data.fixed_params,
        steps=data.steps
    )

    # Convertir les arrays Numpy en listes pour sérialisation JSON
    results['values'] = results['values'].tolist()
    results['call'] = [float(val) for val in results['call']]
    results['put'] = [float(val) for val in results['put']]

    return results



