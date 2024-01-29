import { locales } from "../../../utilities/settings.js";

export default class UtilityClass {
  popularKeywords = [
    "Dunk Low",
    "Jordan 1 Retro",
    "Jordan 1 Low",
    "Jordan 4",
    "Kobe",
    "Travis Scott",
  ];
  unpopularKeywords = [
    "Younger",
    "Little",
    "Toddler",
    "Craft",
    "Disrupt",
    "CMFT",
    "Golf",
  ];
  languages = {
    SG: "en-GB",
    MY: "en-GB",
    JP: "ja",
    GB: "en-GB",
    NL: "en-GB",
    AU: "en-GB",
    CA: "en-GB",
    US: "en",
  };

  getName(channel, country, sku, publishedContent) {
    if (channel !== "SNKRS Web") return;

    const title = publishedContent.properties.seo.title;

    if (title.includes(sku)) {
      let startSliceIndex = 0;
      if (country === "JP" && title.includes("NIKE公式")) startSliceIndex = 8;

      const endSliceIndex = title.indexOf(sku) - 2;

      return title.slice(startSliceIndex, endSliceIndex);
    }

    const numOfProducts = publishedContent.properties.products.length;

    if (numOfProducts === 1) {
      const altText = publishedContent.nodes.at(-1).properties.altText;
      if (!altText) return;

      const endSliceIndex = altText.toLowerCase().indexOf("release") - 1;

      return altText.slice(0, endSliceIndex);
    }

    const numOfNodes = publishedContent.nodes.length;

    for (let i = numOfNodes - 1; i >= numOfNodes - numOfProducts; --i) {
      const properties = publishedContent.nodes[i].properties;
      if (!properties.internalName) continue;

      if (properties.internalName.includes(sku))
        return `${properties.subtitle} '${properties.title}'`;
    }
  }

  checkIsPopular(name) {
    for (const popularKeyword of this.popularKeywords) {
      if (!name.includes(popularKeyword)) continue;

      for (const unpopularKeyword of this.unpopularKeywords) {
        if (name.includes(unpopularKeyword)) return false;
      }
      return true;
    }
    return false;
  }

  formatDateTime(dateTimeObject, country, timeZone) {
    const locale = locales[country];

    const dateFormatter = new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
      timeZone,
    });

    const timeFormatter = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
    });

    return [
      dateFormatter.format(dateTimeObject),
      timeFormatter.format(dateTimeObject).toUpperCase(),
    ];
  }

  getImageUrl(sku) {
    return `https://secure-images.nike.com/is/image/DotCom/${sku.replace(
      "-",
      "_"
    )}`;
  }
}
