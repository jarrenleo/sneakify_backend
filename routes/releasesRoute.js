import express from "express";
import NikeReleaseData from "../services/nike/releaseData.js";
import sortBy from "lodash.sortby";

const nikeReleaseData = new NikeReleaseData();
const router = express.Router();

router.get("/", async (request, response) => {
  try {
    const { country } = request.query;

    if (!country) throw Error("Request validation failed");

    const [snkrsData, webstoreData] = await Promise.allSettled([
      nikeReleaseData.getReleaseData(country, "SNKRS Web"),
      nikeReleaseData.getReleaseData(country, "Nike.com"),
    ]);

    if (snkrsData.status === "rejected") throw Error(snkrsData.reason);
    if (webstoreData.status === "rejected") throw Error(webstoreData.reason);

    let data = [...snkrsData.value, ...webstoreData.value];
    data = sortBy(data, "unixTime");

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
