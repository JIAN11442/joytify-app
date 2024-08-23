import { Router } from "express";
import { getAwsSignedUrl } from "../controllers/aws.controller";

const awsRoute = Router();

// prefix: /aws
awsRoute.post("/get-signed-url", getAwsSignedUrl);

export default awsRoute;
