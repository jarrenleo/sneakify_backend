import express from "express";
import NikeMonitorData from "../services/nike/monitorData.js";
import { locales } from "../utilities/settings.js";
import orderBy from "lodash.orderby";

/** Creates an instance of the NikeMonitorData class to interact with Nike monitor data. */
const nikeMonitorData = new NikeMonitorData();
const router = express.Router();

/**
 * @typedef errorMessage
 * @property {string} message - The error message.
 */

/**
 * @typedef monitorData
 * @property {string} uuid - The product unique identifier.
 * @property {string} channel - The product channel.
 * @property {string} name - The product name.
 * @property {string} sku - The product stock keeping unit.
 * @property {string} price - The product price.
 * @property {string} lastFetchTime - The product last updated date and time.
 * @property {Date} dateTimeObject - The product last updated date and time object.
 * @property {string} imageUrl - The product image url.
 */

/**
 * Route handler to get monitor data from Nike.
 * This endpoint sorts the data by date time in descending order and sends it in the response.
 * @param {express.Request} request - Express request object which includes query parameters.
 * @param {express.Response} response - Express response object used to send back the data.
 * @param {function} next - Express next middleware function.
 * @returns {monitorData[]} An array of monitor data objects sorted by date in descending order.
 * @throws {errorMessage} Missing required query parameters or unsupported country code.
 */
router.get("/", async (request, response, next) => {
  try {
    const { country, timeZone } = request.query;

    if (!country || !timeZone)
      throw new Error("Missing required query parameters");
    if (!locales[country]) throw new Error("Country not supported");

    let data = await nikeMonitorData.getMonitorData(
      "Nike.com",
      country,
      timeZone
    );

    data = orderBy(data, ["dateTimeObject"], ["desc"]);

    response.status(200).send(data);
  } catch (error) {
    next(error);
  }
});

export default router;
