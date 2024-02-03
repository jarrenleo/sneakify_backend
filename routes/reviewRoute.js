import express from "express";
import ReviewData from "../services/youtube/reviewData.js";
import { locales } from "../utilities/settings.js";

const reviewData = new ReviewData();
const router = express.Router();

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
