import express from "express";
import NikeReleaseData from "../services/nike/releaseData.js";
import { locales } from "../utilities/settings.js";
import sortBy from "lodash.sortby";
import uniqBy from "lodash.uniqby";
import groupBy from "lodash.groupby";

const nikeReleaseData = new NikeReleaseData();
const router = express.Router();

router.get("/", async (request, response, next) => {
  try {
    const { country, timeZone } = request.query;

    if (!country || !timeZone) throw Error("Missing required query parameters");
    if (!locales[country]) throw Error("Country not supported");

    const results = await Promise.allSettled([
      nikeReleaseData.getReleaseData("SNKRS Web", country, timeZone),
      nikeReleaseData.getReleaseData("Nike.com", country, timeZone),
    ]);

    // Need to add additional logic to handle rejected promises
    let data = [];

    for (const result of results) {
      if (result.status === "fulfilled") data.push(...result.value);
    }

    data = uniqBy(data, (data) => data.sku);
    data = sortBy(data, "dateTimeObject");
    data = groupBy(data, "releaseDate");

    response.status(200).send(data);
  } catch (error) {
    next(error);
  }
});

export default router;
