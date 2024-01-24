import express from "express";
import NikeReleaseData from "../services/nike/releaseData.js";
import sortBy from "lodash.sortby";
import uniqBy from "lodash.uniqby";
import groupBy from "lodash.groupby";

const nikeReleaseData = new NikeReleaseData();
const router = express.Router();

router.get("/", async (request, response) => {
  try {
    const { country, timeZone } = request.query;

    if (!country || !timeZone) throw Error("Request validation failed");

    const results = await Promise.allSettled([
      nikeReleaseData.getReleaseData("SNKRS Web", country, timeZone),
      nikeReleaseData.getReleaseData("Nike.com", country, timeZone),
    ]);

    let data = [];

    for (const result of results) {
      if (result.status === "fulfilled") data.push(...result.value);
    }

    data = uniqBy(data, (data) => data.sku);
    data = sortBy(data, "dateTimeObject");
    data = groupBy(data, "releaseDate");

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
