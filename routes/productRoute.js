import express from "express";
import NikeProductData from "../providers/nike/productData.js";
import { locales } from "../utilities/settings.js";

/** Creates an instance of the NikeProductData class to interact with Nike product data. */
const nikeProductData = new NikeProductData();
const router = express.Router();

/**
 * @typedef errorMessage
 * @property {string} message - The error message.
 */

/**
 * @typedef productData
 * @property {string} name - The product name.
 * @property {string} colour - The product colour.
 * @property {string} description - The product description.
 * @property {string} releaseDate - The product release date.
 * @property {string} releaseTime - The product release time.
 * @property {string} sku - The product stock keeping unit.
 * @property {string} retailPrice - The product retail price.
 * @property {string} currentPrice - The product current price after discounts if any.
 * @property {string} discountRate - The product discount rate in percentage.
 * @property {string} method - The product release method.
 * @property {string} quantity - The maximum quantity allowed in a cart.
 * @property {{size: string, stockLevel: string}[]} sizesAndStockLevels - The available product sizes and stock levels
 * @property {string} productUrl - The product url to purchase the product.
 * @property {string} imageUrl - The product image url.
 */

/**
 * Route handler to get product data from Nike.
 * @param {express.Request} request - Express request object which includes query parameters.
 * @param {express.Response} response - Express response object used to send back the data.
 * @param {function} next - Express next middleware function.
 * @returns {productData} The product data object.
 * @throws {errorMessage} Missing required query parameters or unsupported country code.
 */
router.get("/", async (request, response, next) => {
  try {
    const { channel, sku, country, timeZone } = request.query;

    if (!channel || !sku || !country || !timeZone)
      throw new Error("Missing required query parameters");
    if (!locales[country]) throw new Error("Country not supported");

    const data = await nikeProductData.getProductData(
      channel,
      sku,
      country,
      timeZone
    );

    response.status(200).send(data);
  } catch (error) {
    next(error);
  }
});

export default router;
