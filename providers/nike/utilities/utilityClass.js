import { locales } from "../../../utilities/settings.js";

/**
 * Nike utility class containing reusable methods that other Nike classes can inherit and use.
 * @class
 */
export default class UtilityClass {
  /**
   * An array of keywords that deems a sneaker popular
   * @type {string[]}
   */
  popularKeywords = [
    "Dunk Low",
    "Jordan 1 Retro",
    "Jordan 1 High",
    "Jordan 1 Low",
    "Jordan 4",
    "Kobe",
    "Travis Scott",
  ];
  /**
   * An array of keywords that deems a sneaker unpopular
   * A sneaker may have names like 'Nike Dunk Low Younger Kids'
   * We do not want to flag such sneaker variants as popular because only the adult size variants are.
   * @type {string[]}
   */
  unpopularKeywords = [
    "Younger",
    "Little",
    "Toddler",
    "Craft",
    "Disrupt",
    "CMFT",
    "Golf",
  ];
  /**
   * An array of keywords that deems a sneaker popular in japanese
   * @type {string[]}
   */
  popularKeywordsJP = [
    "ダンク LOW",
    "ジョーダン 1 レトロ",
    "ジョーダン 1 LOW",
    "ジョーダン 4",
    "コービー",
  ];
  /**
   * An array of keywords that deems a sneaker unpopular in japanese
   * @type {string[]}
   */
  unpopularKeywordsJP = ["ジュニア", "リトル", "ベビー", "ジャンボ", "ゴルフ"];
  /**
   * Nike language locale mapped to each supported country code.
   * @type {Object.<string, string>}
   * @property {string} SG - Locale for Singapore.
   * @property {string} MY - Locale for Malaysia.
   * @property {string} JP - Locale for Japan.
   * @property {string} GB - Locale for United Kingdom.
   * @property {string} NL - Locale for Netherlands
   * @property {string} AU - Locale for Australia.
   * @property {string} CA - Locale for Canada.
   * @property {string} US - Locale for United States.
   */
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

  /**
   * Extracts a name from the published content based on the provided channel, country, and SKU.
   * The function handles different cases and formats depending on the number of products and specific strings found within the content titles or node properties.
   * If the channel is not "SNKRS Web", the function returns nothing.
   * @function getName
   * @param {string} channel - The channel name, the function processes only if this is "SNKRS Web".
   * @param {string} country - The country code to handle special cases (e.g. 'JP').
   * @param {string} sku - The stock keeping unit used to identify products within titles and property names.
   * @param {Record<string, string | Object | Object[]>} publishedContent - The data to extract the sneaker name from.
   * @returns {string | undefined} The extracted product name or undefined if no applicable name found.
   */
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

  /**
   * Checks if the given name is considered popular based on a set of opinionated popular and unpopular keywords.
   * The function uses different sets of keywords depending on the country to evaluate the popularity of the name.
   * If a name contains any of the popular keywords and none of the unpopular keywords, it is deemed popular.
   * For Japan (JP), specific Japanese popular and unpopular keywords are used, otherwise, a general set is used.
   * @function checkIsPopular
   * @param {string} country - The country code to determine which set of keywords to use in the evaluation.
   * @param {string} name - The name to be checked for popularity.
   * @returns {boolean} - True if the name is popular according to the given rules; otherwise, false.
   */
  checkIsPopular(country, name) {
    const popularKeywords =
      country !== "JP" ? this.popularKeywords : this.popularKeywordsJP;
    const unpopularKeywords =
      country !== "JP" ? this.unpopularKeywords : this.unpopularKeywordsJP;

    for (const popularKeyword of popularKeywords) {
      if (!name.includes(popularKeyword)) continue;

      for (const unpopularKeyword of unpopularKeywords) {
        if (name.includes(unpopularKeyword)) return false;
      }
      return true;
    }
    return false;
  }

  /**
   * Formats a date and time object according to the locale and time zone specific to a country.
   * This function returns an array where the first element is the date formatted in a long style, and the second element is the time formatted with 2-digit hours and minutes.
   * The time string is also converted to uppercase.
   * @function formatDateTime
   * @param {Date} dateTimeObject - The date and time object that needs to be formatted.
   * @param {string} country - The country code used to determine the locale for date formatting.
   * @param {string} timeZone - The time zone that will be used for date and time formatting.
   * @returns {string[]} An array where the first element is the formatted date string and the second element is the formatted time string in uppercase.
   */
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

  /**
   * Retrieves the image URL for a given SKU from the Nike online store.
   * The SKU is modified by replacing any hyphens ("-") with underscores ("_") as per the URL naming convention for the images on the website.
   * @param {string} sku - The SKU identifier for a specific product.
   * @returns {string} A string representing the URL to the product's image on the Nike website.
   */
  getImageUrl(sku) {
    return `https://secure-images.nike.com/is/image/DotCom/${sku.replace(
      "-",
      "_"
    )}`;
  }
}
