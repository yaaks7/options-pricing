import numpy as np
from model import BlackScholes, Binomial, MonteCarlo
from mlp_model import NeuralNetwork
from greeks import Greeks

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


def option_sensitivity(model_type, parameter, fixed_params, steps=10):
    """
    Calcule la sensibilité des options pour les types call et put, sur plusieurs modèles, et pour différents paramètres.

    :param model_type: Modèles choisis (par exemple, ['BlackScholes', 'Binomial', 'MonteCarlo', 'NeuralNetwork']).
    :param parameter: Le paramètre à faire varier (par exemple 'strike', 'time_to_maturity', 'volatility', etc.).
    :param fixed_params: Dictionnaire contenant les paramètres fixes pour le calcul de l'option.
    :param steps: Nombre de pas pour faire varier le paramètre.
    :return: Dictionnaire des prix pour chaque modèle et type d'option (call et put).
    """

    # Extraire les paramètres fixes
    time_to_maturity = fixed_params.get('time_to_maturity', 1)
    strike = fixed_params.get('strike', 100)
    current_price = fixed_params.get('current_price', 100)
    volatility = fixed_params.get('volatility', 0.2)
    interest_rate = fixed_params.get('interest_rate', 0.05)
    binomial_steps = fixed_params.get('steps', 100)  # Paramètre spécifique à Binomial
    monte_carlo_num_simulations = fixed_params.get('num_simulations', 10000)  # Paramètres spécifiques à Monte Carlo
    monte_carlo_num_steps = fixed_params.get('num_steps', 100)

    # Définir la plage de valeurs pour le paramètre sélectionné
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

    # Boucle pour faire varier le paramètre choisi
    for value in values:
        # Modifier la valeur du paramètre sélectionné dans chaque modèle
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
                nn_call = NeuralNetwork(
                    time_to_maturity if parameter != 'time_to_maturity' else value,
                    strike if parameter != 'strike' else value,
                    current_price if parameter != 'current_price' else value,
                    volatility if parameter != 'volatility' else value,
                    interest_rate, 'call'
                )
                nn_put = NeuralNetwork(
                    time_to_maturity if parameter != 'time_to_maturity' else value,
                    strike if parameter != 'strike' else value,
                    current_price if parameter != 'current_price' else value,
                    volatility if parameter != 'volatility' else value,
                    interest_rate, 'put'
                )
                nn_call.load()
                nn_put.load()
                nn_call.calculate()
                nn_put.calculate()
                sensitivity_results['call'][model].append(nn_call.get_option_price())
                sensitivity_results['put'][model].append(nn_put.get_option_price())

    return sensitivity_results


def greeks_sensitivity(greek, parameter, fixed_params, steps=10):
    """
    Calcule la sensibilité des greeks (delta, gamma, theta, vega, rho) pour les options Call et Put.

    :param greek: Le greek à calculer (par exemple 'delta', 'gamma', 'theta', 'vega', 'rho').
    :param parameter: Le paramètre à faire varier (par exemple 'strike', 'time_to_maturity', 'volatility', etc.).
    :param fixed_params: Dictionnaire contenant les paramètres fixes pour le calcul des greeks.
    :param steps: Nombre de pas pour faire varier le paramètre.
    :return: Dictionnaire des valeurs des greeks pour les types d'options call et put.
    """

    # Extraire les paramètres fixes
    time_to_maturity = fixed_params.get('time_to_maturity', 1)
    strike = fixed_params.get('strike', 100)
    current_price = fixed_params.get('current_price', 100)
    volatility = fixed_params.get('volatility', 0.2)
    interest_rate = fixed_params.get('interest_rate', 0.05)

    # Définir la plage de valeurs pour le paramètre sélectionné
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

    # Boucle pour faire varier le paramètre choisi
    for value in values:
        # Calcul des greeks pour les options Call et Put
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

        # Sélectionner le greek demandé
        sensitivity_results['call'].append(getattr(greeks_call, greek)())
        sensitivity_results['put'].append(getattr(greeks_put, greek)())

    return sensitivity_results




if __name__ == "__main__":
    # Exemple de paramètres fixes pour les tests
    fixed_params = {
        "time_to_maturity": 1,  # Temps avant maturité (en années)
        "strike": 100,          # Prix d'exercice
        "current_price": 100,   # Prix actuel
        "volatility": 0.2,      # Volatilité
        "interest_rate": 0.05,  # Taux d'intérêt sans risque
        "min_strike": 80,       # Prix d'exercice minimal (pour sensibilité)
        "max_strike": 120,      # Prix d'exercice maximal (pour sensibilité)
        "min_time_to_maturity": 0.5,
        "max_time_to_maturity": 2,
        "min_volatility": 0.1,
        "max_volatility": 0.5,
        "min_current_price": 90,
        "max_current_price": 110,
        "steps": 100,           # Ajouté pour Binomial
        "num_simulations": 10000,  # Ajouté pour Monte Carlo
        "num_steps": 100        # Ajouté pour Monte Carlo
    }

    # Test pour la sensibilité en fonction du strike pour BlackScholes et Binomial
    result1 = option_sensitivity(
        model_type=['BlackScholes', 'Binomial'],  # Modèles à tester
        parameter='volatility',  # Paramètre que l'on souhaite faire varier
        fixed_params=fixed_params,  # Paramètres fixes
        steps=10  # Nombre de pas pour faire varier le strike
    )

    result = greeks_sensitivity('vega', 'strike', fixed_params)


    # Affichage des résultats pour vérifier
    print("Sensibilité des options en fonction du strike:")
    print(result)

