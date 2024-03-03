import { fetchData } from "./utilities/fetchData.js";
import UtiltyClass from "./utilities/utilityClass.js";
import { formatPrice } from "../../utilities/helpers.js";
import { convert } from "html-to-text";

/**
 * Class responsible for fetching and processing product data from the Nike API.
 * It extends functionality from the Nike UtilityClass.
 * @class
 */
export default class NikeProductData extends UtiltyClass {
  constructor() {
    super();
  }

  /**
   * Selects the relevant product information based on sku match or the first product if only one exists.
   * @function getProductInfo
   * @param {Object[]} product - Array of product info objects.
   * @param {string} sku - The unique identifier for a product (style color).
   * @returns {Object} The matching product info object.
   */
  getProductInfo(productsInfo, sku) {
    return productsInfo.length === 1
      ? productsInfo[0]
      : productsInfo.find((product) => product.merchProduct.styleColor === sku);
  }

  /**
   * Formats and extracts description for a specific channel.
   * @function getDescription
   * @param {string} channel - The channel for which the description is tailored (e.g. 'SNKRS Web').
   * @param {string} description - The original description to be formatted.
   * @returns {string} The formatted description.
   */
  getDescription(channel, description) {
    if (channel === "SNKRS Web")
      return convert(description).split("\nSKU")[0].split("\n").join(" ");

    if (channel === "Nike.com")
      return convert(description).split("\n\n\n")[1].split("\n").join(" ");
  }

  /**
   * Calculates the discount rate for a product based on its merch price.
   * @function getDiscountRate
   * @param {Record<string | Object>} merchPrice - The merch price object containing pricing information.
   * @returns {number} The discount rate as a percentage, rounded to the nearest whole number.
   */
  getDiscountRate(merchPrice) {
    if (!merchPrice.discounted) return 0;

    return (
      ((merchPrice.fullPrice - merchPrice.currentPrice) /
        merchPrice.fullPrice) *
      100
    ).toFixed(0);
  }

  /**
   * Extracts the method of release for a product, and if it's DAN, includes the entry duration.
   * @function getMethod
   * @param {Object} product - The product object to extract the release method from.
   * @returns {string} The release method with duration if applicable.
   */
  getMethod(product) {
    const method =
      product.launchView?.method ?? product.merchProduct.publishType ?? "-";

    if (method === "DAN") {
      const duration =
        (Date.parse(product.launchView.stopEntryDate) -
          Date.parse(product.launchView.startEntryDate)) /
        (60 * 1000);

      return `${method} (${duration} minutes)`;
    }

    return method;
  }

  /**
   * Extracts the stock level of each size by matching the sizes with their respective stock levels.
   * @function getSizesAndStockLevels
   * @param {Object[]} skus - Array of sku objects with size information.
   * @param {Object[]} gtins - Array of gtin objects with stock level information.
   * @returns  {Object[]} An array of objects with size and stock level properties.
   */
  getSizesAndStockLevels(skus, gtins) {
    const sizesAndStockLevels = [];
    if (!skus || !gtins) return sizesAndStockLevels;

    const gtinMap = new Map();

    for (const gtin of gtins) {
      gtinMap.set(gtin.gtin, gtin);
    }

    for (const sku of skus) {
      const sizeAndStockLevel = { size: sku.nikeSize, stockLevel: "OOS" };

      const matchedGtin = gtinMap.get(sku.gtin);
      if (matchedGtin) sizeAndStockLevel.stockLevel = matchedGtin.level;

      sizesAndStockLevels.push(sizeAndStockLevel);
    }

    return sizesAndStockLevels;
  }

  /**
   * Constructs the product URL based on various parameters.
   * @function getProdctUrl
   * @param {string} channel - The channel referring to where the product is sold.
   * @param {string} country - The country code used to construct the URL.
   * @param {string} slug - Slug used in the URL to identify the product.
   * @returns {string} The constructed product URL.
   */
  getProductUrl(channel, country, slug) {
    let countryPath = "",
      launchPath = "";

    if (country !== "US") countryPath = `/${country.toLowerCase()}`;
    if (channel === "SNKRS Web") launchPath = "/launch";

    return `https://www.nike.com${countryPath}${launchPath}/t/${slug}`;
  }

  /**
   * Retrieves product data from the Nike API and processes the data for use.
   * @async
   * @function getProductData
   * @param {string} channel - The channel name for which to fetch the product data (e.g. 'SNKRS Web').
   * @param {string} sku - The stocking keeping unit for a product.
   * @param {string} country - The country code (e.g. 'SG') used for API query and formatting.
   * @param {string} timeZone - The time zone identifier used for time-related formatting.
   * @returns {Promise<Object>} A promise that resolves to an object containing processed and formatted product data.
   * @throws {Error} Throws an error if fetching the product data fails.
   */
  async getProductData(channel, sku, country, timeZone) {
    try {
      const language = this.languages[country];
      const { objects } = await fetchData(
        `https://api.nike.com/product_feed/threads/v3/?filter=marketplace(${country})&filter=language(${language})&filter=channelName(${channel})&filter=productInfo.merchProduct.styleColor(${sku})&filter=exclusiveAccess(true,false)`
      );

      const productInfo = this.getProductInfo(objects[0].productInfo, sku);
      const name =
        this.getName(channel, country, sku, objects[0].publishedContent) ||
        productInfo.productContent.fullTitle;
      const colour = productInfo.productContent.colorDescription || "-";
      const productDescription =
        channel === "SNKRS Web"
          ? objects[0].publishedContent.nodes[0].properties.body
          : productInfo.productContent.description;
      const description = this.getDescription(channel, productDescription);
      const dateTimeObject = new Date(
        productInfo.launchView?.startEntryDate ||
          productInfo.merchProduct.commerceStartDate
      );
      const [releaseDate, releaseTime] = this.formatDateTime(
        dateTimeObject,
        country,
        timeZone
      );
      const retailPrice = formatPrice(
        +productInfo.merchPrice.fullPrice,
        country,
        productInfo.merchPrice.currency
      );
      const currentPrice = formatPrice(
        +productInfo.merchPrice.currentPrice,
        country,
        productInfo.merchPrice.currency
      );
      const discountRate = this.getDiscountRate(productInfo.merchPrice);
      const method = this.getMethod(productInfo);
      const quantity = productInfo.merchProduct.quantityLimit;
      const sizesAndStockLevels = this.getSizesAndStockLevels(
        productInfo.skus,
        productInfo.availableGtins
      );
      const productUrl = this.getProductUrl(
        channel,
        country,
        objects[0].publishedContent.properties.seo.slug
      );
      const imageUrl = this.getImageUrl(sku);

      return {
        name,
        colour,
        description,
        releaseDate,
        releaseTime,
        sku,
        retailPrice,
        currentPrice,
        discountRate,
        method,
        quantity,
        sizesAndStockLevels,
        productUrl,
        imageUrl,
      };
    } catch (error) {
      throw Error(error.message);
    }
  }
}
