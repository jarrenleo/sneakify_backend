import express from "express";
import NikeReleaseData from "../services/nike/releaseData.js";
import groupBy from "lodash.groupby";
import sortBy from "lodash.sortby";

const nikeReleaseData = new NikeReleaseData();
const router = express.Router();

router.get("/", async (request, response) => {
  try {
    const { country, locale } = request.query;

    if (!country || !locale) throw Error("Request validation failed");

    const [snkrsData, webstoreData] = await Promise.allSettled([
      nikeReleaseData.getReleaseData(country, "SNKRS Web", locale),
      nikeReleaseData.getReleaseData(country, "Nike.com", locale),
    ]);

    let data = [...snkrsData.value, ...webstoreData.value];
    data = sortBy(data, "unixTime");
    data = groupBy(data, "date");

    response.status(200).send(data);
  } catch (error) {
    if (error.message === "Request validation failed") {
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
