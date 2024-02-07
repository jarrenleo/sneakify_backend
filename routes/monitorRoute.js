import express from "express";
import NikeMonitorData from "../services/nike/monitorData.js";
import { locales } from "../utilities/settings.js";
import orderBy from "lodash.orderby";

const nikeMonitorData = new NikeMonitorData();
const router = express.Router();

router.get("/", async (request, response, next) => {
  try {
    const { country, timeZone } = request.query;

    if (!country || !timeZone)
      throw new Error("Missing required query parameters");
    if (!locales[country]) throw new Error("Country not supported");

    let data = await nikeMonitorData.getMonitorData(
      "Nike.com",
      country,
      timeZone
    );

    data = orderBy(data, ["dateTimeObject"], ["desc"]);

    response.status(200).send(data);
  } catch (error) {
    next(error);
  }
});

export default router;
