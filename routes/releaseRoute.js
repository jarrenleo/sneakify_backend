import express from "express";
import NikeReleaseData from "../services/nike/releaseData.js";
import { locales } from "../utilities/settings.js";
import sortBy from "lodash.sortby";
import uniqBy from "lodash.uniqby";

const nikeReleaseData = new NikeReleaseData();
const router = express.Router();

router.get("/", async (request, response, next) => {
  try {
    const { country, timeZone } = request.query;

    if (!country || !timeZone)
      throw new Error("Missing required query parameters");
    if (!locales[country]) throw new Error("Country not supported");

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

    response.status(200).send(data);
  } catch (error) {
    next(error);
  }
});

export default router;
