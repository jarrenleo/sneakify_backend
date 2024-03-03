import { fetchData } from "./utilities/fetchData.js";
import { convertCurrency } from "./utilities/convertCurrency.js";
import { currencies } from "../../utilities/settings.js";
import { filterSize, formatPrice } from "../../utilities/helpers.js";

/**
 * Class that interacts with the SNKRDUNK API to retrieve sneaker prices and calculate the payout after fees.
 * @class
 */
export default class SNKRDunkPrice {
  /**
   * Fees applied on transactions as a percentage.
   * @type {number}
   */
  fees = 0;
  /**
   * Base URL for the SNKRDUNK website.
   * @type {string}
   */
  baseUrl = "https://snkrdunk.com/en";
  /**
   * URL to the favicon of the SNKRDUNK website.
   * @type {string}
   */
  iconUrl =
    "https://en-assets.snkrdunk.com/e78884508de531e/img/common/app-logo.png";

  /**
   * Searches for the lowest ask price for a specific size using binary search.
   * @param {Object[]} sizesInfo - Array of objects containing all sizing information of a sneaker.
   * @param {number | string} size - The sneaker size to search for.
   * @returns {?Object.<string, string>} The size information object or null if not found.
   */
  searchSizeInfo(sizesInfo, size) {
    let l = 0;
    let r = sizesInfo.length - 1;
    let m;

    while (l <= r) {
      m = Math.floor((l + r) / 2);

      const currentSize = +filterSize(sizesInfo[m].size.text.slice(3));
      if (currentSize === size) return sizesInfo[m];

      currentSize > size ? (r = m - 1) : (l = m + 1);
    }

    return null;
  }

  /**
   * Retrieves pricing information for a specific sneaker SKU and size combination.
   * @async
   * @param {string} sku - The sneaker SKU to look up.
   * @param {number | string} size - The size of the sneaker to price check.
   * @param {string} country - The country code for localisation of the query.
   * @returns {Promise<Object>} A promise that resolves with an object containing the price information and relevant URLs.
   */
  async getPrices(sku, size, country) {
    let lowestAsk, payout;
    let productUrl = this.baseUrl + `/search/result?keyword=${sku}`;
    try {
      const sizesInfo = await fetchData(sku);
      if (!sizesInfo.length) throw new Error("Product not found");

      size = filterSize(size);
      const sizeInfo = this.searchSizeInfo(sizesInfo, +size);
      if (sizeInfo && sizeInfo.price) {
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
        lowestAsk: formatPrice(lowestAsk, country),
        lastSale: "-",
        fees: `${this.fees}%`,
        payout: formatPrice(payout, country),
        iconUrl: this.iconUrl,
        productUrl,
      };
    }
  }
}
