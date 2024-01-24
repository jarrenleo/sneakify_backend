import { fetchReleaseData } from "./utilities/fetchData.js";
import NikeUtilty from "./utilities/nikeUtility.js";

export default class NikeReleaseData extends NikeUtilty {
  constructor() {
    super();
  }

  async getReleaseData(channel, country, timeZone) {
    try {
      const language = this.languages[country];
      if (!language) throw Error("Country not found");

      const releaseData = await fetchReleaseData(
        `https://api.nike.com/product_feed/threads/v3/?count=100&filter=marketplace(${country})&filter=language(${language})&filter=upcoming(true)&filter=channelName(${channel})&filter=productInfo.merchProduct.status(ACTIVE)&filter=exclusiveAccess(true,false)&sort=productInfo.merchProduct.commerceStartDateAsc`
      );

      const upcomingProducts = [];

      for (const data of releaseData) {
        if (data.publishedContent.properties.custom.hideFromUpcoming?.length)
          continue;

        const productInfos = data?.productInfo;
        if (!productInfos.length) continue;

        for (const productInfo of productInfos) {
          const productType = productInfo.merchProduct.productType;
          if (productType !== "FOOTWEAR") continue;

          const sku = productInfo.merchProduct.styleColor;
          const name = this.getName(channel, sku, data.publishedContent);
          const isPopular = this.checkIsPopular(name);
          const brand = productInfo.merchProduct.brand.toUpperCase();
          const price = this.getPrice(
            +productInfo.merchPrice.currentPrice,
            country,
            productInfo.merchPrice.currency
          );
          const dateTimeObject = new Date(
            productInfo.launchView?.startEntryDate ||
              productInfo.merchProduct.commerceStartDate
          );
          const [releaseDate, releaseTime] = this.getReleaseDateTime(
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
