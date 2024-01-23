export default class NikeUtility {
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
  locales = {
    SG: "en-SG",
    MY: "en-MY",
    JP: "ja-JP",
    GB: "en-GB",
    NL: "nl-NL",
    AU: "en-AU",
    CA: "en-CA",
    US: "en-US",
  };

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

    const numOfProducts = publishedContent.properties.products.length;

    if (numOfProducts === 1) {
      const altText = publishedContent.nodes.at(-1).properties.altText;
      const trimIndex = altText.indexOf("release") - 1;

      return altText.slice(0, trimIndex);
    }

    const numOfNodes = publishedContent.nodes.length;

    for (let i = numOfNodes - 1; i >= numOfNodes - numOfProducts; --i) {
      const properties = publishedContent.nodes[i].properties;

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

  getPrice(price, country, currency) {
    let locale;

    switch (country) {
      case "JP":
        locale = "ja-JP";
        break;
      case "NL":
        locale = "nl-NL";
        break;
      default:
        locale = `en-${country}`;
    }

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  }

  getImageUrl(sku) {
    return `https://secure-images.nike.com/is/image/DotCom/${sku.replace(
      "-",
      "_"
    )}`;
  }
}
