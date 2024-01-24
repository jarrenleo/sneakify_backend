import express from "express";
import NikeProductData from "../services/nike/productData.js";

const nikeProductData = new NikeProductData();
const router = express.Router();

router.get("/", async (request, response) => {
  try {
    const { channel, sku, country, timeZone } = request.query;

    if (!channel || !sku || !country || !timeZone)
      throw Error("Request validation failed");

    const data = await nikeProductData.getProductData(
      channel,
      sku,
      country,
      timeZone
    );

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
