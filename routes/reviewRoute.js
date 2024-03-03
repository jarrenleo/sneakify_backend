import express from "express";
import ReviewData from "../providers/youtube/reviewData.js";
import { locales } from "../utilities/settings.js";

/** Creates an instance of the ReviewData class to interact with Youtube data. */
const reviewData = new ReviewData();
const router = express.Router();

/**
 * @typedef errorMessage
 * @property {string} message - The error message.
 */

/**
 * @typedef videoIdData
 * @property {string} videoId - The relevant video ID based on the search query and country.
 */

/**
 * Retrieves an array of relevant video IDs from YouTube based on a search query and country filter.
 * @param {express.Request} request - Express request object which includes query parameters.
 * @param {express.Response} response - Express response object used to send back the data.
 * @param {function} next - Express next middleware function.
 * @returns {videoIdData[]} An array of relevant video IDs.
 * @throws {errorMessage} Missing required query parameters or unsupported country code.
 */
router.get("/", async (request, response, next) => {
  try {
    const { q, country } = request.query;

    if (!q || !country) throw new Error("Missing required query parameters");
    if (!locales[country]) throw new Error("Country not supported");

    const data = await reviewData.getRelavantVideoIds(q, country);

    response.status(200).send(data);
  } catch (error) {
    next(error);
  }
});

export default router;
