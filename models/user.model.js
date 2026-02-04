import mongoose from "mongoose";

// Define User Schema
const userSchema = new mongoose.Schema(
    {
        // Full name of the user
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true, // Removes spaces before/after
            minlength: [2, "Name must be at least 2 characters long"],
            maxlength: [50, "Name cannot exceed 50 characters"],
        },

        // Unique email address of the user
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\S+@\S+\.\S+$/,
                "Please provide a valid email address",
            ], // Email regex validation
        },

        // Hashed password (never store plain text)
        password: {
            type: String,
            required: function () {
                return !this.isGoogleUser;
            },
            minlength: [4, "Password must be at least 4 characters"],
        },

        // Profile picture of the user
        avatar: {
            type: String,
            default: "",
        },

        // Mobile number (optional, but validated if provided)
        mobile: {
            type: String,
            default: null,
            match: [/^\+91\d{10}$/, "Invalid mobile number"], // Indian 10-digit validation
        },

        // Whether email is verified
        verify_email: {
            type: Boolean,
            default: false,
        },

        googleId: {
            type: String,
            default: null,
        },

        isGoogleUser: {
            type: Boolean,
            default: false,
        },

        access_token: {
            type: String,
            default: ""
        },

        refresh_token: {
            type: String,
            default: ''
        },

        // Last login date of the user
        last_login_date: {
            type: Date,
            default: null,
        },

        // Account status
        status: {
            type: String,
            enum: ["Active", "Inactive", "Suspended"],
            default: "Active",
        },

        // Linked addresses
        address_details: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "address",
            },
        ],

        // Items in shopping cart
        shopping_cart: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "cartProduct",
            },
        ],

        // Order history
        orderHistory: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "order",
            },
        ],

        // // OTP for forgot password
        // forgot_password_otp: {
        //     type: String,
        //     default: null,
        // },

        // // OTP expiry time
        // forgot_password_expiry: {
        //     type: Date,
        //     default: null,
        // },

        // Role of user
        otp: {
            type: String
        },

        otpExpires: {
            type: Date
        },

        role: {
            type: String,
            enum: ["ADMIN", "USER"],
            default: "USER",
        },
        
    },
    { timestamps: true } // Adds createdAt & updatedAt automatically
);

// Create User model
const UserModel = mongoose.model("User", userSchema);

export default UserModel;