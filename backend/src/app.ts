import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import authRoute from "./routes/auth.route";
import userRoute from "./routes/user.route";
import awsRoute from "./routes/aws.route";
import songRoute from "./routes/song.route";

import authenticate from "./middlewares/authenticate.middleware";
import firebaseInitialize from "./middlewares/firebase.middleware";
import errorHandler from "./middlewares/error-handler.middleware";

import { ORIGIN_APP } from "./constants/env-validate.constant";
import playlistRoute from "./routes/playlist.route";

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
app.use(firebaseInitialize());

// routes
app.use("/auth", authRoute);
app.use("/user", authenticate, userRoute);
app.use("/aws", awsRoute);
app.use("/song", authenticate, songRoute);
app.use("/playlist", authenticate, playlistRoute);

// error handler
app.use(errorHandler());

export default app;
