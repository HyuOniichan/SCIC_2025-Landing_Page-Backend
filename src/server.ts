import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import route from "./routes";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

const app: Express = express();
const port: string | number = process.env.PORT || "8000";
const db: string = process.env.MONGODB_URI || "";

// Middlewares
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
route(app);

// Connect to database
mongoose
  .connect(db)
  .then(() => console.log("Connected to database"))
  .catch((e) => {
    console.log("Fail to connect");
    console.log(e);
  });

// Start server
app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
