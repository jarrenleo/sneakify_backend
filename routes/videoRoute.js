import express from "express";
import VideoData from "../services/youtube/videoData.js";

const videoData = new VideoData();
const router = express.Router();

router.get("/", async (request, response) => {
  try {
    const { q, country } = request.query;

    if (!q || !country) throw Error("Request validation failed");

    const data = await videoData.getRelatedVideos(q, country);

    response.status(200).send(data);
  } catch (error) {
    response.status(400).send({
      message: error.message,
    });
  }
});

export default router;
