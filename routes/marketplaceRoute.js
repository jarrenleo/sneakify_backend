import express from "express";
import StockXPrice from "../services/stockx/priceData.js";

const stockx = new StockXPrice();
const router = express.Router();

router.get("/", async (request, response) => {
  try {
    const { sku, size, country } = request.query;

    if (!sku || !size || !country) throw Error("Request validation failed");

    const results = await Promise.allSettled([
      stockx.getPrices(sku, size, country),
    ]);

    let data = [];

    for (const result of results) {
      if (result.status === "fulfilled") data.push(result.value);
    }

    response.status(200).send(data);
  } catch (error) {
    response.status(400).send({
      message: error.message,
    });
  }
});

export default router;
