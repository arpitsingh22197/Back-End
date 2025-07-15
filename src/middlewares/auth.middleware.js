// import { jwt } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { User } from "../models/users.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";


export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return next(new ApiError(401, "Access token is required"));
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user =    await User.findById(decodedToken?.__Id).select("-password -refreshToken")
    if (!user) {
        return next(new ApiError(404, "User not found"))};

        req.user = user;
        next();
    } catch (error) {
            throw new ApiError(401, "Invalid access token");
    }

})