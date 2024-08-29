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


if __name__ == "__main__":
    # Exemple d'utilisation
    time_to_maturity = 2  # Temps jusqu'à maturité en années
    strike = 90  # Prix d'exercice
    current_price = 100  # Prix actuel de l'actif sous-jacent
    volatility = 0.2  # Volatilité
    interest_rate = 0.05  # Taux d'intérêt sans risque

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
    print(f"Call Price: {BS.get_call_price()}")
    print(f"Put Price: {BS.get_put_price()}")
