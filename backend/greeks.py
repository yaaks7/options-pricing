"""
greeks.py

This module provides the `Greeks` class, which is used to calculate the sensitivity measures (known as the "Greeks")
for financial options. The Greeks are derived using the Black-Scholes model and are essential for assessing how different
factors affect the price of an option. This file defines the following Greeks: Delta, Gamma, Theta, Vega, and Rho.

The `Greeks` class depends on an instance of the `BlackScholes` class to provide the necessary input parameters.
Each method within the `Greeks` class calculates a specific sensitivity measure, aiding in risk management and option pricing strategies.

Author:
---------
- Yanis AKS
- Project: Options Pricing Application
- Date: October 2024
"""
import numpy as np
from numpy import exp, sqrt, log 
from scipy.stats import norm
from model import BlackScholes

class Greeks:
    def __init__(
        self, 
        black_scholes, 
        option_type: str = 'call'  # 'call' or 'put'
        ):

        self.black_scholes = black_scholes
        self.d1 = black_scholes.get_d1()
        self.d2 = black_scholes.get_d2()
        self.current_price = black_scholes.current_price
        self.strike = black_scholes.strike
        self.time_to_maturity = black_scholes.time_to_maturity
        self.volatility = black_scholes.volatility
        self.interest_rate = black_scholes.interest_rate
        self.option_type = option_type
        
    def delta(self):
        if self.option_type == 'call':
            return norm.cdf(self.d1)
        elif self.option_type == 'put':
            return norm.cdf(self.d1) - 1

    def gamma(self):
        return norm.pdf(self.d1) / (self.current_price * self.volatility * sqrt(self.time_to_maturity))

    def theta(self):
        if self.option_type == 'call':
            theta = (- (self.current_price * norm.pdf(self.d1) * self.volatility) / (2 * sqrt(self.time_to_maturity))
                     - self.interest_rate * self.strike * exp(-self.interest_rate * self.time_to_maturity) * norm.cdf(self.d2))
        elif self.option_type == 'put':
            theta = (- (self.current_price * norm.pdf(self.d1) * self.volatility) / (2 * sqrt(self.time_to_maturity))
                     + self.interest_rate * self.strike * exp(-self.interest_rate * self.time_to_maturity) * norm.cdf(-self.d2))
        
        # Convert to day basis
        return theta / 365

    def vega(self):
        # 1% Volatility Change
        return (self.current_price * norm.pdf(self.d1) * sqrt(self.time_to_maturity)) / 100

    def rho(self):
        if self.option_type == 'call':
            rho = self.strike * self.time_to_maturity * exp(-self.interest_rate * self.time_to_maturity) * norm.cdf(self.d2)
        elif self.option_type == 'put':
            rho = -self.strike * self.time_to_maturity * exp(-self.interest_rate * self.time_to_maturity) * norm.cdf(-self.d2)
        
        # 1% interest rate change
        return rho / 100

if __name__ == "__main__":
    time_to_maturity = 2
    strike = 120
    current_price = 110
    volatility = 0.25
    interest_rate = 0.03
    option_type = 'call' 


    bs = BlackScholes(time_to_maturity, strike, current_price, volatility, interest_rate, option_type)
    bs.calculate()

    greeks = Greeks(bs, option_type)

    print(f"Delta ({option_type}): {greeks.delta()}")
    print(f"Gamma: {greeks.gamma()}")
    print(f"Theta ({option_type}): {greeks.theta()}")
    print(f"Vega: {greeks.vega()}")
    print(f"Rho ({option_type}): {greeks.rho()}")
