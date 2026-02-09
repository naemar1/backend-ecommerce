import UserModel from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'
import bcryptjs from "bcryptjs";
import sendEmailFun from "../config/sendEmail.js";
import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import VerificationEmail from './../utils/verifyEmailTemplate.js';
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from './../utils/generatedRefreshToken.js';

import cookieParser from 'cookie-parser';

let imageArr = [];
cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
});

export async function registerUserController(request, response) {
    try {
        let user;
        const { name, email, password } = request.body
        if (!name || !email || !password) {
            return response.status(400).json({
                message: "provide email,name,password",
                error: true,
                success: false
            })
        }
        // for check user alreday persent ot not
        user = await UserModel.findOne({ email: email })
        if (user) {
            return response.json({
                message: "Already user  register  with this email",
                error: true,
                success: false
            })
        }
        //Random otp gernating
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        //salt for extra secuirty
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        user = new UserModel({
            email: email,
            password: hashPassword,
            name: name,
            otp: verifyCode,
            otpExpires: Date.now() + 600000
        })

        await user.save()
        // send verification email

        await sendEmailFun({
            to: email,
            subject: "Verify email from Ecommerce App",
            text: "",
            html: VerificationEmail(name, verifyCode)
        })

        // Create Jwt token for verification process
        const token = jwt.sign(
            {
                email: user.email,
                id: user._id
            },
            process.env.JSON_WEB_TOKEN_SECRET_KEY
        );
        return response.status(200).json({
            success: true,
            error: false,
            message: "User registered successfully ! please verify your email",
            token: token
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// for verification eamil controllers
export async function verifyEmailController(request, response) {
    try {
        const { email, otp } = request.body
        const user = await UserModel.findOne({ email: email })
        if (!user) {
            return response.status(400).json({
                message: "User not found",
                error: true,
                success: false
            })
        }
        const isCodeValid = user.otp === otp;
        const isNotExpired = user.otpExpires && user.otpExpires > Date.now();


        if (isCodeValid && isNotExpired) {
            user.verify_email = true;
            user.otp = null;
            user.otpExpires = null;
            await user.save();
            return response.status(200).json({ error: false, success: true, message: "Email verified successfully" })
        } else if (!isCodeValid) {
            return response.status(400).json({ error: true, success: false, message: "Invalid OTP" })
        } else {
            return response.status(400).json({ error: true, success: false, message: "OTP expired" })//  // OTP is correct but expired
        }
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}

export async function loginUserController(request, response) {
    try {
        const { email, password } = request.body;
        const user = await UserModel.findOne({ email: email })

        if (!user) {
            return response.status(400).json({
                message: "User not register",
                error: true,
                success: false
            })
        }
        if (user.verify_email !== true) {
            return response.status(400).json({
                message: "Your email not verify yet please verify your email",
                error: true,
                success: false
            })
        }

        const checkPassword = await bcryptjs.compare(password, user.password)
        if (!checkPassword) {
            return response.status(400).json({
                message: "Check your password",
                error: true,
                success: false
            })
        }

        const accesstoken = await generatedAccessToken(user._id)
        const refreshToken = await generatedRefreshToken(user._id)

        // const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
        //      last_login_date : new Date(),
        //       access_token: accesstoken,
        //     refresh_token: refreshToken
        // })

        await UserModel.findByIdAndUpdate(user._id, {
            last_login_date: new Date(),
            access_token: accesstoken,
            refresh_token: refreshToken
        });


        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.cookie("accessToken", accesstoken, cookiesOption)
        response.cookie('refreshToken', refreshToken, cookiesOption)

        return response.json({
            message: "Login succssfully",
            error: false,
            success: true,
            data: {
                accesstoken,
                refreshToken
            }
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//logout User
export async function logoutController(request, response) {
    try {
        const userid = request.userId // auth middleware
        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }
        response.clearCookie('accesstoken', cookiesOption)
        response.clearCookie('refreshToken', cookiesOption)

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid, {
            refresh_token: "",
            access_token: ""
        })

        return response.json({
            message: "LogOut succssfully",
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: "Failed to Login",
            error: true,
            success: false
        })
    }
}

// export async function userAvatarController(request, response) {
//     try {
//         // console.log("request.files:", request.files);

//         imageArr = [];
//         const userId = request.userId;
//         const images = request.files;

//         if (!images || images.length === 0) {
//             return response.status(400).json({
//                 success: false,
//                 message: "No file uploaded"
//             });
//         }

//         const options = {
//             use_filename: true,
//             unique_filename: false,
//             overwrite: false
//         };

//         let uploadedUrl = "";

//         for (let i = 0; i < images.length; i++) {
//             try {
//                 // console.log(" Uploading file:", images[i].path);
//                 const result = await cloudinary.uploader.upload(images[i].path, options);
//                 // console.log(" Cloudinary result:", result.secure_url);
//                 uploadedUrl = result.secure_url;
//                 imageArr.push(result.secure_url);

//                 // Delete the local file after successful upload
//                 fs.unlinkSync(images[i].path);
//             } catch (error) {
//                 console.error("Cloudinary upload failed for:", images[i].filename, error);
//             }
//         }

//         //  Safe DB update
//         let updatedUser;
//         try {
//             // console.log("Updating avatar for user:", userId, "with URL:", uploadedUrl);
//             updatedUser = await UserModel.findByIdAndUpdate(
//                 userId,
//                 { avatar: uploadedUrl },
//                 { new: true }
//             );
//         } catch (dbError) {
//             console.error(" MongoDB update error:", dbError);
//             return response.status(500).json({
//                 success: false,
//                 message: "Failed to update avatar in DB",
//                 error: dbError.message
//             });
//         }

//         if (!updatedUser) {
//             return response.status(404).json({ success: false, message: "User not found" });
//         }

//         return response.status(200).json({
//             _id: userId,
//             avatar: uploadedUrl,
//             user: updatedUser
//         });

//     } catch (error) {
//         console.error(" Avatar upload error:", error);
//         return response.status(500).json({
//             message: "Failed to upload avatar",
//             error: true,
//             success: false
//         });
//     }
// }

//upload avtar
export async function userAvatarController(request, response) {
    try {
        const userId = request.userId;
        const images = request.files;

        if (!userId) return response.status(401).json({ message: "Unauthorized", error: true, success: false });
        if (!images || !images.length) return response.status(400).json({ message: "No files uploaded", error: true, success: false });

        const user = await UserModel.findById(userId);
        if (!user) return response.status(404).json({ message: "User not found", error: true, success: false });

        if (user.avatar) {
            try {
                const publicId = user.avatar.split("/upload/")[1].split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (err) {
                console.warn("Failed to remove old avatar:", err.message);
            }
        }

        const options = { use_filename: true, unique_filename: false, overwrite: false };
        const imageArr = [];

        for (const file of images) {
            try {
                const result = await cloudinary.uploader.upload(file.path, options);
                imageArr.push(result.secure_url);
                fs.unlinkSync(file.path);
            } catch (err) {
                console.error("Failed to upload file:", file.filename, err.message);
            }
        }

        if (!imageArr.length) return response.status(500).json({ message: "Failed to upload images", error: true, success: false });

        user.avatar = imageArr[0];
        await user.save();

        return response.status(200).json({ avatar: imageArr[0], success: true });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: error.message || "Failed to upload avatar", error: true, success: false });
    }
}

// image delete
export async function removeImageFromCloudinary(request, response) {
    try {
        const imgUrl = request.query.img;
        if (!imgUrl) {
            return response.status(400).json({ success: false, message: "No image URL provided" });
        }
        //https://res.cloudinary.com/dyl4jzc4t/image/upload/v1759840624/1759840621541_Screenshot_41.png
        // Extract public_id from the URL
        const urlArr = imgUrl.split("/");
        const imageName = urlArr[urlArr.length - 1].split(".")[0];

        if (!imageName) {
            return response.status(400).json({
                success: false,
                message: "Invalid image URL"
            });
        }

        // Destroy image using await (promise-based)
        const result = await cloudinary.uploader.destroy(imageName);

        return response.status(200).json({ success: true, result });
    } catch (error) {
        console.error("    Cloudinary delete error:", error);
        return response.status(500).json({ success: false, message: "Failed to delete image", error: error.message });
    }
}

// update  User Details
export async function updateUserDetails(request, response) {
    try {
        const userId = request.userId //from auth middleware
        const { name, email, mobile, password } = request.body;

        const userExist = await UserModel.findById(userId);
        if (!userExist) {
            return response.status(400).send('The user cannot be Updated !')
        }

        const updateUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                name: name,
                mobile: mobile,
                email: email,
            },
            { new: true }
        )

        if (email !== userExist.email) {
            // send verification email
            await sendEmailFun({
                sendTo: email,
                subject: "veriffy email from Ecommerce App",
                text: "",
                html: VerificationEmail(name, verifyCode)
            })
        }
        return response.json({
            message: "User Updated successfully",
            error: false,
            success: true,
            user: {
                name: updateUser?.name,
                _id: updateUser?._id,
                email: updateUser?.email,
                mobile: updateUser?.mobile,
                avatar: updateUser?.avatar
            }
        })

    } catch (error) {

        if (error.name === "ValidationError") {
            return response.status(400).json({
                message: error.message,
                success: false,
                error: true,
            });
        }

        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}

// forgot password 
export async function forgotPasswordController(request, response) {
    try {
        const { email } = request.body
        const user = await UserModel.findOne({ email: email })

        if (!user) {
            return response.status(400).json({
                message: "Email Not available",
                error: true,
                success: false
            })
        } else {

            let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

            const updateUser = await UserModel.findByIdAndUpdate(
                user?._id,
                {
                    otp: verifyCode,
                    otpExpires: Date.now() + 600000
                },)

            // send verification email
            await sendEmailFun({
                to: email,
                subject: "Verify email from Ecommerce App",
                text: "",
                html: VerificationEmail(user?.name, verifyCode)
            })
            return response.json({
                message: "Check your email",
                error: false,
                success: true
            })
        }
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function verifyForgotPasseordOtp(request, response) {
    try {
        const { email, otp } = request.body;
        const user = await UserModel.findOne({ email: email })

        if (!user) {
            return response.status(400).json({
                message: "user not avilable",
                error: true,
                success: false
            })
        }

        if (!email || !otp) {
            return response.status(400).json({
                message: "Provide required field email,otp",
                error: true,
                success: false
            })
        }


        if (otp !== user.otp) {
            return response.status(400).json({
                message: "Invalid Otp",
                error: true,
                success: false
            })
        }

        const currentTime = new Date().toISOString()
        if (user.otpExpires < currentTime) {
            return response.status(400).json({
                message: "Otp is expired",
                error: true,
                success: false
            })
        }
        user.otp = ""
        user.otpExpires = "";
        await user.save()

        return response.status(200).json({
            message: "Verify OTP successfully",
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(200).json({
            message: error.message || error,
            error: false,
            success: true
        })
    }
}

//rest password Controller
export async function resetpassword(request, response) {
    try {
        let { email, oldPassword, newPassword, confirmPassword } = request.body;
        if (!email || !newPassword || !confirmPassword) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "Provide required fields email, newPassword, confirmPassword"
            })
        }

        let user = await UserModel.findOne({ email })
        if (!user) {
            return response.status(400).json({
                message: "user/Email not avilable",
                error: true,
                success: false
            })
        }

        if (oldPassword) {
            const match = await bcryptjs.compare(oldPassword, user.password);
            if (!match) {
                return response.status(400).json({
                    message: "Old password is incorrect",
                    error: true,
                    success: false
                });
            }
        }


        if (newPassword !== confirmPassword) {
            return response.status(400).json({
                message: "newPassword and confirmPassword must be same",
                error: true,
                success: false,
            })
        }
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(newPassword, salt);
        const update = await UserModel.findByIdAndUpdate(
            user._id, {
            password: hashPassword
        }
        )

        const token = await generatedAccessToken({ _id: user._id });

        return response.json({
            message: oldPassword
                ? "Password changed successfully. Redirecting to login.."
                : "Password reset successfully. Redirecting to login..",
            success: true,
            error: false,
            token,
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }


}

// Refresh Token
export async function refreshToken(request, response) {
    try {

        const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(" ")[1] //[bearer token]

        if (!refreshToken) {
            return response.status(401).json({
                message: "Invalid token",
                error: true,
                success: false
            })
        }

        const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN)
        if (!verifyToken) {
            return response.status(401).json({
                message: "token is expired",
                error: true,
                success: false
            })
        }
        const userId = verifyToken?._id
        const newAccessToken = await generatedAccessToken(userId)
        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.cookie('accessToken', newAccessToken, cookiesOption)
        return response.json({
            message: "New Access token generated",
            error: false,
            success: true,
            date: {
                accessToken: newAccessToken
            }
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// get login user details
export async function userDetails(request, response) {
    try {
        const userId = request.userId
        const user = await UserModel.findById(userId).populate('address_details').select('-password -refresh_token')

        return response.json({
            message: "user details",
            data: user,
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: "Somethings is wrong",
            error: true,
            success: false
        })
    }
}

export const getAllUsersExceptCurrentController = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Unauthorized"
      });
    }

    const users = await UserModel.find({
      _id: { $ne: req.userId }
    })
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      error: false,
      users
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message
    });
  }
};


export const googleAuthController = async (req, res) => {
    try {
        const { name, email, googleId, avatar } = req.body;

        if (!email || !googleId) {
            return res.status(400).json({
                error: true,
                message: "Invalid Google authentication payload",
            });
        }

        let user = await UserModel.findOne({ email });

        // 🔹 Existing user
        if (user) {
            if (!user.isGoogleUser) {
                user.googleId = googleId;
                user.isGoogleUser = true;
                user.verify_email = true;
                user.avatar = avatar || user.avatar;
                user.last_login_date = new Date();
                await user.save();
            }
        }

        // 🔹 New Google user
        else {
            user = await UserModel.create({
                name,
                email,
                googleId,
                avatar,
                isGoogleUser: true,
                verify_email: true,
                status: "Active",
                last_login_date: new Date(),
            });
        }

        // 🔐 Token generation
        const accessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.SECRET_KEY_ACCESS_TOKEN,
            { expiresIn: "7d" }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.SECRET_KEY_REFRESH_TOKEN,
            { expiresIn: "30d" }
        );

        user.access_token = accessToken;
        user.refresh_token = refreshToken;
        await user.save();

        return res.status(200).json({
            error: false,
            success: true,
            message: "Google authentication successfull",
            token: accessToken,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
            },
        });

    } catch (error) {
        console.error("Google Auth Error:", error);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
};

export async function deleteMultiple(req, res) {
    try {
        console.log(req.body)
        const ids = req.body.data.ids;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "Invalid or empty product IDs"
            });
        }

        const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));

        await UserModel.deleteMany({ _id: { $in: objectIds } });

        return res.status(200).json({
            success: true,
            error: false,
            message: "Users deleted successfully"
        });

    } catch (error) {
        console.error("Bulk delete error:", error);

        return res.status(500).json({
            success: false,
            error: true,
            message: "Internal server error"
        });
    }
}

export async function getMonthlyUsers(req, res) {
    try {
        const { year } = req.query;

        /* ---- Optional Year Filter ---- */
        const matchStage = year
            ? {
                createdAt: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
            : {};

        /* ---- Aggregation ---- */
        const users = await UserModel.aggregate([
            {
                $match: matchStage
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    totalUsers: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: {
                        $concat: [
                            { $toString: "$_id.year" },
                            "-",
                            {
                                $cond: [
                                    { $lt: ["$_id.month", 10] },
                                    { $concat: ["0", { $toString: "$_id.month" }] },
                                    { $toString: "$_id.month" }
                                ]
                            }
                        ]
                    },
                    totalUsers: 1
                }
            },
            { $sort: { month: 1 } }
        ]);

        return res.status(200).json({
            success: true,
            error: false,
            data: users
        });

    } catch (error) {
        console.error("Monthly Users Error:", error.message);
        return res.status(500).json({
            success: false,
            error: true,
            message: error.message
        });
    }
}