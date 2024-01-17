import fetchData from "./utilities/fetchData.js";
import getLanguage from "./utilities/getLanguage.js";
import groupBy from "lodash.groupby";
import sortBy from "lodash.sortby";

export default class ReleaseData {
  getUpcomingIndex(releaseData) {
    return releaseData.findIndex(
      (data) =>
        Date.parse(data.productInfo[0].merchProduct.commerceStartDate) >
        Date.now()
    );
  }

  getImage(sku) {
    return `https://secure-images.nike.com/is/image/DotCom/${sku.replace(
      "-",
      "_"
    )}`;
  }

  isNotable(name) {
    const notableKeywords = [
      "Dunk Low",
      "Jordan 1 Retro",
      "Jordan 1 Mid",
      "Jordan 1 Low",
      "Jordan 4",
    ];
    const notNotableKeywords = [
      "Younger",
      "Little",
      "Toddler",
      "Craft",
      "Disrupt",
      "CMFT",
    ];

    for (const keyword of notNotableKeywords)
      if (name.includes(keyword)) return false;

    for (const keyword of notableKeywords)
      if (name.includes(keyword)) return true;

    return false;
  }

  getPrice(price, locale) {
    if (!Number.isInteger(price))
      return price.toFixed(2).toLocaleString(locale);

    return price.toLocaleString(locale);
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

  sortByDate(data) {
    return sortBy(data, "dateTimeObject");
  }

  groupByDate(data) {
    return groupBy(data, "date");
  }

  async getReleaseData(country, locale) {
    try {
      const language = getLanguage(country);
      if (!language) throw Error("Country not found");

      const releaseData = await fetchData(
        `https://api.nike.com/product_feed/threads/v3/?count=100&filter=marketplace(${country})&filter=language(${language})&filter=upcoming(true)&filter=channelName(SNKRS Web)&filter=productInfo.merchProduct.status(ACTIVE)&filter=exclusiveAccess(true,false)&sort=productInfo.merchProduct.commerceStartDateAsc`
      );
      const upcomingIndex = this.getUpcomingIndex(releaseData);

      let upcomingProducts = [];

      for (let i = upcomingIndex; i < releaseData.length; ++i) {
        const productInfo = releaseData[i]?.productInfo[0];
        if (!productInfo) continue;

        const productType = productInfo.merchProduct.productType;
        if (productType !== "FOOTWEAR") continue;

        const sku = productInfo.merchProduct.styleColor;
        const image = this.getImage(sku);
        const name = productInfo.productContent.title;
        const isNotable = this.isNotable(name);
        const brand = productInfo.merchProduct.brand.toUpperCase();
        const price = `${productInfo.merchPrice.currency} ${this.getPrice(
          +productInfo.merchPrice.currentPrice,
          locale
        )}`;
        const releaseDateTime =
          productInfo.launchView?.startEntryDate ??
          productInfo.merchProduct.commerceStartDate;
        const [date, time] = this.getReleaseDateAndTime(
          releaseDateTime,
          locale
        );
        const dateTimeObject = new Date(releaseDateTime);

        upcomingProducts.push({
          image,
          name,
          isNotable,
          brand,
          sku,
          price,
          date,
          time,
          dateTimeObject,
        });
      }

      const sortedUpcomingProducts = this.sortByDate(upcomingProducts);
      const groupedUpcomingProducts = this.groupByDate(sortedUpcomingProducts);

      return groupedUpcomingProducts;
    } catch (error) {
      throw Error(error.message);
    }
  }
}
