import express from "express";
import NikeProductData from "../services/nike/productData.js";
import { locales } from "../utilities/settings.js";

const nikeProductData = new NikeProductData();
const router = express.Router();

router.get("/", async (request, response, next) => {
  try {
    const { channel, sku, country, timeZone } = request.query;

    if (!channel || !sku || !country || !timeZone)
      throw Error("Missing required query parameters");
    if (!locales[country]) throw Error("Country not supported");

    const data = await nikeProductData.getProductData(
      channel,
      sku,
      country,
      timeZone
    );

    response.status(200).send(data);
  } catch (error) {
    next(error);
  }
});

export default router;
