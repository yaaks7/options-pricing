import numpy as np
from model import BlackScholes  # Assuming your BlackScholes class is in the model.py file

def pnl_heatmap(purchase_price, min_volatility, max_volatility, min_spot_price, max_spot_price, strike, time_to_maturity, interest_rate):
    # Define the range of volatilities and spot prices
    volatilities = np.linspace(min_volatility, max_volatility, 10)  # X-axis
    spot_prices = np.linspace(min_spot_price, max_spot_price, 10)   # Y-axis

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
                option_type='call'  # For call option
            )
            black_scholes_call.calculate()

            black_scholes_put = BlackScholes(
                time_to_maturity=time_to_maturity,
                strike=strike,
                current_price=spot,
                volatility=volatility,
                interest_rate=interest_rate,
                option_type='put'  # For put option
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
