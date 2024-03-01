import express from "express";
import NikeReleaseData from "../services/nike/releaseData.js";
import { locales } from "../utilities/settings.js";
import orderBy from "lodash.orderby";
import uniqBy from "lodash.uniqby";

/** Creates an instance of the NikeReleaseData class to interact with Nike release data. */
const nikeReleaseData = new NikeReleaseData();
const router = express.Router();

/**
 * @typedef errorMessage
 * @property {string} message - The error message.
 */

/**
 * @typedef releaseData
 * @property {string} uuid - The product unique identifier.
 * @property {string} channel - The product channel.
 * @property {string} name - The product name.
 * @property {boolean} isPopular - Indicate if a product is popular
 * @property {string} sku - The product stock keeping unit.
 * @property {string} price - The product price.
 * @property {string} releaseDate - The product release date.
 * @property {string} releaseTime - The product release time.
 * @property {Date} dateTimeObject - The product release date and time object.
 * @property {string} imageUrl - The product image url.
 */

/**
 * Retrieves and aggregates release data from multiple channels, deduplicates them by SKU, sorts them by the dateTimeObject in ascending order and sends it in the response.
 * @param {express.Request} request - Express request object which includes query parameters.
 * @param {express.Response} response - Express response object used to send back the data.
 * @param {function} next - Express next middleware function.
 * @returns {releaseData[]} An array of release data, deduplicated and sorted.
 * @throws {errorMessage} Missing required query parameters or unsupported country code.
 */
router.get("/", async (request, response, next) => {
  try {
    const { country, timeZone } = request.query;

    if (!country || !timeZone)
      throw new Error("Missing required query parameters");
    if (!locales[country]) throw new Error("Country not supported");

    const results = await Promise.allSettled([
      nikeReleaseData.getReleaseData("SNKRS Web", country, timeZone),
      nikeReleaseData.getReleaseData("Nike.com", country, timeZone),
    ]);

    let data = [];

    for (const result of results) {
      if (result.status === "fulfilled") data.push(...result.value);
    }

    data = uniqBy(data, (data) => data.sku);
    data = orderBy(data, ["dateTimeObject"]);

    response.status(200).send(data);
  } catch (error) {
    next(error);
  }
});

export default router;
