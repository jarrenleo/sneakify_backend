import { randomUUID } from "crypto";
import { fetchData } from "./utilities/fetchData.js";
import UtiltyClass from "./utilities/utilityClass.js";
import { formatPrice } from "../../utilities/helpers.js";

/**
 * Class responsible for fetching and processing restocks data from the Nike API.
 * It extends functionality from the Nike UtilityClass.
 * @class
 */
export default class NikeMonitorData extends UtiltyClass {
  constructor() {
    super();
  }

  /**
   * Retrieves monitor data from the Nike API and processes the data for use.
   * @async
   * @function getMonitorData
   * @param {string} channel - The channel name for which to fetch the product data (e.g. 'SNKRS Web').
   * @param {string} country - The country code (e.g. 'SG') used for API query and formatting.
   * @param {string} timeZone - The time zone identifier used for time-related formatting.
   * @returns {Promise<Object[]>} A promise that resolves to an array of objects containing formatted restock product data.
   * @throws {Error} Throws an error if the data fetching process fails.
   */
  async getMonitorData(channel, country, timeZone) {
    try {
      const language = this.languages[country];
      const { objects } = await fetchData(
        `https://api.nike.com/product_feed/threads/v3/?filter=marketplace(${country})&filter=language(${language})&filter=upcoming(false)&filter=channelName(${channel})&filter=productInfo.merchProduct.status(ACTIVE)&filter=exclusiveAccess(true,false)&sort=lastFetchTimeDesc`
      );

      const restockProducts = [];

      for (const data of objects) {
        const productsInfo = data?.productInfo;
        if (!productsInfo.length) continue;

        for (const productInfo of productsInfo) {
          if (productInfo.merchProduct.productType !== "FOOTWEAR") continue;

          const uuid = randomUUID();
          const sku = productInfo.merchProduct.styleColor;
          const name =
            this.getName(channel, country, sku, data.publishedContent) ||
            productInfo.productContent.fullTitle;
          const price = formatPrice(
            +productInfo.merchPrice.currentPrice,
            country,
            productInfo.merchPrice.currency
          );
          const dateTimeObject = new Date(data.lastFetchTime);
          const [_, lastFetchTime] = this.formatDateTime(
            dateTimeObject,
            country,
            timeZone
          );
          const imageUrl = this.getImageUrl(sku);

          restockProducts.push({
            uuid,
            channel,
            name,
            sku,
            price,
            lastFetchTime,
            dateTimeObject,
            imageUrl,
          });
        }
      }

      return restockProducts;
    } catch (error) {
      throw Error(error.message);
    }
  }
}
