import { randomUUID } from "crypto";
import { fetchReleaseData } from "./utilities/fetchData.js";
import UtiltyClass from "./utilities/utilityClass.js";
import { formatPrice } from "../../utilities/helpers.js";

/**
 * Class responsible for fetching and processing release data from the Nike API.
 * It extends functionality from the Nike UtilityClass.
 * @class
 */
export default class NikeReleaseData extends UtiltyClass {
  constructor() {
    super();
  }

  /**
   * Retrieves release data from the Nike API and processes the data for use.
   * @async
   * @function getReleaseData
   * @param {string} channel - The channel name for which to fetch the product data (e.g. 'SNKRS Web').
   * @param {string} country - The country code (e.g. 'SG') used for API query and formatting.
   * @param {string} timeZone - The time zone identifier used for time-related formatting.
   * @returns {Promise<Object[]>} A promise that resolves to an array of objects containing processed and formatted release data.
   * @throws {Error} Throws an error if fetching the release data fails.
   */
  async getReleaseData(channel, country, timeZone) {
    try {
      const language = this.languages[country];
      const releaseData = await fetchReleaseData(
        `https://api.nike.com/product_feed/threads/v3/?count=100&filter=marketplace(${country})&filter=language(${language})&filter=upcoming(true)&filter=channelName(${channel})&filter=productInfo.merchProduct.status(ACTIVE)&filter=exclusiveAccess(true,false)&sort=productInfo.merchProduct.commerceStartDateAsc`
      );

      const upcomingProducts = [];

      for (const data of releaseData) {
        if (data.publishedContent.properties.custom.hideFromUpcoming?.length)
          continue;

        const productsInfo = data?.productInfo;
        if (!productsInfo.length) continue;

        for (const productInfo of productsInfo) {
          if (productInfo.merchProduct.productType !== "FOOTWEAR") continue;

          const uuid = randomUUID();
          const sku = productInfo.merchProduct.styleColor;
          const name =
            this.getName(channel, country, sku, data.publishedContent) ||
            productInfo.productContent.fullTitle;
          const isPopular = this.checkIsPopular(country, name);
          const price = formatPrice(
            +productInfo.merchPrice.currentPrice,
            country,
            productInfo.merchPrice.currency
          );
          const dateTimeObject = new Date(
            productInfo.launchView?.startEntryDate ||
              productInfo.merchProduct.commerceStartDate
          );
          const [releaseDate, releaseTime] = this.formatDateTime(
            dateTimeObject,
            country,
            timeZone
          );
          const imageUrl = this.getImageUrl(sku);

          upcomingProducts.push({
            uuid,
            channel,
            name,
            isPopular,
            sku,
            price,
            releaseDate,
            releaseTime,
            dateTimeObject,
            imageUrl,
          });
        }
      }

      return upcomingProducts;
    } catch (error) {
      throw Error(error.message);
    }
  }
}
