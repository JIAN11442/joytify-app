import assert from "node:assert";
import { AppError } from "@joytify/shared-types/classes";

// Extract parameter types from AppError constructor
type AppErrorParams = ConstructorParameters<typeof AppError>;

/**
 * Custom assert function for handling errors in the application
 * @param condition - The condition to assert
 * @param params - Parameters for creating AppError
 *                - statusCode: HTTP status code for the error
 *                - message: Error message
 *                - errorCode: (Optional) Application-specific error code
 *                - firebaseUID: (Optional) For deleting user account from Firebase
 *                - awsUrl: (Optional) For deleting files from AWS S3
 */
type AppAssertParams = (condition: any, ...params: AppErrorParams) => asserts condition;

const appAssert: AppAssertParams = (condition, ...params) => {
  return assert(condition, new AppError(...params));
};

export default appAssert;
