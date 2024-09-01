from numpy import exp, sqrt, log 
from scipy.stats import norm 

class BlackScholes:
    def __init__(
        self,
        time_to_maturity: float,
        strike: float,
        current_price: float,
        volatility: float,
        interest_rate: float,
    ):
        self.time_to_maturity = time_to_maturity
        self.strike = strike
        self.current_price = current_price
        self.volatility = volatility
        self.interest_rate = interest_rate

    def calculate(self):
        # Calcul des variables d1 et d2
        d1 = (
            log(self.current_price / self.strike) +
            (self.interest_rate + 0.5 * self.volatility ** 2) * self.time_to_maturity
        ) / (self.volatility * sqrt(self.time_to_maturity))
        
        d2 = d1 - self.volatility * sqrt(self.time_to_maturity)

        # Calcul des prix d'options
        self.call_price = self.current_price * norm.cdf(d1) - (
            self.strike * exp(-self.interest_rate * self.time_to_maturity) * norm.cdf(d2)
        )
        self.put_price = (
            self.strike * exp(-self.interest_rate * self.time_to_maturity) * norm.cdf(-d2)
        ) - self.current_price * norm.cdf(-d1)

    def get_call_price(self):
        return self.call_price

    def get_put_price(self):
        return self.put_price

class BinomialModel:
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



if __name__ == "__main__":
    # Exemple d'utilisation du modèle Black Scholes
    time_to_maturity = 2  # Temps jusqu'à maturité en années
    strike = 90  # Prix d'exercice
    current_price = 100  # Prix actuel de l'actif sous-jacent
    volatility = 0.2  # Volatilité
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
        interest_rate=interest_rate
    )
    BS.calculate()

    # Affichage des résultats
    print(f" BS Call Price: {BS.get_call_price()}")
    print(f" BS Put Price: {BS.get_put_price()}")


    # Initialisation de la classe BinomialModel
    BM = BinomialModel(
        time_to_maturity=time_to_maturity,
        strike=strike,
        current_price=current_price,
        volatility=volatility,
        interest_rate=interest_rate,
        steps=steps,
        option_type=option_type,
        is_american=is_american
    )
    BM.calculate()

    # Affichage des résultats
    print(f" BM Call Price: {BM.get_option_price()}")
