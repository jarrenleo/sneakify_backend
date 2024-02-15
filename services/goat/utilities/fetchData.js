import { config } from "dotenv";
config();

/**
 * Fetches autocomplete search results from the Goat search API.
 * @async
 * @function fetchResults
 * @param {string} query - The search query string.
 * @returns {Promise<Object[]>} A promise that resolves with an array of objects containing the search results data.
 * @throws {Error} Throws an error if the fetch operation fails or if the API responds with an error status.
 */
export async function fetchResults(query) {
  try {
    const currentUnixTime = Date.parse(new Date());

    const response = await fetch(
      `https://ac.cnstrc.com/autocomplete/${query}?c=ciojs-client-2.35.2&key=${process.env.GOAT_KEY}&filters[brand]=nike&filters[brand]=air jordan&filters[brand]=adidas&&filters[web_groups]=sneakers&num_results_Products=1&_dt=${currentUnixTime}`
    );
    if (!response.ok) throw new Error("Failed to fetch result from goat");
    const data = await response.json();

    return data.sections.Products;
  } catch (error) {
    throw Error(error.message);
  }
}

/**
 * Fetches available sizes and prices for a specific product from the Goat API.
 * @async
 * @function fetchSizes
 * @param {string} productTemplateId - The product template ID for which product to fetch sizes.
 * @param {string} country - The country code for localisation.
 * @param {string} currency - The currency in which prices should be displayed.
 * @returns {Promise<Object[]>} A promise that resolves with an array of objects containing the price data for a specified product.
 * @throws {Error} Throws an error if the fetch operation fails or if the API responds with an error status.
 */
export async function fetchSizes(productTemplateId, country, currency) {
  try {
    const response = await fetch(
      `https://www.goat.com/web-api/v1/product_variants/buy_bar_data?productTemplateId=${productTemplateId}&countryCode=${country}`,
      {
        headers: {
          Cookie: `currency=${currency}`,
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch sizes from goat");
    const data = await response.json();

    return data;
  } catch (error) {
    throw Error(error.message);
  }
}
