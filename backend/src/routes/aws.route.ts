import { Router } from "express";
import { deleteAwsFileUrlHandler, getAwsSignedUrlHandler } from "../controllers/aws.controller";

const awsRoute = Router();

// prefix: /aws
awsRoute.post("/signed-url", getAwsSignedUrlHandler);
awsRoute.delete("/file-url", deleteAwsFileUrlHandler);

export default awsRoute;
