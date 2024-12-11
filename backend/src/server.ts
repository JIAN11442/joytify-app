import "dotenv/config";
import app from "./app";
import connectMongoDB from "./config/connect-mongodb.config";
import { BACKEND_PORT, NODE_ENV } from "./constants/env-validate.constant";

const port = BACKEND_PORT;

connectMongoDB().then(async () => {
  app.listen(port, () => {
    console.log(
      `Server is running on port ${port} in ${NODE_ENV} environment.`
    );
  });
});
