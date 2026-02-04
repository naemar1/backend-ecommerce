import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import { createCategory, deleteCategory, getAllCategory, getCategoriesCount, getCategory, getSubCategoriesCount, removeImageFromCloudinary, updatedCategory, uploadImages } from "../controllers/category.controller.js";

const categoryRouter = Router()

categoryRouter.post('/uploadImages', auth, upload.array('images'), uploadImages);
categoryRouter.post('/create', auth, createCategory);
categoryRouter.get('/', getAllCategory);
categoryRouter.get('/get/count', getCategoriesCount);
categoryRouter.get('/get/count/subCat', getSubCategoriesCount);
categoryRouter.delete('/deleteImage', auth, removeImageFromCloudinary);
categoryRouter.delete('/:id', auth, deleteCategory);
categoryRouter.get('/:id', getCategory);
categoryRouter.put('/update/:id', auth, updatedCategory);

export default categoryRouter; 