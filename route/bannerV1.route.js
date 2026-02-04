import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import {
    createBannerV1,
    deleteBanner,
    deleteMultipleBanners,
    getAllBanners,
    removeImageFromCloudinary,
    updatedBanner,
    uploadImages,
    getBanner
} from "../controllers/bannerV1.controller.js";

const bannerV1Router = Router()

bannerV1Router.post('/uploadImages', auth, upload.array('images'), uploadImages);
bannerV1Router.post('/createBanner', auth, createBannerV1);
bannerV1Router.get('/getBanners', getAllBanners);
bannerV1Router.get('/getBanner/:id', getBanner);
bannerV1Router.delete('/deleteImage', auth, removeImageFromCloudinary);
bannerV1Router.delete('/deleteBanner/:id', auth, deleteBanner);
bannerV1Router.delete('/deleteMultipleBanners/', auth, deleteMultipleBanners);
bannerV1Router.put('/updateBanner/:id', auth, updatedBanner);

export default bannerV1Router; 
