import BannerV1Model from '../models/bannerV1.model.js';
import mongoose from "mongoose";

import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

var imagesArr = [];
export async function uploadImages(request, response) {
    try {
        imagesArr = []

        const image = request.files;

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        for (let i = 0; i < image?.length; i++) {

            const img = await cloudinary.uploader.upload(
                image[i].path,
                options,
                function (error, result) {
                    imagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${request.files[i].filename}`);
                }
            );
        }

        return response.status(200).json({
            images: imagesArr
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//create banner
export async function createBannerV1(request, response) {
    try {
        let imagesArr = request.body.images;
        let bannerV1 = new BannerV1Model({
            images: imagesArr,
            BannerTitle: request.body.BannerTitle,
            price: request.body.price,
            catId: request.body.catId,
            subCatId: request.body.subCatId,
            thirdsubCatId: request.body.thirdsubCatId,
            alignInfo: request.body.alignInfo,
        });

        if (!bannerV1) {
            response.status(500).json({
                error: true,
                success: false,
                message: "Banner Not Created"
            });
        }

        const savedBanner = await bannerV1.save();

        imagesArr = [];

        return response.status(200).json({
            message: "Banner Created Successfully",
            error: false,
            success: true,
            banner: savedBanner
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//get All banners
export async function getAllBanners(request, response) {
    try {
        const banners = await BannerV1Model.find();

        if (!banners) {
            return response.status(500).json({
                error: true,
                success: true,
                message: "Error in fetching the banners"
            })
        }

        return response.status(200).json({
            message: "All Banners fetched",
            success: true,
            error: false,
            data: banners
        });

    } catch (error) {
        return response.status(500).json({
            message: "Server error while getting Banners",
            success: false,
            error: true
        });
    }
}

//Delete Banner
export async function deleteBanner(request, response) {
    try {

        // Find category
        const banner = await BannerV1Model.findById(request.params.id);
        if (!banner) {
            return response.status(404).json({
                message: "Banner not found",
                error: true,
                success: false
            });
        }

        // Delete images from Cloudinary
        const images = banner.images;
        for (let img of images) {
            const imageName = img.split("/").pop().split(".")[0];
            if (imageName) {
                await cloudinary.uploader.destroy(imageName);
            }
        }

        // Delete main category
        await BannerV1Model.findByIdAndDelete(request.params.id);

        return response.status(200).json({
            success: true,
            error: false,
            message: "Banner deleted successfully"
        });

    } catch (error) {

        return response.status(500).json({
            message: "Server error while deleting banner",
            error: true,
            success: false
        });
    }
}

//update Banner
export async function updatedBanner(request, response) {
    try {
        const banner = await BannerV1Model.findByIdAndUpdate(
            request.params.id,
            {
                images: request.body.images,
                BannerTitle: request.body.bannerTitle,
                price: request.body.price,
                catId: request.body.catId,
                subCatId: request.body.subCatId,
                thirdsubCatId: request.body.thirdsubCatId,
                alignInfo: request.body.alignInfo,
            },
            { new: true }
        );

        if (!banner) {
            response.status(404).json({
                message: "Banner cannot be updated",
                success: false,
                error: true
            });
        }

        // No need for imagesArr reset if not used
        imagesArr = [];

        return response.status(200).json({
            message: "Banner updated successfully",
            success: true,
            error: false,
            banner: banner
        });

    } catch (error) {
        return response.status(500).json({
            message: "Server error while updating banner",
            success: false,
            error: true
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
                message: "Failed to delete image from Cloudinary" });
        }
    } catch (error) {
        console.error("    Cloudinary delete error:", error);
        return response.status(500).json({ success: false, message: "Failed to delete image", error: error.message });
    }
}

//get single banner
export async function getBanner(request, response) {
    try {
        const banner = await BannerV1Model.findById(request.params.id);

        if (!banner) {
            return response.status(404).json({
                message: "The banner with given Id was not Found",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            success: true,
            error: false,
            banner: banner
        });

    } catch (error) {
        return response.status(500).json({
            message: "Server error while getting banner By id",
            error: true,
            success: false
        });
    }
}


//delete multiple banners
export async function deleteMultipleBanners(request, response) {
  const { ids } = request.body;

  // Guard clause – input validation
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return response.status(400).json({
      success: false,
      error: true,
      message: "Invalid banner IDs"
    });
  }

  try {
    // Step 1: Fetch all banners to extract images
    const banners = await BannerV1Model.find({
      _id: { $in: ids }
    });

    // Step 2: Delete images from Cloudinary
    for (const banner of banners) {
      const images = banner.images || [];

      for (const imgUrl of images) {
        const urlArr = imgUrl.split("/");
        const image = urlArr[urlArr.length - 1];
        const imageName = image.split(".")[0];

        if (imageName) {
          await cloudinary.uploader.destroy(imageName);
        }
      }
    }

    // Step 3: Delete banners from database
    await BannerV1Model.deleteMany({
      _id: { $in: ids }
    });

    return response.status(200).json({
      success: true,
      error: false,
      message: "Banners deleted successfully"
    });

  } catch (error) {
    console.error("Delete multiple banners error:", error);

    return response.status(500).json({
      success: false,
      error: true,
      message: error.message || "Failed to delete banners"
    });
  }
}