import fetchData from "./utilities/fetchData.js";
import getLanguage from "./utilities/getLanguage.js";

export default class NikeReleaseData {
  getUpcomingIndex(releaseData) {
    return releaseData.findIndex(
      (data) =>
        Date.parse(data.productInfo[0].merchProduct.commerceStartDate) >
        Date.now()
    );
  }

  getName(channelName, sku, publishedContent) {
    if (channelName === "Nike.com") {
      const title = publishedContent.properties.title;
      const subtitle = publishedContent.properties.subtitle;

      return `${title} ${subtitle}`;
    }

    const title = publishedContent.properties.seo.title;

    if (title.includes(sku)) {
      const trimIndex = title.indexOf(sku) - 2;
      return title.slice(0, trimIndex);
    }

    for (let i = publishedContent.nodes.length - 1; i >= 0; --i) {
      const properties = publishedContent.nodes[i].properties;

      if (properties.internalName.includes(sku))
        return `${properties.subtitle} '${properties.title}'`;
    }
  }

  isPopular(name) {
    const popularKeywords = [
      "Dunk Low",
      "Jordan 1 Retro",
      "Jordan 1 Low",
      "Jordan 4",
    ];
    const unpopularKeywords = [
      "Younger",
      "Little",
      "Toddler",
      "Craft",
      "Disrupt",
      "CMFT",
    ];

    for (const keyword of unpopularKeywords)
      if (name.includes(keyword)) return false;

    for (const keyword of popularKeywords)
      if (name.includes(keyword)) return true;

    return false;
  }

  getPrice(price, locale) {
    if (Number.isInteger(price)) return price.toLocaleString(locale);

    return price.toFixed(2).toLocaleString(locale);
  }

  getReleaseDateAndTime(releaseDateTime, locale) {
    const date = new Date(releaseDateTime);
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const dateFormatter = new Intl.DateTimeFormat(locale, {
      dateStyle: "full",
      timeZone,
    });

    const timeFormatter = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone,
    });

    return [
      dateFormatter.format(date),
      timeFormatter.format(date).toUpperCase(),
    ];
  }

  getImage(sku) {
    return `https://secure-images.nike.com/is/image/DotCom/${sku.replace(
      "-",
      "_"
    )}`;
  }

  async getReleaseData(country, channelName, locale) {
    try {
      const language = getLanguage(country);
      if (!language) throw Error("Country not found");

      const releaseData = await fetchData(
        `https://api.nike.com/product_feed/threads/v3/?count=100&filter=marketplace(${country})&filter=language(${language})&filter=upcoming(true)&filter=channelName(${channelName})&filter=productInfo.merchProduct.status(ACTIVE)&filter=exclusiveAccess(true,false)&sort=productInfo.merchProduct.commerceStartDateAsc`
      );
      const upcomingIndex = this.getUpcomingIndex(releaseData);

      const upcomingProducts = [];

      for (let i = upcomingIndex; i < releaseData.length; ++i) {
        const productInfos = releaseData[i]?.productInfo;
        if (!productInfos.length) continue;

        for (const productInfo of productInfos) {
          const productType = productInfo.merchProduct.productType;
          if (productType !== "FOOTWEAR") continue;

          const sku = productInfo.merchProduct.styleColor;
          const name = this.getName(
            channelName,
            sku,
            releaseData[i].publishedContent
          );
          const isPopular = this.isPopular(name);
          const brand = productInfo.merchProduct.brand.toUpperCase();
          const price = `${productInfo.merchPrice.currency} ${this.getPrice(
            +productInfo.merchPrice.currentPrice,
            locale
          )}`;
          const releaseDateTime =
            productInfo.launchView?.startEntryDate ||
            productInfo.merchProduct.commerceStartDate;
          const [date, time] = this.getReleaseDateAndTime(
            releaseDateTime,
            locale
          );
          const unixTime = Date.parse(releaseDateTime) / 1000;
          const imageUrl = this.getImage(sku);

          upcomingProducts.push({
            channelName,
            name,
            isPopular,
            brand,
            sku,
            price,
            date,
            time,
            unixTime,
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
