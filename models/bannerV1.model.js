import mongoose from "mongoose";

const bannerV1Schema = new mongoose.Schema(

    {
        BannerTitle: {
            type: String,
            default: "",
            required: true
        },

        catId: {
            type: String,
            default: "",
            required: true
        },

        alignInfo: {
            type: String,
            default: "left",
        },

        subCatId: {
            type: String,
            default: "",
            required: false
        },

        thirdsubCatId: {
            type: String,
            default: "",
            required: false
        },

        price: {
            type: Number,
            default: "",
            required: true
        },

        images: [
            {
                type: String,
                required: true
            }
        ],

    },

    { timestamps: true }

);

const BannerV1Model = mongoose.model("bannerV1", bannerV1Schema);

export default BannerV1Model;