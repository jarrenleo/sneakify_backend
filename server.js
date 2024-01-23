import express from "express";
import cors from "cors";
import releasesRouter from "./routes/releasesRoute.js";
import productRouter from "./routes/productRoute.js";

const app = express();
const port = 8888;

app.use(cors());

app.use("/releases", releasesRouter);
app.use("/product", productRouter);

app.get("/", (request, response) => {
  response.status(200).send({ message: "Welcome to the Sneakify API" });
});

app.listen(port, () => console.log(`Server running on port: ${port}`));
