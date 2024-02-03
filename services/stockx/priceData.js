import { StockxClient } from "stockx-scraper";
import { currencies } from "../../utilities/settings.js";
import { formatPrice } from "../../utilities/helpers.js";

export default class StockXPrice {
  fees = 12;
  iconUrl = "https://web-assets.stockx.com/static/logo/favicon.ico";

  searchSizeInfo(sizesInfo, size) {
    let l = 0;
    let r = sizesInfo.length - 1;

    while (l <= r) {
      const m = Math.floor((l + r) / 2);

      if (+sizesInfo[m].sizeUS === size) return sizesInfo[m];

      +sizesInfo[m].sizeUS > size ? (r = m - 1) : (l = m + 1);
    }

    return null;
  }

  async getPrices(sku, size, country) {
    let lowestAsk, highestBid, payout;
    let productUrl = `https://stockx.com/search?s=${sku}`;

    try {
      const client = new StockxClient({
        currencyCode: currencies[country],
        countryCode: country,
      });
      const result = await client.search({
        query: sku,
      });

      const data = result[0];

      if (sku === data.sku) productUrl = data.url;

      await data.fetch();

      if (sku === data.sku) {
        const sizeInfo = this.searchSizeInfo(data.sizes, +size);

        if (sizeInfo) {
          lowestAsk = sizeInfo.lowestAsk;
          highestBid = sizeInfo.highestBid;
        }

        if (lowestAsk) payout = lowestAsk * ((100 - this.fees) / 100);

        productUrl = data.url;
      }
    } catch (error) {
      throw Error(error.message);
    } finally {
      return {
        marketplace: "StockX",
        size,
        lowestAsk: formatPrice(lowestAsk, country),
        highestBid: formatPrice(highestBid, country),
        fees: `${this.fees}%`,
        payout: formatPrice(payout, country),
        iconUrl: this.iconUrl,
        productUrl,
      };
    }
  }
}
