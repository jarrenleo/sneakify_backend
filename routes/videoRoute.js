import express from "express";
import VideoData from "../services/youtube/videoData.js";
import { locales } from "../utilities/settings.js";

const videoData = new VideoData();
const router = express.Router();

router.get("/", async (request, response, next) => {
  try {
    const { q, country } = request.query;

    if (!q || !country) throw Error("Missing required query parameters");
    if (!locales[country]) throw Error("Country not supported");

    const data = await videoData.getRelavantVideoIds(q, country);

    response.status(200).send(data);
  } catch (error) {
    next(error);
  }
});

export default router;
