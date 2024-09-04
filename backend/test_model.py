import pytest
from model import BlackScholes, Binomial, MonteCarlo
from greeks import Greeks

#%%
# Valeur théorique des options (Black-Scholes) sur : https://blackschole.streamlit.app/#black-scholes-pricing-model
#%%
def test_black_scholes():
    # Paramètres de test pour le modèle Black-Scholes
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
        model = BlackScholes(time_to_maturity, strike, current_price, volatility, interest_rate)
        model.calculate()
        assert pytest.approx(model.get_call_price(), 0.01) == expected_call
        assert pytest.approx(model.get_put_price(), 0.01) == expected_put

def test_binomial():
    # Paramètres de test pour le modèle Binomial
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
    # Paramètres de test pour le modèle Monte Carlo
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
        assert pytest.approx(model.get_option_price(), 0.5) == expected_price
        
def test_greeks():
    # Paramètres de test pour les Greeks
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
