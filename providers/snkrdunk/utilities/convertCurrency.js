/**
 * Converts a currency amount from one currency to another using the Frankfurter API.
 * @async
 * @function convertCurrency
 * @param {string} currencyFrom - The currency code to convert from (e.g. "USD").
 * @param {string} currencyTo - The currency code to convert to (e.g. "EUR").
 * @param {string | number} amount - The amount of currency to convert.
 * @returns {Promise<number>} The converted amount in the target currency.
 * @throws {Error} Throws an error if the currency conversion fails or the response is not OK.
 */
export async function convertCurrency(currencyFrom, currencyTo, amount) {
  try {
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${currencyFrom}&to=${currencyTo}&amount=${amount}`
    );
    if (!response.ok) throw new Error("Failed to convert currency");
    const data = await response.json();

    return data.rates[currencyTo];
  } catch (error) {
    throw Error(error.message);
  }
}
