import { fetchData } from "./utilities/fetchData.js";
import NikeUtilty from "./utilities/nikeUtility.js";

export default class NikeMonitorData extends NikeUtilty {
  constructor() {
    super();
  }

  getProductUrl(channel, country, slug) {
    let countryPath = "",
      launchPath = "";

    if (country !== "US") countryPath = `/${country.toLowerCase()}`;
    if (channel === "SNKRS Web") launchPath = "/launch";

    return `https://www.nike.com${countryPath}${launchPath}/t/${slug}`;
  }

  async getMonitorData(channel, country, timeZone) {
    const language = this.languages[country];
    if (!language) throw Error("Country not found");

    const { objects } = await fetchData(
      `https://api.nike.com/product_feed/threads/v3/?filter=marketplace(${country})&filter=language(${language})&filter=upcoming(false)&filter=channelName(${channel})&filter=productInfo.merchProduct.status(ACTIVE)&filter=exclusiveAccess(true,false)&sort=lastFetchTimeDesc`
    );

    let productCount = 0;
    const restockProducts = [];

    for (const data of objects) {
      const productsInfo = data?.productInfo;
      if (!productsInfo.length) continue;

      for (const productInfo of productsInfo) {
        if (productCount >= 30) break;
        if (productInfo.merchProduct.productType !== "FOOTWEAR") continue;

        const sku = productInfo.merchProduct.styleColor;
        const name =
          this.getName(channel, country, sku, data.publishedContent) ||
          productInfo.productContent.fullTitle;
        const isPopular = this.checkIsPopular(name);
        const brand = productInfo.merchProduct.brand.toUpperCase();
        const price = this.formatPrice(
          +productInfo.merchPrice.currentPrice,
          country,
          productInfo.merchPrice.currency
        );
        const dateTimeObject = new Date(data.lastFetchTime);
        const [lastFetchDate, lastFetchTime] = this.formatDateTime(
          dateTimeObject,
          country,
          timeZone
        );
        const productUrl = this.getProductUrl(
          channel,
          country,
          data.publishedContent.properties.seo.slug
        );
        const imageUrl = this.getImageUrl(sku);

        restockProducts.push({
          channel,
          name,
          isPopular,
          brand,
          sku,
          price,
          lastFetchDate,
          lastFetchTime,
          dateTimeObject,
          productUrl,
          imageUrl,
        });

        productCount++;
      }
    }

    return restockProducts;
  }
}
