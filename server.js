import express from "express";
import releasesRouter from "./routes/releasesRoute.js";
import sneakerRouter from "./routes/sneakerRoute.js";

const app = express();
const port = 8888;

app.use("/releases", releasesRouter);
app.use("/sneaker", sneakerRouter);

app.listen(port, () => console.log(`Server running on port: ${port}`));
