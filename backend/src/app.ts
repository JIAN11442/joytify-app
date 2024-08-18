import express from "express";
import cors from "cors";
import { ORIGIN_APP } from "./constants/env-validate.constant";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRoute from "./routes/auth.route";
import ErrorHandler from "./middlewares/error-handler.middleware";

const app = express();

// middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ORIGIN_APP,
    credentials: true,
  })
);
app.use(cookieParser());

// routes
app.use("/auth", authRoute);

// error handler
app.use(ErrorHandler);

export default app;
