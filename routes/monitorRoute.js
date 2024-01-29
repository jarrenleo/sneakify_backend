import express from "express";
import NikeMonitorData from "../services/nike/monitorData.js";
import { locales } from "../utilities/settings.js";
import orderBy from "lodash.orderby";

const nikeMonitorData = new NikeMonitorData();
const router = express.Router();

router.get("/", async (request, response, next) => {
  try {
    const { country, timeZone } = request.query;

    if (!country || !timeZone) throw Error("Missing required query parameters");
    if (!locales[country]) throw Error("Country not supported");

    const results = await Promise.allSettled([
      nikeMonitorData.getMonitorData("SNKRS Web", country, timeZone),
      nikeMonitorData.getMonitorData("Nike.com", country, timeZone),
    ]);

    // Add logic to handle rejected promises
    let data = [];

    for (const result of results) {
      if (result.status === "fulfilled") data.push(...result.value);
    }

    data = orderBy(data, ["dateTimeObject"], ["desc"]);

    response.status(200).send(data);
  } catch (error) {
    next(error);
  }
});

export default router;
