export async function fetchData(sku) {
  try {
    const response = await fetch(
      `https://snkrdunk.com/en/v1/sneakers/${sku}/sizes`
    );
    if (!response.ok) throw Error("Failed to fetch prices from SNKRDUNK");
    const data = await response.json();

    return data.sizes;
  } catch (error) {
    throw Error(error.message);
  }
}
