import BlogModel from "../models/blog.model.js";
import { v2 as cloudinary } from "cloudinary";
import { error } from "console";
import fs from 'fs';
import mongoose from "mongoose";


let imagesArr = [];

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true
});

// Upload Images
export async function uploadImages(request, response) {
    try {
        imagesArr = [];  // reset previous upload data
        const image = request.files;

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false
        }

        for (let i = 0; i < image?.length; i++) {
            try {
                const result = await cloudinary.uploader.upload(image[i].path, options);
                imagesArr.push(result.secure_url);

                // Delete local file
                fs.unlinkSync(`uploads/${request.files[i].filename}`);
            } catch (error) {
                console.error("Cloudinary upload failed for:", image[i].filename, error);
            }
        }

        return response.status(200).json({
            message: "Images uploaded successfully",
            success: true,
            error: false,
            images: imagesArr
        });

    } catch (error) {
        return response.status(500).json({
            message: "Image upload failed",
            success: false,
            error: true
        });
    }
}

// Create Blog
export async function createBlog(request, response) {
    try {

        let blog = new BlogModel({
            title: request.body.title,
            images: request.body.images,  // uses uploaded images
            description: request.body.description,
        });

        if (!blog) {
            return response.status(400).json({
                message: "Blog is not created",
                success: false,
                error: true
            });
        }

        blog = await blog.save();
        imagesArr = []; // Clear image array for next request

        return response.status(200).json({
            message: "Blog added successfully",
            success: true,
            error: false,
            blog: blog
        });

    } catch (error) {
        return response.status(500).json({
            message: "Server error while creating blog",
            success: false,
            error: true
        });
    }
}

//get all blogs
export async function getBlogs(request, response) {
    try {
        const blogs = await BlogModel.find();

        if (!blogs) {
            return response.status(400).json({
                message: "Blog is not found",
                success: false,
                error: true
            });
        }

        return response.status(200).json({
            message: "Blog fetched successfully",
            success: true,
            error: false,
            blogs: blogs
        });

    } catch (error) {
        return response.status(500).json({
            message: "Server error while creating blog",
            success: false,
            error: true
        });
    }
}

//get single blog
export async function getBlog(request, response) {
    try {
        const blog = await BlogModel.findById(request.params.id)

        if (!blog) {
            response.status(500).json({
                message: "The blog with given Id was Found",
                error: true,
                success: false,
            })
        }
        return response.status(200).json({
            success: true,
            error: false,
            blog: blog
        })
    } catch (error) {
        return response.status(500).json({
            message: "Server error while getting blog By id",
            error: true,
            success: false
        });
    }
}

//delete blog
export async function deleteBlog(request, response) {
    try {

        // Find blog
        const blog = await BlogModel.findById(request.params.id);
        if (!blog) {
            return response.status(404).json({
                message: "Blog not found",
                error: true,
                success: false
            });
        }

        // Delete images from Cloudinary
        const images = blog.images;
        for (let img of images) {
            const imageName = img.split("/").pop().split(".")[0];
            if (imageName) {
                await cloudinary.uploader.destroy(imageName);
            }
        }

        // Delete main blog
        await BlogModel.findByIdAndDelete(request.params.id);

        return response.status(200).json({
            success: true,
            error: false,
            message: "Blog deleted successfully"
        });

    } catch (error) {

        return response.status(500).json({
            message: "Server error while deleting blog",
            error: true,
            success: false
        });
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
        if (result.result) {
            return response.status(200).json({
                success: true,
                error: false,
                message: "Image deleted successfully"
            });
        } else {
            return response.status(500).json({
                error: true,
                success: false,
                message: "Failed to delete image from Cloudinary"
            });
        }
    } catch (error) {
        console.error("    Cloudinary delete error:", error);
        return response.status(500).json({ success: false, message: "Failed to delete image", error: error.message });
    }
}

// Modify Blog
export async function updatedBlog(request, response) {
    try {
        const blog = await BlogModel.findByIdAndUpdate(
            request.params.id,
            {
                title: request.body.title,
                images: request.body.images,  // uses uploaded images
                description: request.body.description,
            },
            { new: true }
        );

        if (!blog) {
            return response.status(404).json({
                message: "Blog cannot be updated",
                success: false,
                error: true
            });
        }

        // No need for imagesArr reset if not used
        imagesArr = [];

        return response.status(200).json({
            message: "Blog updated successfully",
            success: true,
            error: false,
            blog: blog
        });

    } catch (error) {
        return response.status(500).json({
            message: "Server error while updating blog",
            success: false,
            error: true
        });
    }
}

export async function deleteMultipleBlog(req, res) {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid or empty blog IDs"
      });
    }

    const blogs = await BlogModel.find({ _id: { $in: ids } });

    const cloudinaryTasks = [];

    for (const blog of blogs) {
      for (const imgUrl of blog.images || []) {
        const publicId = imgUrl.split("/").pop().split(".")[0];
        if (publicId) {
          cloudinaryTasks.push(cloudinary.uploader.destroy(publicId));
        }
      }
    }

    await Promise.allSettled(cloudinaryTasks);
    await BlogModel.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      error: false,
      message: "Blogs deleted successfully"
    });

  } catch (err) {
    console.error("Bulk delete error:", err);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Internal server error"
    });
  }
}

