import express from "express";
import ReleaseData from "../services/nike/releaseData.js";

const releaseData = new ReleaseData();
const router = express.Router();

router.get("/", async (request, response) => {
  try {
    const { country, locale } = request.query;

    if (!country || !locale) throw Error("Missing query parameter");

    const data = await releaseData.getReleaseData(country, locale);

    response.status(200).send(data);
  } catch (error) {
    if (error.message === "Missing query parameter") {
      response.status(400).send({
        message: error.message,
      });
      return;
    }

    response.status(404).send({
      message: error.message,
    });
  }
});

export default router;
