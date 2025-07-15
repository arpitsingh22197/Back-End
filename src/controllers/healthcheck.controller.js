import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
const healthCheck = asyncHandler(async (req, res) => {
    const response = new ApiResponse(200, null, "Server is running");
    res.status(response.statusCode).json(response);
});
export { healthCheck };