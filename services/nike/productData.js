import { fetchData } from "./utilities/fetchData.js";
import UtiltyClass from "./utilities/utilityClass.js";
import { formatPrice } from "../../utilities/helpers.js";
import { convert } from "html-to-text";

export default class NikeProductData extends UtiltyClass {
  constructor() {
    super();
  }

  getProductInfo(product, sku) {
    return product.length === 1
      ? product[0]
      : product.find((product) => product.merchProduct.styleColor === sku);
  }

  getDescription(channel, description) {
    if (channel === "SNKRS Web")
      return convert(description).split("\nSKU")[0].split("\n").join(" ");

    if (channel === "Nike.com")
      return convert(description).split("\n\n\n")[1].split("\n").join(" ");
  }

  getDiscountRate(merchPrice) {
    if (!merchPrice.discounted) return 0;

    return (
      ((merchPrice.fullPrice - merchPrice.currentPrice) /
        merchPrice.fullPrice) *
      100
    ).toFixed(0);
  }

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

  getProductUrl(channel, country, slug) {
    let countryPath = "",
      launchPath = "";

    if (country !== "US") countryPath = `/${country.toLowerCase()}`;
    if (channel === "SNKRS Web") launchPath = "/launch";

    return `https://www.nike.com${countryPath}${launchPath}/t/${slug}`;
  }

  async getProductData(channel, sku, country, timeZone) {
    try {
      const language = this.languages[country];
      if (!language) throw Error("Country not found");

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
