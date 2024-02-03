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
