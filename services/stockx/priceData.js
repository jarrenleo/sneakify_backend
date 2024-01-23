import { StockxClient } from "stockx-scraper";
import getCurrencyCode from "./utilities/getCurrencyCode.js";
import getSizeInfo from "./utilities/getSizeInfo.js";

export default class StockXPrice {
  async getPrices(country, sku, size) {
    const client = new StockxClient({
      currencyCode: "SGD",
      countryCode: country,
    });
    const result = await client.search({
      query: sku,
    });

    const data = result[0];
    await data.fetch();
  }
}
