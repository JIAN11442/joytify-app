import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoute from "./routes/auth.route";
import userRoute from "./routes/user.route";
import awsRoute from "./routes/aws.route";
import songRoute from "./routes/song.route";
import playlistRoute from "./routes/playlist.route";
import labelRoute from "./routes/label.route";
import musicianRoute from "./routes/musician.route";
import albumRoute from "./routes/album.route";
import playbackRoute from "./routes/playback.route";

import authenticate from "./middlewares/authenticate.middleware";
import firebaseInitialize from "./middlewares/firebase.middleware";
import errorHandler from "./middlewares/error-handler.middleware";

import { NODE_ENV, ORIGIN_APP } from "./constants/env-validate.constant";
import verificationCodeRoute from "./routes/verification-code.route";

const app = express();

// middlewares
app.use(express.json());
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));
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
app.use("/verification-code", verificationCodeRoute);
app.use("/auth", authRoute);
app.use("/user", authenticate, userRoute);
app.use("/aws", awsRoute);
app.use("/song", songRoute);
app.use("/playlist", authenticate, playlistRoute);
app.use("/label", authenticate, labelRoute);
app.use("/musician", authenticate, musicianRoute);
app.use("/album", authenticate, albumRoute);
app.use("/playback", authenticate, playbackRoute);

// error handler
app.use(errorHandler());

export default app;
