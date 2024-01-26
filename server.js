import express from "express";
import cors from "cors";
import releasesRouter from "./routes/releasesRoute.js";
import productRouter from "./routes/productRoute.js";
import monitorRouter from "./routes/monitorRoute.js";
import marketplaceRouter from "./routes/marketplaceRoute.js";
import videoRouter from "./routes/videoRoute.js";

const app = express();
const port = 8888;

app.use(cors());

app.use("/releases", releasesRouter);
app.use("/product", productRouter);
app.use("/monitor", monitorRouter);
app.use("/marketplace", marketplaceRouter);
app.use("/video", videoRouter);

app.get("/", (request, response) => {
  response.status(200).send({ message: "Welcome to the Sneakify API" });
});

app.listen(port, () => console.log(`Server running on port: ${port}`));
