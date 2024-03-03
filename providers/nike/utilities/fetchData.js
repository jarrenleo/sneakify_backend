/**
 * Fetches the relevant data from the Nike API.
 * @async
 * @function fetchData
 * @param {string} url - The API endpoint to fetch data from.
 * @returns {Promise<Object>} A promise that resolves with an object containing the relevant Nike data.
 * @throws {Error} Throws an error if data fails to fetch.
 */
export async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch nike data");

    const data = await response.json();
    if (!data.objects.length) throw new Error("No products found");

    return data;
  } catch (error) {
    throw Error(error.message);
  }
}

/**
 * Fetches the releases data recursively from the Nike API.
 * @async
 * @function fetchReleaseData
 * @param {string} url - The API endpoint to fetch data from.
 * @param {Object[]} releaseData - The array that stores all release data as the function fetches more data recursively.
 * @returns {Promise<Object[]>} A promise that resolves with an array of objects containing the Nike release data.
 * @throws {Error} Throws an error if data fails to fetch.
 */
export async function fetchReleaseData(url, releaseData = []) {
  try {
    const { pages, objects } = await fetchData(url);

    releaseData.push(...objects);

    if (pages.next)
      return await fetchReleaseData(
        `https://api.nike.com${pages.next}`,
        releaseData
      );

    return releaseData;
  } catch (error) {
    throw Error(error.message);
  }
}
