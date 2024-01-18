import express from "express";
import releasesRouter from "./routes/releasesRoute.js";
import productRouter from "./routes/productRoute.js";

const app = express();
const port = 8888;

app.use("/releases", releasesRouter);
app.use("/product", productRouter);

app.get("/", (request, response) => {
  response.status(200).send({ message: "This is the Sneakify API" });
});

app.listen(port, () => console.log(`Server running on port: ${port}`));
