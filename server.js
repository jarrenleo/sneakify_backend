import express from "express";
import cors from "cors";
import releaseRouter from "./routes/releaseRoute.js";
import productRouter from "./routes/productRoute.js";
import resaleRouter from "./routes/resaleRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import monitorRouter from "./routes/monitorRoute.js";

const app = express();
const port = 8888;

app.use(cors());

app.use("/release", releaseRouter);
app.use("/product", productRouter);
app.use("/resale", resaleRouter);
app.use("/review", reviewRouter);
app.use("/monitor", monitorRouter);

app.use((error, request, response, next) => {
  const errorMessage = {
    message: error.message,
  };

  if (error.message === "Missing required query parameters") {
    response.status(400).send(errorMessage);
    return;
  }

  response.status(404).send(errorMessage);
});

app.get("/", (request, response) => {
  response.status(200).send({ message: "Welcome to the Sneakify API" });
});

app.listen(port, () => console.log(`Server running on port: ${port}`));
