export async function convertCurrency(currencyFrom, currencyTo, amount) {
  try {
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${currencyFrom}&to=${currencyTo}&amount=${amount}`
    );
    if (!response.ok) throw Error("Failed to convert currency");
    const data = await response.json();

    return data.rates[currencyTo];
  } catch (error) {
    throw Error(error.message);
  }
}
