import numpy as np
from numpy import exp, sqrt, log 
from scipy.stats import norm
from model import BlackScholes

class Greeks:
    def __init__(
        self, 
        black_scholes, 
        option_type: str = 'call'  # 'call' ou 'put'
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
        
        # Conversion en base journalière
        return theta / 365

    def vega(self):
        # Représente un changement de 1% dans la volatilité
        return (self.current_price * norm.pdf(self.d1) * sqrt(self.time_to_maturity)) / 100

    def rho(self):
        if self.option_type == 'call':
            rho = self.strike * self.time_to_maturity * exp(-self.interest_rate * self.time_to_maturity) * norm.cdf(self.d2)
        elif self.option_type == 'put':
            rho = -self.strike * self.time_to_maturity * exp(-self.interest_rate * self.time_to_maturity) * norm.cdf(-self.d2)
        
        # Représente un changement de 1%  dans le taux d'intérêt
        return rho / 100

if __name__ == "__main__":
    time_to_maturity = 2
    strike = 120
    current_price = 110
    volatility = 0.25
    interest_rate = 0.03
    option_type = 'call'  # 'call' ou 'put'

    # Initialisation de la classe BlackScholes
    bs = BlackScholes(time_to_maturity, strike, current_price, volatility, interest_rate)
    bs.calculate()

    # Initialisation de la classe Greeks avec l'instance de BlackScholes et l'option_type
    greeks = Greeks(bs, option_type)

    # Calcul des Greeks
    print(f"Delta ({option_type}): {greeks.delta()}")
    print(f"Gamma: {greeks.gamma()}")
    print(f"Theta ({option_type}): {greeks.theta()}")
    print(f"Vega: {greeks.vega()}")
    print(f"Rho ({option_type}): {greeks.rho()}")
