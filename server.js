import express from "express";
import releasesRouter from "./routes/releasesRoute.js";
import sneakerRouter from "./routes/sneakerRoute.js";

const app = express();
const port = 8888;

app.use("/releases", releasesRouter);
app.use("/sneaker", sneakerRouter);

app.get("/", (request, response) => {
  response.status(200).send({ message: "This is the Sneakify API" });
});

app.listen(port, () => console.log(`Server running on port: ${port}`));
