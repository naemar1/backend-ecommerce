import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import {
    createBlog,
    deleteBlog,
    getBlogs,
    getBlog,
    removeImageFromCloudinary,
    updatedBlog,
    uploadImages,
    deleteMultipleBlog
} from "../controllers/blog.controller.js";

const blogRouter = Router()

blogRouter.post('/uploadImages', auth, upload.array('images'), uploadImages);
blogRouter.post('/create', auth, createBlog);
blogRouter.get('/getBlogs', getBlogs);
blogRouter.get('/get/:id', getBlog);
blogRouter.delete('/deleteImage', auth, removeImageFromCloudinary);
blogRouter.delete('/deleteMultiple', deleteMultipleBlog);
blogRouter.delete('/delete/:id', auth, deleteBlog);
blogRouter.put('/update/:id', auth, updatedBlog);

export default blogRouter; 