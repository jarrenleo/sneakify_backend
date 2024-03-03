import express from "express";
import GoatPrice from "../providers/goat/priceData.js";
import SNKRDunkPrice from "../providers/snkrdunk/priceData.js";
import { locales } from "../utilities/settings.js";

/** Creates an instance of the each marketplace class to interact with resale price data. */
const goat = new GoatPrice();
const snkrdunk = new SNKRDunkPrice();

const router = express.Router();

/**
 * @typedef errorMessage
 * @property {string} message - The error message.
 */

/**
 * @typedef resalePriceData
 * @property {string} marketplace - The marketplace name.
 * @property {string} lowestAsk - The product lowest ask price (Lowest selling price).
 * @property {string} lastSale - The product last sale price.
 * @property {string} fees - The marketplace commission fees.
 * @property {string} payout - The revenue a seller makes after deducting the commission fees from the lowest ask.
 * @property {string} iconUrl - The marketplace icon url.
 * @property {string} productUrl - The marketplace url to the product.
 * */

/**
 * Retrieves the price data for a given SKU and size from multiple marketplaces, filters the data by the specified country, and sends this data in the response.
 * @param {express.Request} request - Express request object which includes query parameters.
 * @param {express.Response} response - Express response object used to send back the data.
 * @param {function} next - Express next middleware function.
 * @returns {resalePriceData[]} An array of resale price data from multiple marketplaces.
 * @throws {errorMessage} Missing required query parameters or unsupported country code.
 * */
router.get("/", async (request, response, next) => {
  try {
    const { sku, size, country } = request.query;

    if (!sku || !size || !country)
      throw new Error("Missing required query parameters");
    if (!locales[country]) throw new Error("Country not supported");

    const [goatPrices, snkrdunkPrices] = await Promise.allSettled([
      goat.getPrices(sku, size, country),
      snkrdunk.getPrices(sku, size, country),
    ]);
    const data = [goatPrices.value, snkrdunkPrices.value];

    response.status(200).send(data);
  } catch (error) {
    next(error);
  }
});

export default router;
