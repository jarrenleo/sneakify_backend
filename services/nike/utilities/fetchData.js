export default async function fetchData(url, releaseData = []) {
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.objects.length) throw Error("No upcoming releases");

    releaseData.push(...data.objects);

    if (data.pages.next)
      return await fetchData(
        `https://api.nike.com${data.pages.next}`,
        releaseData
      );

    return releaseData;
  } catch (error) {
    throw Error(error.message);
  }
}
