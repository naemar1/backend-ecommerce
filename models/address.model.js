import mongoose from "mongoose";

// Address Schema
const addressSchema = new mongoose.Schema(
    {

        address_line1: {
            type: String,
            default: ""
        },

        // City name
        city: {
            type: String,
            required: [true, "City is required"],
            trim: true,
        },

        // State name
        state: {
            type: String,
            required: [true, "State is required"],
            trim: true,
        },
        // Pincode / Postal Code
        pincode: {
            type: String,
            required: [true, "Pincode is required"],
            // match: [/^\d{6}$/, "Pincode must be 6 digits"], // Indian standard validation
        },

        // Country (default India, can be changed)
        country: {
            type: String,
            default: "India",
            trim: true,
        },
        // Mobile number for delivery
        mobile: {
            type: String,
            required: [true, "Mobile number is required"],
            match: [/^\+91\d{10}$/, "Invalid mobile number"],
        },

        status: {
            type: Boolean,
            default: true
        },

        selected: {
            type: Boolean,
        },
        
        landmark: {
            type: String,
            default: false
        },

        addressType: {
            type: String,
            enum: ["Home", "Office",],
        },

        userId: {
            type: mongoose.Schema.ObjectId,
            default: ""
        }

    },
    { timestamps: true } // createdAt & updatedAt
);

// Address model
const AddressModel = mongoose.model("address", addressSchema);

export default AddressModel;