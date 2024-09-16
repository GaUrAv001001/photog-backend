import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log("Token from cookies: ", req.cookies?.accessToken); // For debugging
    // console.log("Token from header: ", req.header("Authorization")); // For debugging
    // console.log("Extracted Token: ", token); // For debugging

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE);
    console.log("Decoded Token:", decodedToken);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

// export const verifyJWT = asyncHandler(async (req, res, next) => {
//     try {
//       const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
//       console.log('Token:', token); // Log token to see if it's being received

//       if (!token) {
//         throw new ApiError(401, "Unauthorized request");
//       }

//       const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//       console.log('Decoded Token:', decodedToken); // Log decoded token

//       const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
//       if (!user) {
//         throw new ApiError(401, "Invalid access token");
//       }

//       req.user = user;
//       next();
//     } catch (error) {
//       console.error("JWT verification error:", error);
//       throw new ApiError(401, error?.message || "Invalid access token");
//     }
//   });
