import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
const errorHandler = (err, req, res, next) => {
    let error = err;
    if(!(error instanceof ApiError)) {
        error = new ApiError(
            error.statusCode || 500,
            error.message || "Internal Server Error"
        );
    }
    const message = error.message;
    error = new ApiError(
        error.statusCode,
        message
    || [] ,err.stack   );
}
export {errorHandler}; 