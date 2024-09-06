import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { Image } from "../models/image.mode.js";
import { Album } from "../models/album.model.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get users details from frontend
  // validatioin - not empty
  // check if user already exists: username, email
  // check for images,
  // upload them to cloudinary, image
  // create user object - create entry in db
  // remove password and refresh token field from reponse
  // check for user creation
  // return res

  const { username, fullname, email, password } = req.body;
  //   console.log("email: ", email);

  if (
    [username, fullname, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "user with email or username already exists");
  }

  //   const avatarLocalPath = req.files?.avatar[0]?.path;

  let avatarLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files.avatar[0].path;
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  //   if(!avatar){
  //     throw new ApiError(400, "Avatar file is required")
  //   }

  const user = await User.create({
    fullname,
    avatar: avatar?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username, email
  // find the user
  // password check
  // access and refresh token
  // send cookie

  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "username or password is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user does not exists");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          role: user.role,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incommingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRETE
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incommingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("newRefreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const uploadImageController = asyncHandler(async (req, res) => {
  // console.log("req.file: ",req.file); 
  const { title, description } = req.body;

  let Img;
  if (req.file) {
    Img = req.file.path;
    // console.log("Img: ",Img)
  } else {
    throw new ApiError(400, "No image file uploaded");
  }

  const imageUrl = await uploadOnCloudinary(Img);

  if (!imageUrl) {
    throw new ApiError(500, "Failed to upload image");
  }

  const image = await Image.create({
    title,
    imgurl: imageUrl?.url,
    description,
    uploadedBy: req.user._id,
    isPublic: false,
  });

  return res.status(201).json(new ApiResponse(201, image, "Image uploaded successfully"));
});

const createAlbum = asyncHandler(async (req, res)=>{
  console.log("req.body: ", req.body)
  const {name, createdBy} = req.body;

  if(!name){
    throw new ApiError(400, "Album name is required");
  }

  if(!createdBy){
    throw new ApiError(400, "createdBy is required");
  }

  const album = await Album.create({
    name,
    createdBy,
  })

  return res
  .status(201)
  .json(new ApiResponse(201, album, "Album is created successfully"))
  
})

const addImageToAlbum = asyncHandler(async (req, res)=>{
  const {albumId, imageId} = req.params;

  const album = await Album.findById(albumId);

  if(!album){
    throw new ApiError(404, "Album not found");
  }

  const image = await Image.findOne({
    _id:imageId,
    isPublic:true,
  });

  if(!image){
    throw new ApiError(404, "Image not found");
  }

  album.images.push(image._id);
  await album.save();

  return res
  .status(200)
  .json(new ApiResponse(200, album, "Image added to album successfully"));

})


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  uploadImageController,
  createAlbum,
  addImageToAlbum,
};
