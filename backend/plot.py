"""
plot.py

This module contains functions to visualize option-related data including:
1. Generating P&L heatmaps for call and put options based on volatility and spot price variations.
2. Analyzing option sensitivity for different models (e.g., Black-Scholes, Binomial, Monte Carlo, Neural Network).
3. Computing Greek sensitivities (delta, gamma, theta, vega, rho) for options using the Black-Scholes model.

Each function aims to aid in understanding the behavior of options under various market conditions and input parameters.

Functions:
---------
- pnl_heatmap: Creates a heatmap of profit and loss (P&L) values based on different volatilities and spot prices.
- option_sensitivity: Analyzes how option prices change when key parameters (e.g., strike, volatility) are varied.
- greeks_sensitivity: Evaluates the sensitivity of option Greeks based on varying parameters, such as strike or volatility.

Author:
---------
- Yanis AKS
- Project: Options Pricing Application
- Date: October 2024
"""
import numpy as np
from model import BlackScholes, Binomial, MonteCarlo
from mlp_model import NeuralNetwork, predict_batch
from greeks import Greeks

def pnl_heatmap(purchase_price, min_volatility, max_volatility, min_spot_price, max_spot_price, strike, time_to_maturity, interest_rate):
    """
    Calculates the P&L (Profit and Loss) heatmap for call and put options using the Black-Scholes model.

    :param purchase_price: The purchase price of the option.
    :param min_volatility: The minimum volatility value for the range.
    :param max_volatility: The maximum volatility value for the range.
    :param min_spot_price: The minimum spot price value for the range.
    :param max_spot_price: The maximum spot price value for the range.
    :param strike: The strike price of the option.
    :param time_to_maturity: The time to maturity of the option, in years.
    :param interest_rate: The risk-free interest rate.

    :return: A tuple containing two matrices (P&L for call and put options), the range of volatilities, and the range of spot prices.
    """

    # Define the range of volatilities and spot prices
    volatilities = np.linspace(min_volatility, max_volatility, 10)  
    spot_prices = np.linspace(min_spot_price, max_spot_price, 10)  

    # Initialize P&L matrices for call and put options
    pnl_matrix_call = []
    pnl_matrix_put = []

    for spot in spot_prices:
        pnl_row_call = []
        pnl_row_put = []
        for volatility in volatilities:
            # Use Black-Scholes to calculate the option price for both call and put
            black_scholes_call = BlackScholes(
                time_to_maturity=time_to_maturity,
                strike=strike,
                current_price=spot,
                volatility=volatility,
                interest_rate=interest_rate,
                option_type='call' 
            )
            black_scholes_call.calculate()

            black_scholes_put = BlackScholes(
                time_to_maturity=time_to_maturity,
                strike=strike,
                current_price=spot,
                volatility=volatility,
                interest_rate=interest_rate,
                option_type='put'  
            )
            black_scholes_put.calculate()

            # Calculate P&L for call and put options
            pnl_call = black_scholes_call.get_option_price() - purchase_price
            pnl_put = black_scholes_put.get_option_price() - purchase_price

            pnl_row_call.append(pnl_call)
            pnl_row_put.append(pnl_put)

        pnl_matrix_call.append(pnl_row_call)
        pnl_matrix_put.append(pnl_row_put)

    return np.array(pnl_matrix_call), np.array(pnl_matrix_put), volatilities, spot_prices


