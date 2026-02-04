import { Router } from "express";
import {
    forgotPasswordController,
    getAllUsersExceptCurrentController,
    googleAuthController,
    loginUserController,
    logoutController,
    refreshToken,
    registerUserController,
    removeImageFromCloudinary,
    resetpassword,
    updateUserDetails,
    userAvatarController,
    userDetails,
    verifyEmailController,
    verifyForgotPasseordOtp,
    getMonthlyUsers
} from "../controllers/user.controller.js";

import {
    addReview,
    getReviews,
    getAllReviews,
    deleteReview,
    updateReview
} from "../controllers/review.controller.js";

import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import { deleteMultiple } from "../controllers/user.controller.js";

const userRouter = Router();

/* ============================
   File Upload & Avatar Routes
===============================*/
userRouter.put("/user-avatar", auth, upload.array("avatar"), userAvatarController);
userRouter.delete("/deleteImage", auth, removeImageFromCloudinary);

/* ============================
   Authentication & User Routes
===============================*/
userRouter.post("/register", registerUserController);
userRouter.post("/google-auth", googleAuthController);
userRouter.post("/verifyEmail", verifyEmailController);
userRouter.post("/login", loginUserController);
userRouter.post("/logout", auth, logoutController);
userRouter.post("/refresh-token", auth, refreshToken);

/* ============================
   Password / OTP Routes
===============================*/
userRouter.post("/forgot-password", forgotPasswordController);
userRouter.post("/verify-forgot-password-otp", verifyForgotPasseordOtp);
userRouter.post("/reset-password", resetpassword);

/* ============================
   User Details & Management
===============================*/
userRouter.get("/user-details", auth, userDetails);
userRouter.get("/monthly-users", auth, getMonthlyUsers);
userRouter.get("/allUsers", auth, getAllUsersExceptCurrentController);

// Update user route - explicit path to avoid conflicts
userRouter.put("/update-user/:id", auth, updateUserDetails);

/* ============================
   Review Routes
===============================*/
userRouter.post("/add-reviews", auth, addReview); // add review
userRouter.get("/get-reviews", auth, getReviews); // get reviews by productId
userRouter.get("/reviews/all", auth, getAllReviews); // admin / internal use
userRouter.delete("/delete-review/:id", auth, deleteReview);
userRouter.put("/update-review/:id", auth, updateReview);

userRouter.delete('/deleteMultiple',deleteMultiple);


export default userRouter;
