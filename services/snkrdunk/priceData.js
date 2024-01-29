import { fetchData } from "./utilities/fetchData.js";
import { convertCurrency } from "./utilities/convertCurrency.js";
import { currencies } from "../../utilities/settings.js";
import { formatPrice } from "../../utilities/helpers.js";

export default class SNKRDunkPrice {
  fees = 0;

  searchLowestAsk(sizesInfo, size) {
    let l = 0;
    let r = sizesInfo.length - 1;
    let m;

    while (l <= r) {
      m = Math.floor((l + r) / 2);

      const currentSize = +sizesInfo[m].size.text.slice(3);
      if (currentSize === size) return sizesInfo[m].price;

      currentSize > size ? (r = m - 1) : (l = m + 1);
    }

    return null;
  }

  async getPrices(sku, size, country) {
    let lowestAsk, payout;

    try {
      const sizesInfo = await fetchData(sku);
      if (!sizesInfo.length) throw Error("Product not found");

      const lowestAskUSD = this.searchLowestAsk(sizesInfo, +size);
      if (lowestAskUSD) {
        lowestAsk = await convertCurrency(currencies[country], lowestAskUSD);
        payout = lowestAsk * ((100 - this.fees) / 100);
      }
    } catch (error) {
      throw Error(error.message);
    } finally {
      return {
        marketplace: "SNKRDunk",
        size,
        lowestAsk: formatPrice(lowestAsk, country),
        highestBid: "-",
        fees: `${this.fees}%`,
        payout: formatPrice(payout, country),
      };
    }
  }
}