def option_sensitivity(model_type, parameter, fixed_params, steps=10):
    """
    Calculates the sensitivity of options for call and put types across multiple models and varying parameters.

    :param model_type: Selected models (e.g., ['BlackScholes', 'Binomial', 'MonteCarlo', 'NeuralNetwork']).
    :param parameter: The parameter to vary (e.g., 'strike', 'time_to_maturity', 'volatility', etc.).
    :param fixed_params: Dictionary containing fixed parameters for the option calculation.
    :param steps: Number of steps to vary the parameter.
    :return: Dictionary of option prices for each model and option type (call and put).
    """

    # Extract fixed parameters
    time_to_maturity = fixed_params.get('time_to_maturity', 1)
    strike = fixed_params.get('strike', 100)
    current_price = fixed_params.get('current_price', 100)
    volatility = fixed_params.get('volatility', 0.2)
    interest_rate = fixed_params.get('interest_rate', 0.05)
    binomial_steps = fixed_params.get('steps', 100)  # Binomial-specific parameter
    monte_carlo_num_simulations = fixed_params.get('num_simulations', 10000)  # Monte Carlo-specific parameter
    monte_carlo_num_steps = fixed_params.get('num_steps', 100)

    # Define the range of values for the selected parameter
    if parameter == 'strike':
        values = np.linspace(fixed_params['min_strike'], fixed_params['max_strike'], steps)
    elif parameter == 'time_to_maturity':
        values = np.linspace(fixed_params['min_time_to_maturity'], fixed_params['max_time_to_maturity'], steps)
    elif parameter == 'volatility':
        values = np.linspace(fixed_params['min_volatility'], fixed_params['max_volatility'], steps)
    elif parameter == 'current_price':
        values = np.linspace(fixed_params['min_current_price'], fixed_params['max_current_price'], steps)
    else:
        raise ValueError("Paramètre non valide")

    sensitivity_results = {
        'call': {model: [] for model in model_type},
        'put': {model: [] for model in model_type},
        'values': values
    }

    # NeuralNetwork predictions are computed once, up front, as a single
    # batched call over every grid step (call and put rows together) instead
    # of reloading the model from disk and predicting one row at a time
    # inside the loop below - that per-step reload is what used to make this
    # sweep take 1-2 minutes; batching brings it under a second.
    nn_call_prices = nn_put_prices = None
    if 'NeuralNetwork' in model_type:
        call_rows = []
        put_rows = []
        for value in values:
            base_row = [
                time_to_maturity if parameter != 'time_to_maturity' else value,
                strike if parameter != 'strike' else value,
                current_price if parameter != 'current_price' else value,
                volatility if parameter != 'volatility' else value,
                interest_rate,
            ]
            call_rows.append(base_row + [1])  # option_type=1 -> call
            put_rows.append(base_row + [0])    # option_type=0 -> put
        nn_call_prices = predict_batch(call_rows)
        nn_put_prices = predict_batch(put_rows)

    # Loop to vary the selected parameter
    for i, value in enumerate(values):
        # Modify the value of the selected parameter in each model
        for model in model_type:
            if model == 'BlackScholes':
                BS_call = BlackScholes(
                    time_to_maturity if parameter != 'time_to_maturity' else value,
                    strike if parameter != 'strike' else value,
                    current_price if parameter != 'current_price' else value,
                    volatility if parameter != 'volatility' else value,
                    interest_rate, 'call'
                )
                BS_put = BlackScholes(
                    time_to_maturity if parameter != 'time_to_maturity' else value,
                    strike if parameter != 'strike' else value,
                    current_price if parameter != 'current_price' else value,
                    volatility if parameter != 'volatility' else value,
                    interest_rate, 'put'
                )
                BS_call.calculate()
                BS_put.calculate()
                sensitivity_results['call'][model].append(BS_call.get_option_price())
                sensitivity_results['put'][model].append(BS_put.get_option_price())

            elif model == 'Binomial':
                binom_call = Binomial(
                    time_to_maturity if parameter != 'time_to_maturity' else value,
                    strike if parameter != 'strike' else value,
                    current_price if parameter != 'current_price' else value,
                    volatility if parameter != 'volatility' else value,
                    interest_rate, binomial_steps, 'call'
                )
                binom_put = Binomial(
                    time_to_maturity if parameter != 'time_to_maturity' else value,
                    strike if parameter != 'strike' else value,
                    current_price if parameter != 'current_price' else value,
                    volatility if parameter != 'volatility' else value,
                    interest_rate, binomial_steps, 'put'
                )
                binom_call.calculate()
                binom_put.calculate()
                sensitivity_results['call'][model].append(binom_call.get_option_price())
                sensitivity_results['put'][model].append(binom_put.get_option_price())

            elif model == 'MonteCarlo':
                mc_call = MonteCarlo(
                    time_to_maturity if parameter != 'time_to_maturity' else value,
                    strike if parameter != 'strike' else value,
                    current_price if parameter != 'current_price' else value,
                    volatility if parameter != 'volatility' else value,
                    interest_rate, monte_carlo_num_simulations, monte_carlo_num_steps, 'call'
                )
                mc_put = MonteCarlo(
                    time_to_maturity if parameter != 'time_to_maturity' else value,
                    strike if parameter != 'strike' else value,
                    current_price if parameter != 'current_price' else value,
                    volatility if parameter != 'volatility' else value,
                    interest_rate, monte_carlo_num_simulations, monte_carlo_num_steps, 'put'
                )
                mc_call.calculate()
                mc_put.calculate()
                sensitivity_results['call'][model].append(mc_call.get_option_price())
                sensitivity_results['put'][model].append(mc_put.get_option_price())

            elif model == 'NeuralNetwork':
                sensitivity_results['call'][model].append(float(nn_call_prices[i]))
                sensitivity_results['put'][model].append(float(nn_put_prices[i]))

    return sensitivity_results


