import express from "express";

const router = express.Router();

router.get("/", async (request, response) => {
  response.status(200).send("This is the sneaker route");
});

export default router;
