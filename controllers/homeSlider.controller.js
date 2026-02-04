import HomeSliderModel from "../models/homeSlider.modal.js";

import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';



cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true
});

//image upload
var imagesArr = [];
export async function uploadImages(request, response) {
    try {
        let imagesArr = [];
        const images = request.files;

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        for (let i = 0; i < images?.length; i++) {

            const result = await cloudinary.uploader.upload(images[i].path, options);

            imagesArr.push(result.secure_url);

            fs.unlinkSync(`uploads/${images[i].filename}`);
        }

        return response.status(200).json({
            message: "Images uploaded successfully",
            error: false,
            success: true,
            images: imagesArr
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}



export async function addHomeSlide(request, response) {
    try {

        const imagesArr = request.body.images;
        
        let slide = new HomeSliderModel({
            images: imagesArr,
        });

        if (!slide) {
            return response.status(500).json({
                message: "slide not created",
                error: true,
                success: false
            })
        }

        slide = await slide.save();

        return response.status(200).json({
            message: "Slide created",
            error: false,
            success: true,
            slide: slide
        })
    } catch (error) {
        return response.status(500).json({
            message:  error.message || error,
            error: true,
            success: false
        })
    }
}

export async function getHomeSlides(request, response) {
    try {
        
        const slides = await HomeSliderModel.find();

        if (!slides) {
            return response.status(404).json({
                message: "slides not found",
                error: true,
                success: false 
            })
        }

        return response.status(200).json({
                error: false,
                success: true,
                data: slides
            })

    } catch (error) {
        return response.status(500).json({
            message:  error.message || error,
            error: true,
            success: false
        })
        
    }
}

export async function getSlide(request, response) {
    try {
        const slide = await HomeSliderModel.findById(request.params.id);

        if (!slide) {
            response.status(500).json({
                message: "The slide with given ID was not found",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            slide: slide
        })

    } catch (error) {
        return response.status(500).json({
            message: "Server error while getting category By id",
            error: true
        });
    }
}

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

export async function deleteSlide(request, response) {
    const slide = await HomeSliderModel.findById(request.params.id);
    const images = slide.images;
    let img="";
    for (img of images) {
        const imgUrl = img;
        const urlArr = imgUrl.split("/");
        const image = urlArr[urlArr.length - 1];

        const imageName = image.split(".")[0];

        if (imageName) {
            cloudinary.uploader.destroy(imageName, (error, result) => {
                // console.log(error, result);
            });
        }
    }
    
    const deletedSlide = await HomeSliderModel.findByIdAndDelete(request.params.id);
    if (!deletedSlide) {
        response.status(404).json({
            message: "slide not found",
            success: false,
            error: true
        });
    }
    
    return response.status(200).json({
        success: true,
        error: false,
        message: "Slide Deleted!",
    });

}

export async function updatedSlide(request, response) {
    
    const slide = await HomeSliderModel.findByIdAndUpdate(
        request.params.id, 
        {
            images: imagesArr.length>0 ? imagesArr[0] : request.body.images,
        }, 
        { new: true }
    );

    if (!slide) {
        return response.status(500).json({
            message: "slide cannot be updated",
            success: false,
            error: true
        })
    }
    
    imagesArr = []
    
    response.status(200).json({
        error: false,
        success: true,
        slide: slide,
        message: "slide updated successfully"
    })
}

export async function deleteMultipleSlides(request, response) {
    const { ids } = request.body;

    if (!ids || !Array.isArray(ids)) {
        return response.status(400).json({ error: true, success: false, message: 'Invalid input' });
    }
    
    for(let i=0; i<ids?.length; i++){
        const product = await HomeSliderModel.findById(ids[i]);
        
        const images = product.images;

        let img="";
        for (img of images) {
            const imgUrl = img;
            const urlArr = imgUrl.split("/");
            const image = urlArr[urlArr.length - 1];

            const imageName = image.split(".")[0];

            if (imageName) {
                cloudinary.uploader.destroy(imageName, (error, result) => {
                    // console.log(error, result);
                });
            }

        }
    }
    
    try {
        await HomeSliderModel.deleteMany({ _id: { $in: ids } });
        return response.status(200).json({
            message: "slides delete successfully!",
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}