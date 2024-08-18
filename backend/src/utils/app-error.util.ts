import ErrorCode from "../constants/error-code.constant";
import { HttpStatusCode } from "../constants/http-code.constant";

class AppError extends Error {
  constructor(
    public statusCode: HttpStatusCode,
    public message: string,
    public errorCode?: ErrorCode
  ) {
    super(message);
  }
}

export default AppError;
