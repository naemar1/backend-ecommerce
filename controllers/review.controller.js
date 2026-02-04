import mongoose from "mongoose";
import ReviewModel from "../models/reviews.model.js";
import ProductModel from "../models/product.modal.js";

export async function addReview(req, res) {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.userId; // from auth middleware
        const user = req.user;     // full user object from middleware

        /* ---- Validation ---- */
        if (!productId || !rating || !comment) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "All fields are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "Invalid productId"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "Rating must be between 1 and 5"
            });
        }

        /* ---- Product check ---- */
        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: true,
                message: "Product not found"
            });
        }

        /* ---- Prevent duplicate review ---- */
        const alreadyReviewed = await ReviewModel.findOne({
            productId,
            userId
        });

        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "You have already reviewed this product"
            });
        }

        /* ---- Create review ---- */
        const review = await ReviewModel.create({
            productId,
            userId,
            userName: user.name,
            userImage: user.avatar,
            rating,
            comment
        });

        /* ---- Update product rating ---- */
        const newNumReviews = (product.numReviews) + 1;
        const newRating =
            ((product.rating) * (product.numReviews) + rating) /
            newNumReviews;

        await ProductModel.findByIdAndUpdate(productId, {
            rating: Number(newRating.toFixed(1)),
            numReviews: newNumReviews
        });

        return res.status(201).json({
            success: true,
            error: false,
            review
        });

    } catch (error) {
        console.error("Add Review Error:", error.message);
        return res.status(500).json({
            success: false,
            error: true,
            message: error.message
        });
    }
}


export async function getReviews(req, res) {
    try {
        const { productId, page = 1, limit = 10 } = req.query;

        if (!productId) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "productId is required"
            });
        }

        const reviews = await ReviewModel.find({ productId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        return res.status(200).json({
            success: true,
            error: false,
            reviews
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: true,
            message: error.message
        });
    }
}

export async function getAllReviews(req, res) {
    try {
        const reviews = await ReviewModel.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            error: false,
            reviews
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: true,
            message: error.message
        });
    }
}

export const deleteReview = async (req, res) => {
    try {
        const reviewId  = req.params.id;
        const userId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "Invalid review ID"
            });
        }

        const review = await ReviewModel.findOne({ _id: reviewId, userId });

        if (!review) {
            return res.status(403).json({
                success: false,
                error: true,
                message: "Unauthorized or review not found"
            });
        }

        await review.deleteOne();

        return res.status(200).json({
            success: true,
            error: false,
            message: "Review deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: true,
            message: error.message
        });
    }
};

export const updateReview = async (req, res) => {
    try {
        const reviewId  = req.params.id;
        const { rating, comment } = req.body;
        const userId = req.userId;

        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "Rating and comment are required"
            });
        }

        const review = await ReviewModel.findOneAndUpdate(
            { _id: reviewId, userId },
            { rating, comment },
            { new: true }
        );

        if (!review) {
            return res.status(403).json({
                success: false,
                error: true,
                message: "Unauthorized or review not found"
            });
        }

        return res.status(200).json({
            success: true,
            error: false,
            review
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: true,
            message: error.message
        });
    }
};