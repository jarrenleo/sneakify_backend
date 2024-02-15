import express from "express";
import cors from "cors";
import releaseRouter from "./routes/releaseRoute.js";
import productRouter from "./routes/productRoute.js";
import resaleRouter from "./routes/resaleRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import monitorRouter from "./routes/monitorRoute.js";

// Create an instance of express
const app = express();
// Define the port to be used by the server
const port = 8888;

// Enable cross-origin resource sharing
app.use(cors());

/** Routes for the API */
app.use("/release", releaseRouter);
app.use("/product", productRouter);
app.use("/resale", resaleRouter);
app.use("/review", reviewRouter);
app.use("/monitor", monitorRouter);

/**
 * Error handling middleware to handle any throw errors.
 * @param {Error} error - The error object.
 * @param {express.Request} request - The express request object.
 * @param {express.Response} response - The express response object.
 * @param {Function} next - The express next middleware function
 */
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

/**
 * Base route to confirm that the API is working.
 * @param {express.Request} request - The express request object.
 * @param {express.Response} response - The express response object.
 */
app.get("/", (request, response) => {
  response.status(200).send({ message: "Welcome to the Sneakify API" });
});

/** Starts the server and listens for requests on the specified port */
app.listen(port, () => console.log(`Server running on port: ${port}`));
