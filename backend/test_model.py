"""
test_model.py

This script contains unit tests for all option pricing models used in the application. It tests the following models:
- Black-Scholes
- Binomial
- Monte Carlo
- Neural Network

The purpose of these tests is to verify the accuracy and functionality of each model by comparing the calculated option prices
with expected theoretical values. Additionally, it includes tests for calculating option Greeks.

The script uses pytest for testing and ensures that each model behaves correctly under different scenarios.

Author:
---------
- Yanis AKS
- Project: Options Pricing Application
- Date: October 2024
"""
import pytest
from model import BlackScholes, Binomial, MonteCarlo
from mlp_model import NeuralNetwork  
from sklearn.metrics import mean_squared_error,mean_absolute_error, r2_score
from greeks import Greeks
import pandas as pd

#%%
# Theoric Value of options (Black-Scholes) on : https://blackschole.streamlit.app/#black-scholes-pricing-model
# Theoric Value of greeks (Black-Scholes) on : https://vindeep.com/Derivatives/OptionPriceCalc.aspx
#%%
def test_black_scholes():
    # Test parameters for the Black-Scholes model
    test_cases = [
        # (time_to_maturity, strike, current_price, volatility, interest_rate, expected_call_price, expected_put_price)
        (1, 100, 100, 0.2, 0.05, 10.45, 5.57),
        (2, 120, 110, 0.25, 0.03, 14.19, 17.20),
        (0.5, 90, 100, 0.3, 0.04, 15.18, 3.40),
        (3, 150, 130, 0.35, 0.02, 26.97, 38.23),
        (4, 100, 130, 0.25, 0.05, 52.98, 4.86)
    ]
    
    for case in test_cases:
        time_to_maturity, strike, current_price, volatility, interest_rate, expected_call, expected_put = case
        model1 = BlackScholes(time_to_maturity, strike, current_price, volatility, interest_rate, option_type="call")
        model1.calculate()
        # For Call
        assert pytest.approx(model1.get_option_price(), 0.01) == expected_call

        model2 = BlackScholes(time_to_maturity, strike, current_price, volatility, interest_rate, option_type="put")
        model2.calculate()
        # For Put
        assert pytest.approx(model2.get_option_price(), 0.01) == expected_put


def test_binomial():
    # Test parameters for the Binomial model
    test_cases = [
        # (time_to_maturity, strike, current_price, volatility, interest_rate, steps, option_type, is_american, expected_price)
        (1, 100, 100, 0.2, 0.05, 100, 'call', True, 10.45),
        (2, 120, 110, 0.25, 0.03, 200, 'put', False, 17.20),
        (0.5, 90, 100, 0.3, 0.04, 50, 'call', True, 15.18),
        (3, 150, 130, 0.35, 0.02, 150, 'put', False, 38.23),
        (4, 100, 130, 0.25, 0.05, 300, 'call', False, 52.98)
    ]
    
    for case in test_cases:
        time_to_maturity, strike, current_price, volatility, interest_rate, steps, option_type, is_american, expected_price = case
        model = Binomial(time_to_maturity, strike, current_price, volatility, interest_rate, steps, option_type, is_american)
        model.calculate()
        assert pytest.approx(model.get_option_price(), 0.01) == expected_price

def test_monte_carlo():
    # Test parameters for the Monte Carlo model
    test_cases = [
        # (time_to_maturity, strike, current_price, volatility, interest_rate, num_simulations, num_steps, option_type, expected_price)
        (1, 100, 100, 0.2, 0.05, 10000, 100, 'call', 10.45),
        (2, 120, 110, 0.25, 0.03, 10000, 200, 'put', 17.20),
        (0.5, 90, 100, 0.3, 0.04, 10000, 50, 'call', 15.18),
        (3, 150, 130, 0.35, 0.02, 10000, 150, 'put', 38.23),
        (4, 100, 130, 0.25, 0.05, 10000, 300, 'call', 52.98)
    ]
    
    for case in test_cases:
        time_to_maturity, strike, current_price, volatility, interest_rate, num_simulations, num_steps, option_type, expected_price = case
        model = MonteCarlo(time_to_maturity, strike, current_price, volatility, interest_rate, num_simulations, num_steps, option_type)
        model.calculate()
        assert pytest.approx(model.get_option_price(), 0.1) == expected_price

def test_neural_network():
    # Test parameters for the Neural Network
    test_cases = [
        # (time_to_maturity, strike, current_price, volatility, interest_rate, option_type, expected_price)
        (1, 100, 100, 0.2, 0.05, 'call', 10.45),
        (2, 120, 110, 0.25, 0.03, 'call', 14.19),
        (0.5, 90, 100, 0.3, 0.04, 'call', 15.18),
        (3, 150, 130, 0.35, 0.02, 'put', 38.23),
        (4, 100, 130, 0.25, 0.05, 'put', 4.86),

    ]

    for case in test_cases:
        time_to_maturity, strike, current_price, volatility, interest_rate, option_type, expected_price = case

        # Load pre-trained model
        model = NeuralNetwork(time_to_maturity, strike, current_price, volatility, interest_rate, option_type)
        model.load()  # Load saved model and scaler

        # Create input data in DataFrame format to match the format used during training
        input_data = pd.DataFrame({
            'time_to_maturity': [time_to_maturity],
            'strike': [strike],
            'current_price': [current_price],
            'volatility': [volatility],
            'interest_rate': [interest_rate],
            'option_type': [1 if option_type == 'call' else 0] 
        })

        # Calculate price with pre-trained model
        predicted_price = model.calculate_with_dataframe(input_data)

        # Test accuracy with a tolerance of $0.5
        assert pytest.approx(predicted_price, 0.5) == expected_price


        
def test_greeks():
    # Test parameters for Greeks
    test_cases = [
    # (time_to_maturity, strike, current_price, volatility, interest_rate, option_type, expected_delta, expected_gamma, expected_vega, expected_theta, expected_rho)
    (2, 120, 110, 0.25, 0.03, 'call', 0.54, 0.010206444978343634, 0.617, -0.0142895, 0.904),  
    (1, 90, 110, 0.30, 0.04, 'call', 0.83, 0.0076824, 0.279, -0.01850016, 0.642),  
    (2, 130, 160, 0.20, 0.02, 'call', 0.85, 0.00525618, 0.538, -0.0126330, 1.92),  
    (1, 130, 100, 0.25, 0.05, 'put', -0.77, 0.012274, 0.307, 0.00363712, -1.033), 
    (2, 80, 120, 0.35, 0.05, 'put', -0.1022774, 0.003003558, 0.303, -0.005080827, -0.318)   
    ]
    
    for case in test_cases:
        time_to_maturity, strike, current_price, volatility, interest_rate, option_type, expected_delta, expected_gamma, expected_vega, expected_theta, expected_rho = case
        bs = BlackScholes(time_to_maturity, strike, current_price, volatility, interest_rate)
        bs.calculate()
        greeks = Greeks(bs, option_type)
        
        assert pytest.approx(greeks.delta(), 0.01) == expected_delta
        assert pytest.approx(greeks.gamma(), 0.001) == expected_gamma
        assert pytest.approx(greeks.vega(), 0.001) == expected_vega
        assert pytest.approx(greeks.theta(), 0.001) == expected_theta
        assert pytest.approx(greeks.rho(), 0.01) == expected_rho

if __name__ == "__main__":
    pytest.main()
