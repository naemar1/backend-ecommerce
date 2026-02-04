import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        userName: {
            type: String,
            required: true
        },

        userImage: {
            type: String,
            default: ""
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        comment: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

reviewSchema.index(
    { productId: 1, userId: 1 },
    { unique: true }
);

const ReviewModel = mongoose.model("Review", reviewSchema);

export default ReviewModel;
