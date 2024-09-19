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
        option_type: str = 'call',
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
        # Calcul des variables d1 et d2
        self.d1 = (
            log(self.current_price / self.strike) +
            (self.interest_rate + 0.5 * self.volatility ** 2) * self.time_to_maturity
        ) / (self.volatility * sqrt(self.time_to_maturity))
        
        self.d2 = self.d1 - self.volatility * sqrt(self.time_to_maturity)

        # Calcul des prix d'options
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


        
class Binomial:
    def __init__(
        self,
        time_to_maturity: float,
        strike: float,
        current_price: float,
        volatility: float,
        interest_rate: float,
        steps: int,
        option_type: str = 'call',  # 'call' ou 'put'
        is_american: bool = False  # True pour option américaine, False pour européenne
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

        # Initialiser l'arbre pour les prix de l'option
        option_prices = [0.0 for _ in range(self.steps + 1)]

        # Calculer les prix à la maturité
        for i in range(self.steps + 1):
            stock_price_at_maturity = self.current_price * (u ** (self.steps - i)) * (d ** i)
            if self.option_type == 'call':
                option_prices[i] = max(0, stock_price_at_maturity - self.strike)
            elif self.option_type == 'put':
                option_prices[i] = max(0, self.strike - stock_price_at_maturity)

        # Remonter l'arbre pour calculer les prix de l'option
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
        option_type: str = 'call'  # 'call' ou 'put'
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

        # Générer des chemins simulés pour les prix de l'actif sous-jacent
        prices = np.zeros((self.num_simulations, self.num_steps + 1))
        prices[:, 0] = self.current_price

        for t in range(1, self.num_steps + 1):
            Z = np.random.standard_normal(self.num_simulations)
            prices[:, t] = prices[:, t - 1] * np.exp(
                (self.interest_rate - 0.5 * self.volatility ** 2) * dt
                + self.volatility * np.sqrt(dt) * Z
            )

        # Calcul des valeurs finales des options
        if self.option_type == 'call':
            option_values = np.maximum(prices[:, -1] - self.strike, 0)
        elif self.option_type == 'put':
            option_values = np.maximum(self.strike - prices[:, -1], 0)

        # Calcul du prix de l'option
        self.option_price = discount_factor * np.mean(option_values)

    def get_option_price(self):
        return self.option_price


if __name__ == "__main__":
    # Exemple d'utilisation du modèle Black Scholes
    time_to_maturity = 2  # Temps jusqu'à maturité en années
    strike = 130  # Prix d'exercice
    current_price = 200  # Prix actuel de l'actif sous-jacent
    volatility = 0.30  # Volatilité
    interest_rate = 0.05  # Taux d'intérêt sans risque

    # Exemple d'utilisation du modèle Binomiale
    steps = 100  # Nombre de pas dans l'arbre binomial
    option_type = 'call'  # 'call' ou 'put'
    is_american = False  # True pour option américaine, False pour européenne

    # Initialisation de la classe BlackScholes
    BS = BlackScholes(
        time_to_maturity=time_to_maturity,
        strike=strike,
        current_price=current_price,
        volatility=volatility,
        interest_rate=interest_rate,
        option_type = option_type
    )
    BS.calculate()

    # Affichage des résultats
    print(f"BS {option_type} Price: {BS.get_option_price()}")


    # Initialisation de la classe Binomial
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

    # Affichage des résultats
    print(f"B {option_type} Price: {B.get_option_price()}")

    # Exemple d'utilisation du modèle Monte-Carlo
    num_simulations = 10000  # Nombre de simulations
    num_steps = 100  # Nombre de pas de temps
    option_type = 'call'  # 'call' ou 'put'

    # Initialisation de la classe MonteCarlo
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

    # Affichage des résultats
    print(f"MC {option_type} Price: {MC.get_option_price()}")

    # NeuralNetwork Model (MLP)
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
    # Affichage des résultats
    print(f"Neural Network {option_type} Price: {MLP.get_option_price()}")
