import { config } from "dotenv";
config();

export async function getSearchResult(query, resultNum) {
  const currentUnixTime = Date.parse(new Date());

  const response = await fetch(
    `https://ac.cnstrc.com/autocomplete/${query}?c=ciojs-client-2.35.2&key=${process.env.GOAT_KEY}&filters[brand]=nike&filters[brand]=air jordan&filters[brand]=adidas&num_results_Products=${resultNum}&_dt=${currentUnixTime}`
  );
  const data = await response.json();

  const results = data.sections.Products;
  if (!results.length) return null;

  return results;
}
