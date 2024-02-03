import { fetchReleaseData } from "./utilities/fetchData.js";
import UtiltyClass from "./utilities/utilityClass.js";
import { formatPrice } from "../../utilities/helpers.js";

export default class NikeReleaseData extends UtiltyClass {
  constructor() {
    super();
  }

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

          const sku = productInfo.merchProduct.styleColor;
          const name =
            this.getName(channel, country, sku, data.publishedContent) ||
            productInfo.productContent.fullTitle;
          const isPopular = this.checkIsPopular(name);
          const brand = productInfo.merchProduct.brand.toUpperCase();
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
            channel,
            name,
            isPopular,
            brand,
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
