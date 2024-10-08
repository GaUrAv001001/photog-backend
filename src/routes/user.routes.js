import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  uploadImageController,
  createAlbum,
  addImageToAlbum,
  getUsersAlbum,
  getCurrentUser,
  getALlPublicImages,
  getAllUserAndAdmin,
  getAlbumById,
  deleteAlbum,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// secured routes

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router
  .route("/upload-image")
  .post(
    verifyJWT,
    authorizeRoles("admin", "superadmin"),
    upload.single("imgurl"),
    uploadImageController
  );
router.route("/create-album").post(verifyJWT, createAlbum);
router.route("/delete-album/:albumId").delete(verifyJWT, deleteAlbum);
router
  .route("/album/:albumId/images/:imageId")
  .post(verifyJWT, addImageToAlbum);
router.route("/get-album").get(verifyJWT, getUsersAlbum);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/get-public-images").get(verifyJWT, getALlPublicImages);
router.route("/getAlbum/:albumid").get(verifyJWT, getAlbumById);

// SuperAdmin Routes---------------------------------------------->

router.route("/get-user-admin-data").get(verifyJWT, authorizeRoles("superadmin"), getAllUserAndAdmin)

export default router;
