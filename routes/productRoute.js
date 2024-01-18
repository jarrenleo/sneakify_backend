import express from "express";

const router = express.Router();

router.get("/", async (request, response) => {
  response.status(200).send("This is the product route");
});

export default router;
