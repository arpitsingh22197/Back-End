import { asyncHandler } from "../utils/asynchandler.js";
import { User } from "../models/users.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Generate access and refresh tokens
const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate tokens");
  }
};

// Register user
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  console.log("Registering user:", { fullName, email, username });
  

  if ([fullName, email, username, password].some(field => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");

  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  
  

  // Avatar & cover image logic (optional)
//   const avatarLocalPath = req.files?.avatar?.[0]?.path;
//   const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  const avatar = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null;
  const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

  const user = await User.create({
    fullName,
    
    email,
    password,
    username,
   
  }

);
  res.status(201).json(new ApiResponse(201, user, "User registered successfully"));
  console.log("User created:", user);
  

  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
});
// const registerUser = asyncHandler(async (req, res) => {
//   const { fullName, email, username, password } = req.body;

//   // Log the incoming request
//   console.log("Registering user:", { fullName, email, username });

//   // Validation
//   if ([fullName, email, username, password].some(field => !field || field.trim() === "")) {
//     throw new ApiError(400, "All fields are required");
//   }

//   // Check if user exists
//   const existedUser = await User.findOne({
//     $or: [{ email: email.trim().toLowerCase() }, { username: username.trim().toLowerCase() }]
//   });

//   if (existedUser) {
//     throw new ApiError(409, "User with email or username already exists");
//   }

//   // Optional image uploads — only if files exist
//   let avatarUrl = "";
//   let coverImageUrl = "";

//   const avatarLocalPath = req?.files?.avatar?.[0]?.path;
//   const coverImageLocalPath = req?.files?.coverImage?.[0]?.path;

//   if (avatarLocalPath) {
//     const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
//     avatarUrl = uploadedAvatar?.url || "";
//   }

//   if (coverImageLocalPath) {
//     const uploadedCover = await uploadOnCloudinary(coverImageLocalPath);
//     coverImageUrl = uploadedCover?.url || "";
//   }

//   // Create user
//  try {
//      const user = await User.create({
//        fullName: fullName.trim(),
//        email: email.trim().toLowerCase(),
//        username: username.trim().toLowerCase(),
//        password,
//        avatar: avatarUrl,
//        coverImage: coverImageUrl
//      });
//  } catch (error) {
//     console.error("Error creating user:", error);
//     throw new ApiError(500, "Something went wrong while registering the user");
//  }

//   // Exclude sensitive fields
//   const createdUser = await User.findById(user._id).select("-password -refreshToken");
//   if (!createdUser) {
//     throw new ApiError(500, "User creation failed");
//   }

//   return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
// });

// Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;

  if (!email && !username) {
    throw new ApiError(400, "Email or Username is required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000
  };

  return res.status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
});

// Logout user
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: null } }, { new: true });
  return res.status(200)
    .clearCookie("refreshToken")
    .clearCookie("accessToken")
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

// Refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);

    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(403, "Invalid refresh token");
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000
    };

    return res.status(200)
      .cookie("refreshToken", newRefreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(new ApiResponse(200, { accessToken }, "Access token refreshed successfully"));
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

// Change password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid old password");
  }

  user.password = newPassword;
  await user.save();

  return res.status(200).json(new ApiResponse(200, null, "Password changed successfully"));
});

// Get current user
const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

// Update profile
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "Full name and email are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email: email.trim().toLowerCase()
      }
    },
    { new: true, runValidators: true }
  );

  return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"));
});

// Get user channel profile
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) {
    throw new ApiError(400, "Username is required");
  }

  const channel = await User.aggregate([
    { $match: { username: username.toLowerCase() } },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscriberCount: { $size: "$subscribers" },
        channelSubscribed: { $size: "$subscribedTo" },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribedTo.subscriber"] },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscriberCount: 1,
        channelSubscribed: 1,
        isSubscribed: 1
      }
    }
  ]);

  if (channel.length === 0) {
    throw new ApiError(404, "Channel not found");
  }

  return res.status(200).json(new ApiResponse(200, channel[0], "Channel fetched successfully"));
});

// Get watch history
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner"
            }
          },
          {
            $addFields: {
              owner: { $first: "$owner" }
            }
          },
          {
            $project: {
              title: 1,
              owner: {
                fullName: 1,
                username: 1
              }
            }
          }
        ]
      }
    }
  ]);

  return res.status(200).json(new ApiResponse(200, user[0]?.watchHistory || [], "Watch history fetched successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  generateAccessTokenAndRefreshToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  getUserChannelProfile,
  getWatchHistory
};
