import express from "express";
import StockXPrice from "../services/stockx/priceData.js";
import GoatPrice from "../services/goat/priceData.js";
import SNKRDunkPrice from "../services/snkrdunk/priceData.js";
import { locales } from "../utilities/settings.js";

const stockx = new StockXPrice();
const goat = new GoatPrice();
const snkrdunk = new SNKRDunkPrice();

const router = express.Router();

router.get("/", async (request, response, next) => {
  try {
    const { sku, size, country } = request.query;

    if (!sku || !size || !country)
      throw new Error("Missing required query parameters");
    if (!locales[country]) throw new Error("Country not supported");

    const [stockxPrices, goatPrices, snkrdunkPrices] = await Promise.allSettled(
      [
        stockx.getPrices(sku, size, country),
        goat.getPrices(sku, size, country),
        snkrdunk.getPrices(sku, size, country),
      ]
    );
    const data = [stockxPrices.value, goatPrices.value, snkrdunkPrices.value];

    response.status(200).send(data);
  } catch (error) {
    next(error);
  }
});

export default router;
