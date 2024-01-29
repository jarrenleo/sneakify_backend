export async function convertCurrency(currencyTo, amount) {
  try {
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=USD&to=${currencyTo}&amount=${amount}`
    );
    if (!response.ok) throw Error("Failed to convert currency");
    const data = await response.json();

    return data.rates[currencyTo];
  } catch (error) {
    throw Error(error.message);
  }
}
