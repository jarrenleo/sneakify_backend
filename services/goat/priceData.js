import { fetchResults, fetchSizes } from "./utilities/fetchData.js";
import { currencies } from "../../utilities/settings.js";
import { filterSize, formatPrice } from "../../utilities/helpers.js";

/**
 * Class that interacts with the Goat API to retrieve sneaker prices and calculate the payout after fees.
 * @class
 */
export default class GoatPrice {
  /**
   * Fees applied on transactions as a percentage.
   * @type {number}
   */
  fees = 12.4;
  /**
   * Base URL for the GOAT website.
   * @type {string}
   */
  baseUrl = "https://www.goat.com";
  /**
   * URL to the favicon of the GOAT website.
   * @type {string}
   */
  iconUrl = this.baseUrl + "/favicon.ico";

  /**
   * Searches for the lowest ask price and the last sale price for a specific size using binary search.
   * @param {Object[]} sizesInfo - Array of objects containing all sizing information of a sneaker.
   * @param {number | string} size - The sneaker size to search for.
   * @returns {?number[]} An array containing the lowest ask price and last sale price, or null if not found.
   */
  searchLowestAskAndLastSale(sizesInfo, size) {
    let l = 0;
    let r = sizesInfo.length - 1;
    let m;

    function isMatchingSize(sizeInfo) {
      return sizeInfo.sizeOption.value === size;
    }

    function isNewAndInStock(sizeInfo) {
      return (
        sizeInfo.shoeCondition === "new_no_defects" &&
        sizeInfo.boxCondition === "good_condition" &&
        sizeInfo.stockStatus === "single_in_stock"
      );
    }

    while (l <= r) {
      m = Math.floor((l + r) / 2);

      if (isMatchingSize(sizesInfo[m])) {
        if (isNewAndInStock(sizesInfo[m]))
          return [
            sizesInfo[m].lowestPriceCents.amount / 100,
            sizesInfo[m].lastSoldPriceCents.amount / 100,
          ];

        let i = m - 1;

        while (isMatchingSize(sizesInfo[i])) {
          if (isNewAndInStock(sizesInfo[i]))
            return [
              sizesInfo[i].lowestPriceCents.amount / 100,
              sizesInfo[i].lastSoldPriceCents.amount / 100,
            ];
          --i;
        }

        i = m + 1;

        while (isMatchingSize(sizesInfo[i])) {
          if (isNewAndInStock(sizesInfo[i]))
            return [
              sizesInfo[i].lowestPriceCents.amount / 100,
              sizesInfo[i].lastSoldPriceCents.amount / 100,
            ];
          ++i;
        }

        return null;
      }

      sizesInfo[m].sizeOption.value > size ? (r = m - 1) : (l = m + 1);
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
    let lowestAsk, lastSale, payout;
    let productUrl = this.baseUrl + `/search?query=${sku}`;
    try {
      const searchResult = await fetchResults(sku);
      const matchedTerm = searchResult[0]?.matched_terms
        .join("-")
        .toUpperCase();

      if (sku === matchedTerm) {
        const productTemplateId = searchResult[0].data.id;
        const currency = currencies[country];

        const sizesInfo = await fetchSizes(
          productTemplateId,
          country,
          currency
        );

        if (sizesInfo.length) {
          size = filterSize(size);
          const [lowestAskValue, lastSaleValue] =
            this.searchLowestAskAndLastSale(sizesInfo, +size);

          if (lowestAskValue) {
            lowestAsk = lowestAskValue;
            payout = lowestAskValue * ((100 - this.fees) / 100);
          }
          if (lastSaleValue) lastSale = lastSaleValue;
        }
        productUrl = this.baseUrl + `/sneakers/${searchResult[0].data.slug}`;
      }
    } catch (error) {
      throw Error(error.message);
    } finally {
      return {
        marketplace: "Goat",
        lowestAsk: formatPrice(lowestAsk, country),
        lastSale: formatPrice(lastSale, country),
        fees: `${this.fees}%`,
        payout: formatPrice(payout, country),
        iconUrl: this.iconUrl,
        productUrl,
      };
    }
  }
}