def greeks_sensitivity(greek, parameter, fixed_params, steps=10):
    """
    Calculates the sensitivity of Greeks (delta, gamma, theta, vega, rho) for Call and Put options.

    :param greek: The Greek to calculate (e.g., 'delta', 'gamma', 'theta', 'vega', 'rho').
    :param parameter: The parameter to vary (e.g., 'strike', 'time_to_maturity', 'volatility', etc.).
    :param fixed_params: Dictionary containing fixed parameters for the calculation of Greeks.
    :param steps: Number of steps to vary the parameter.
    :return: Dictionary of Greek values for call and put option types.
    """
    
    # Extract fixed parameters
    time_to_maturity = fixed_params.get('time_to_maturity', 1)
    strike = fixed_params.get('strike', 100)
    current_price = fixed_params.get('current_price', 100)
    volatility = fixed_params.get('volatility', 0.2)
    interest_rate = fixed_params.get('interest_rate', 0.05)

    # Define the range of values for the selected parameter
    if parameter == 'strike':
        values = np.linspace(fixed_params['min_strike'], fixed_params['max_strike'], steps)
    elif parameter == 'time_to_maturity':
        values = np.linspace(fixed_params['min_time_to_maturity'], fixed_params['max_time_to_maturity'], steps)
    elif parameter == 'volatility':
        values = np.linspace(fixed_params['min_volatility'], fixed_params['max_volatility'], steps)
    elif parameter == 'current_price':
        values = np.linspace(fixed_params['min_current_price'], fixed_params['max_current_price'], steps)
    else:
        raise ValueError("Paramètre non valide")

    sensitivity_results = {
        'call': [],
        'put': [],
        'values': values
    }

    # Loop to vary the selected parameter
    for value in values:
        # Calculation of greeks for Call and Put options
        bs_call = BlackScholes(
            time_to_maturity if parameter != 'time_to_maturity' else value,
            strike if parameter != 'strike' else value,
            current_price if parameter != 'current_price' else value,
            volatility if parameter != 'volatility' else value,
            interest_rate, 'call'
        )
        bs_put = BlackScholes(
            time_to_maturity if parameter != 'time_to_maturity' else value,
            strike if parameter != 'strike' else value,
            current_price if parameter != 'current_price' else value,
            volatility if parameter != 'volatility' else value,
            interest_rate, 'put'
        )
        bs_call.calculate()
        bs_put.calculate()

        greeks_call = Greeks(bs_call, 'call')
        greeks_put = Greeks(bs_put, 'put')

        # Select the requested Greek
        sensitivity_results['call'].append(getattr(greeks_call, greek)())
        sensitivity_results['put'].append(getattr(greeks_put, greek)())

    return sensitivity_results




if __name__ == "__main__":

    fixed_params = {
        "time_to_maturity": 1,  
        "strike": 100,          
        "current_price": 100,   
        "volatility": 0.2,      
        "interest_rate": 0.05,  
        "min_strike": 80,       # for sensitivity
        "max_strike": 120,      # for sensitivity
        "min_time_to_maturity": 0.5,
        "max_time_to_maturity": 2,
        "min_volatility": 0.1,
        "max_volatility": 0.5,
        "min_current_price": 90,
        "max_current_price": 110,
        "steps": 100,           # For Binomial
        "num_simulations": 10000,  # For Monte Carlo
        "num_steps": 100        # For Monte Carlo
    }

    # Test for strike-dependent sensitivity for BlackScholes and Binomial
    result = option_sensitivity(
        model_type=['BlackScholes', 'Binomial'],  # Models to test
        parameter='volatility',  # Parameter to be varied
        fixed_params=fixed_params,  # Fixed parameters
        steps=10  # Number of steps to vary strike
    )
    
    #result = greeks_sensitivity('delta', 'strike', fixed_params)


    # Affichage des résultats pour vérifier
    print(result)

