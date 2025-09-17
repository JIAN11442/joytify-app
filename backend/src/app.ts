import cors from "cors";
import morgan from "morgan";
import express from "express";
import cookieParser from "cookie-parser";

import awsRoute from "./routes/aws.route";
import authRoute from "./routes/auth.route";
import cookieRoute from "./routes/cookie.route";
import networkRoute from "./routes/network.route";
import playbackRoute from "./routes/playback.route";
import verificationRoute from "./routes/verification.route";
import statsRoute from "./routes/stats.route";

import userRoute from "./routes/user.route";
import songRoute from "./routes/song.route";
import labelRoute from "./routes/label.route";
import albumRoute from "./routes/album.route";
import playlistRoute from "./routes/playlist.route";
import musicianRoute from "./routes/musician.route";
import notificationRoute from "./routes/notification.route";
import homepageRoute from "./routes/homepage.route";
import sessionRoute from "./routes/session.route";
import ratingRoute from "./routes/rating.route";
import searchRoute from "./routes/search.route";
import adminRoute from "./routes/admin.route";

import authenticate from "./middlewares/authenticate.middleware";
import firebaseInitialize from "./middlewares/firebase.middleware";
import errorHandler from "./middlewares/error-handler.middleware";

import { API_ENDPOINTS } from "@joytify/types/constants";
import { NODE_ENV, ORIGIN_APP } from "./constants/env-validate.constant";
import { adminApiKeyValidate } from "./middlewares/api-key.middleware";

const {
  AUTH,
  AWS,
  COOKIE,
  NETWORK,
  PLAYBACK,
  VERIFICATION,
  STATS,
  USERS,
  SONGS,
  PLAYLISTS,
  LABELS,
  ALBUMS,
  MUSICIANS,
  NOTIFICATIONS,
  SESSIONS,
  RATINGS,
  SEARCHES,
  HOMEPAGE,
  ADMIN,
} = API_ENDPOINTS;

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
app.use(AUTH, authRoute);
app.use(AWS, awsRoute);
app.use(COOKIE, cookieRoute);
app.use(NETWORK, networkRoute);
app.use(PLAYBACK, authenticate, playbackRoute);
app.use(VERIFICATION, verificationRoute);
app.use(STATS, statsRoute);

app.use(USERS, userRoute);
app.use(SONGS, songRoute);
app.use(PLAYLISTS, playlistRoute);
app.use(LABELS, labelRoute);
app.use(ALBUMS, albumRoute);
app.use(MUSICIANS, musicianRoute);
app.use(NOTIFICATIONS, notificationRoute);
app.use(SESSIONS, authenticate, sessionRoute);
app.use(RATINGS, authenticate, ratingRoute);
app.use(SEARCHES, searchRoute);
app.use(HOMEPAGE, homepageRoute);

app.use(ADMIN, adminApiKeyValidate, adminRoute);

// error handler
app.use(errorHandler());

export default app;
