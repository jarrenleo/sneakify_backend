import { config } from "dotenv";
config();

export async function fetchResults(query) {
  try {
    const currentUnixTime = Date.parse(new Date());

    const response = await fetch(
      `https://ac.cnstrc.com/autocomplete/${query}?c=ciojs-client-2.35.2&key=${process.env.GOAT_KEY}&filters[brand]=nike&filters[brand]=air jordan&filters[brand]=adidas&&filters[web_groups]=sneakers&num_results_Products=1&_dt=${currentUnixTime}`
    );
    if (!response.ok) throw Error("Failed to fetch result from goat");
    const data = await response.json();

    return data.sections.Products;
  } catch (error) {
    throw Error(error.message);
  }
}

export async function fetchLowestAsks(productTemplateId, country, currency) {
  try {
    const response = await fetch(
      `https://www.goat.com/web-api/v1/product_variants/buy_bar_data?productTemplateId=${productTemplateId}&countryCode=${country}`,
      {
        headers: {
          Cookie: `currency=${currency}`,
        },
      }
    );
    if (!response.ok) throw Error("Failed to fetch lowest ask from goat");
    const data = await response.json();

    return data;
  } catch (error) {
    throw Error(error.message);
  }
}

export async function fetchHighestBids(productTemplateId, country, currency) {
  try {
    const response = await fetch(
      `https://www.goat.com/web-api/v1/highest_offers?productTemplateId=${productTemplateId}&countryCode=${country}`,
      {
        headers: {
          Cookie: `currency=${currency}`,
        },
      }
    );
    if (!response.ok) throw Error("Failed to fetch highest bid from goat");
    const data = await response.json();

    return data;
  } catch (error) {
    throw Error(error.message);
  }
}
