import express from "express";
import NikeMonitorData from "../services/nike/monitorData.js";
import orderBy from "lodash.orderby";

const nikeMonitorData = new NikeMonitorData();
const router = express.Router();

router.get("/", async (request, response) => {
  try {
    const { country, timeZone } = request.query;

    if (!country || !timeZone) throw Error("Request validation failed");

    const results = await Promise.allSettled([
      nikeMonitorData.getMonitorData("SNKRS Web", country, timeZone),
      nikeMonitorData.getMonitorData("Nike.com", country, timeZone),
    ]);

    let data = [];

    for (const result of results) {
      if (result.status === "fulfilled") data.push(...result.value);
    }

    data = orderBy(data, ["dateTimeObject"], ["desc"]);

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
