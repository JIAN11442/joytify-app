import aws from "aws-sdk";
import {
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "../constants/env-validate.constant";

const s3 = new aws.S3({
  region: AWS_REGION,
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
});

export default s3;
