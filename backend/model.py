"""
model.py

This file contains implementations of various models for financial options pricing.
The models include:

1. Black-Scholes: An analytical model for European options.
2. Binomial: A model based on a tree-structure approach that allows pricing of both European and American options.
3. Monte Carlo: A stochastic model using simulations to calculate option prices.

Each class defines methods required to calculate the price of a given option, as well as other useful metrics.
The models consider parameters such as time to maturity, strike price, current price of the underlying asset, volatility, interest rate, and option type (call or put).

Classes:
----------
- BlackScholes: Implements the analytical Black-Scholes model for European options.
- Binomial: Implements a binomial model supporting both American and European options.
- MonteCarlo: Implements a Monte Carlo simulation model for option pricing.

Author:
---------
- Yanis AKS
- Project: Options Pricing Application
- Date: October 2024
"""
import numpy as np
from numpy import exp, sqrt, log 
from scipy.stats import norm 
from mlp_model import NeuralNetwork

class BlackScholes:
    def __init__(
        self,
        time_to_maturity: float,
        strike: float,
        current_price: float,
        volatility: float,
        interest_rate: float,
        option_type: str = 'call', # 'call' or 'put'
    ):
        self.time_to_maturity = time_to_maturity
        self.strike = strike
        self.current_price = current_price
        self.volatility = volatility
        self.interest_rate = interest_rate
        self.d1 = None
        self.d2 = None
        self.call_price = None
        self.put_price = None
        self.option_type = option_type

    def calculate(self):
        # Secondary Variables d1 and d2
        self.d1 = (
            log(self.current_price / self.strike) +
            (self.interest_rate + 0.5 * self.volatility ** 2) * self.time_to_maturity
        ) / (self.volatility * sqrt(self.time_to_maturity))
        
        self.d2 = self.d1 - self.volatility * sqrt(self.time_to_maturity)

        # Options Price
        self.call_price = self.current_price * norm.cdf(self.d1) - (
            self.strike * exp(-self.interest_rate * self.time_to_maturity) * norm.cdf(self.d2)
        )
        self.put_price = (
            self.strike * exp(-self.interest_rate * self.time_to_maturity) * norm.cdf(-self.d2)
        ) - self.current_price * norm.cdf(-self.d1)

    def get_option_price(self):
        if self.option_type == 'call':
            return self.call_price
        elif self.option_type == 'put':
            return self.put_price
        
    def get_d1(self):
        return self.d1

    def get_d2(self):
        return self.d2


        
class Binomial:
    def __init__(
        self,
        time_to_maturity: float,
        strike: float,
        current_price: float,
        volatility: float,
        interest_rate: float,
        steps: int,
        option_type: str = 'call',  # 'call' or 'put'
        is_american: bool = False  # True for american option, False for european
    ):
        self.time_to_maturity = time_to_maturity
        self.strike = strike
        self.current_price = current_price
        self.volatility = volatility
        self.interest_rate = interest_rate
        self.steps = steps
        self.option_type = option_type
        self.is_american = is_american
        self.option_price = None

    def calculate(self):
        dt = self.time_to_maturity / self.steps
        u = exp(self.volatility * sqrt(dt))
        d = 1 / u
        p = (exp(self.interest_rate * dt) - d) / (u - d)
        discount_factor = exp(-self.interest_rate * dt)

        # Initialize tree for option prices
        option_prices = [0.0 for _ in range(self.steps + 1)]

        # Calculate prices at maturity
        for i in range(self.steps + 1):
            stock_price_at_maturity = self.current_price * (u ** (self.steps - i)) * (d ** i)
            if self.option_type == 'call':
                option_prices[i] = max(0, stock_price_at_maturity - self.strike)
            elif self.option_type == 'put':
                option_prices[i] = max(0, self.strike - stock_price_at_maturity)

        #  Up the tree to calculate option prices
        for j in range(self.steps - 1, -1, -1):
            for i in range(j + 1):
                option_prices[i] = discount_factor * (p * option_prices[i] + (1 - p) * option_prices[i + 1])
                if self.is_american:
                    stock_price = self.current_price * (u ** (j - i)) * (d ** i)
                    if self.option_type == 'call':
                        option_prices[i] = max(option_prices[i], stock_price - self.strike)
                    elif self.option_type == 'put':
                        option_prices[i] = max(option_prices[i], self.strike - stock_price)

        self.option_price = option_prices[0]

    def get_option_price(self):
        return self.option_price

