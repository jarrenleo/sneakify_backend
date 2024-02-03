import { fetchData } from "./utilities/fetchData.js";
import { convertCurrency } from "./utilities/convertCurrency.js";
import { currencies } from "../../utilities/settings.js";
import { formatPrice } from "../../utilities/helpers.js";

export default class SNKRDunkPrice {
  fees = 0;
  baseUrl = "https://snkrdunk.com/en";
  iconUrl =
    "https://en-assets.snkrdunk.com/e78884508de531e/img/common/app-logo.png";

  searchSizeInfo(sizesInfo, size) {
    let l = 0;
    let r = sizesInfo.length - 1;
    let m;

    while (l <= r) {
      m = Math.floor((l + r) / 2);

      const currentSize = +sizesInfo[m].size.text.slice(3);
      if (currentSize === size) return sizesInfo[m];

      currentSize > size ? (r = m - 1) : (l = m + 1);
    }

    return null;
  }

  async getPrices(sku, size, country) {
    let lowestAsk, payout;
    let productUrl = this.baseUrl + `/search/result?keyword=${sku}`;
    try {
      const sizesInfo = await fetchData(sku);
      if (!sizesInfo.length) throw new Error("Product not found");

      const sizeInfo = this.searchSizeInfo(sizesInfo, +size);
      if (sizeInfo) {
        lowestAsk = sizeInfo.price;
        if (country !== "US")
          lowestAsk = await convertCurrency(
            sizeInfo.currency,
            currencies[country],
            sizeInfo.price
          );

        payout = lowestAsk * ((100 - this.fees) / 100);
      }
      productUrl = this.baseUrl + `/sneakers/${sku}`;
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
        iconUrl: this.iconUrl,
        productUrl,
      };
    }
  }
}
