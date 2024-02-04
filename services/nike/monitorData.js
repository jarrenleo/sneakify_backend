import { fetchData } from "./utilities/fetchData.js";
import UtiltyClass from "./utilities/utilityClass.js";
import { formatPrice } from "../../utilities/helpers.js";

export default class NikeMonitorData extends UtiltyClass {
  constructor() {
    super();
  }

  async getMonitorData(channel, country, timeZone) {
    try {
      const language = this.languages[country];
      const { objects } = await fetchData(
        `https://api.nike.com/product_feed/threads/v3/?filter=marketplace(${country})&filter=language(${language})&filter=upcoming(false)&filter=channelName(${channel})&filter=productInfo.merchProduct.status(ACTIVE)&filter=exclusiveAccess(true,false)&sort=lastFetchTimeDesc`
      );

      let productCount = 0;
      const restockProducts = [];

      for (const data of objects) {
        const productsInfo = data?.productInfo;
        if (!productsInfo.length) continue;

        for (const productInfo of productsInfo) {
          if (productCount >= 25) break;
          if (productInfo.merchProduct.productType !== "FOOTWEAR") continue;

          const sku = productInfo.merchProduct.styleColor;
          const name =
            this.getName(channel, country, sku, data.publishedContent) ||
            productInfo.productContent.fullTitle;
          const isPopular = this.checkIsPopular(name);
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
            channel,
            name,
            isPopular,
            sku,
            price,
            lastFetchTime,
            dateTimeObject,
            imageUrl,
          });

          productCount++;
        }
      }

      return restockProducts;
    } catch (error) {
      throw Error(error.message);
    }
  }
}
