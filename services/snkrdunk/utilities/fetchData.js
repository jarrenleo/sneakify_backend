/**
 * Fetches sneaker sizes data from the SNKRDUNK API based on a given stock keeping unit
 * @async
 * @function fetchData
 * @param {string} sku The stock keeping unit for the sneaker.
 * @returns {Promise<Object[]>} A promise that resolves to an array of objects containing sneaker size information.
 * @throws {Error} Throws an error if the fetch request fails or the response is not OK.
 */
export async function fetchData(sku) {
  try {
    const response = await fetch(
      `https://snkrdunk.com/en/v1/sneakers/${sku}/sizes`
    );
    if (!response.ok) throw new Error("Failed to fetch prices from SNKRDUNK");
    const data = await response.json();

    return data.sizes;
  } catch (error) {
    throw Error(error.message);
  }
}
