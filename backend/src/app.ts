import cors from "cors";
import morgan from "morgan";
import express, { RequestHandler } from "express";
import cookieParser from "cookie-parser";

import awsRoute from "./routes/aws.route";
import authRoute from "./routes/auth.route";
import statsRoute from "./routes/stats.route";
import cookieRoute from "./routes/cookie.route";
import networkRoute from "./routes/network.route";
import playbackRoute from "./routes/playback.route";
import verificationRoute from "./routes/verification.route";

import userRoute from "./routes/user.route";
import songRoute from "./routes/song.route";
import labelRoute from "./routes/label.route";
import albumRoute from "./routes/album.route";
import musicianRoute from "./routes/musician.route";
import playlistRoute from "./routes/playlist.route";
import notificationRoute from "./routes/notification.route";
import homepageRoute from "./routes/homepage.route";
import sessionRoute from "./routes/session.route";
import searchRoute from "./routes/search.route";
import ratingRoute from "./routes/rating.route";
import adminRoute from "./routes/admin.route";

import authenticate from "./middlewares/authenticate.middleware";
import errorHandler from "./middlewares/error-handler.middleware";
import firebaseInitialize from "./middlewares/firebase.middleware";
import { adminApiKeyValidate } from "./middlewares/api-key.middleware";

import { API_ENDPOINTS } from "@joytify/types/constants";
import { NODE_ENV, ORIGIN_APP } from "./constants/env-validate.constant";

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

const createVersionedRoute = (version: string) => {
  return (path: string, ...middlewares: RequestHandler[]) => {
    const route = NODE_ENV === "development" ? path : `/api/${version}${path}`;

    return app.use(route, ...middlewares);
  };
};

const v1ApiRoute = createVersionedRoute("v1");

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

// health check
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Healthy" });
});

// api routes
v1ApiRoute(AUTH, authRoute);
v1ApiRoute(AWS, awsRoute);
v1ApiRoute(COOKIE, cookieRoute);
v1ApiRoute(NETWORK, networkRoute);
v1ApiRoute(PLAYBACK, authenticate, playbackRoute);
v1ApiRoute(VERIFICATION, verificationRoute);
v1ApiRoute(STATS, statsRoute);

v1ApiRoute(USERS, userRoute);
v1ApiRoute(SONGS, songRoute);
v1ApiRoute(PLAYLISTS, playlistRoute);
v1ApiRoute(LABELS, labelRoute);
v1ApiRoute(ALBUMS, albumRoute);
v1ApiRoute(MUSICIANS, musicianRoute);
v1ApiRoute(NOTIFICATIONS, notificationRoute);
v1ApiRoute(SESSIONS, authenticate, sessionRoute);
v1ApiRoute(RATINGS, authenticate, ratingRoute);
v1ApiRoute(SEARCHES, searchRoute);
v1ApiRoute(HOMEPAGE, homepageRoute);

v1ApiRoute(ADMIN, adminApiKeyValidate, adminRoute);

// error handler
app.use(errorHandler());

export default app;