class MonteCarlo:
    def __init__(
        self,
        time_to_maturity: float,
        strike: float,
        current_price: float,
        volatility: float,
        interest_rate: float,
        num_simulations: int,
        num_steps: int,
        option_type: str = 'call'  # 'call' or 'put'
    ):
        self.time_to_maturity = time_to_maturity
        self.strike = strike
        self.current_price = current_price
        self.volatility = volatility
        self.interest_rate = interest_rate
        self.num_simulations = num_simulations
        self.num_steps = num_steps
        self.option_type = option_type
        self.option_price = None

    def calculate(self):
        dt = self.time_to_maturity / self.num_steps
        discount_factor = np.exp(-self.interest_rate * self.time_to_maturity)

        # Generate simulated paths for underlying asset prices
        prices = np.zeros((self.num_simulations, self.num_steps + 1))
        prices[:, 0] = self.current_price

        for t in range(1, self.num_steps + 1):
            Z = np.random.standard_normal(self.num_simulations)
            prices[:, t] = prices[:, t - 1] * np.exp(
                (self.interest_rate - 0.5 * self.volatility ** 2) * dt
                + self.volatility * np.sqrt(dt) * Z
            )

        # Calculation of final option values
        if self.option_type == 'call':
            option_values = np.maximum(prices[:, -1] - self.strike, 0)
        elif self.option_type == 'put':
            option_values = np.maximum(self.strike - prices[:, -1], 0)

        # Calculating the option price
        self.option_price = discount_factor * np.mean(option_values)

    def get_option_price(self):
        return self.option_price


if __name__ == "__main__":
    time_to_maturity = 1  # Time to maturity in years
    strike = 100  
    current_price = 100  
    volatility = 0.2  
    interest_rate = 0.05  

    # For Binomial Model
    steps = 100  # Number of steps in the binomial tree
    option_type = 'call'  
    is_american = False  

    #  Initializing the BlackScholes class
    BS = BlackScholes(
        time_to_maturity=time_to_maturity,
        strike=strike,
        current_price=current_price,
        volatility=volatility,
        interest_rate=interest_rate,
        option_type = option_type
    )
    BS.calculate()

    # Results display
    print(f"BS {option_type} Price: {BS.get_option_price()}")


    # Initialization of the Binomial class
    B = Binomial(
        time_to_maturity=time_to_maturity,
        strike=strike,
        current_price=current_price,
        volatility=volatility,
        interest_rate=interest_rate,
        steps=steps,
        option_type=option_type,
        is_american=is_american
    )
    B.calculate()

    # Results display
    print(f"B {option_type} Price: {B.get_option_price()}")

    # For Monte Carlo Model
    num_simulations = 10000  # Number of simulations
    num_steps = 100  # Number of time steps

    # Initialization of the MonteCarlo class
    MC = MonteCarlo(
        time_to_maturity=time_to_maturity,
        strike=strike,
        current_price=current_price,
        volatility=volatility,
        interest_rate=interest_rate,
        num_simulations=num_simulations,
        num_steps=num_steps,
        option_type=option_type
    )
    MC.calculate()

    # Results display
    print(f"MC {option_type} Price: {MC.get_option_price()}")

    # Initialization of the NeuralNetwork Class (MLP)
    MLP = NeuralNetwork(
        time_to_maturity=time_to_maturity,
        strike=strike,
        current_price=current_price,
        volatility=volatility,
        interest_rate=interest_rate,
        option_type=option_type
    )
    #MLP.train()
    MLP.load()  # Load the trained model

    # Results display
    print(f"Neural Network {option_type} Price: {MLP.get_option_price()}")
