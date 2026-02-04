import CategoryModel from "./../models/category.model.js";
import { v2 as cloudinary } from "cloudinary";
import { error } from "console";
import fs from 'fs';


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

// Create Category
export async function createCategory(request, response) {
    try {
        if (!request.body.name) {
            return response.status(400).json({
                message: "Category name is required",
                success: false,
                error: true
            });
        }

        let category = new CategoryModel({
            name: request.body.name,
            images: imagesArr,  // uses uploaded images
            parentCatName: request.body.parentCatName || null,
            parentId: request.body.parentId || null
        });

        category = await category.save();
        imagesArr = []; // Clear image array for next request

        return response.status(200).json({
            message: "Category created successfully",
            success: true,
            error: false,
            category: category
        });

    } catch (error) {
        return response.status(500).json({
            message: "Server error while creating category",
            success: false,
            error: true
        });
    }
}

//get All category
export async function getAllCategory(request, response) {
    try {
        const categories = await CategoryModel.find();
        const categoryMap = {};

        // Prepare category map
        categories.forEach(cat => {
            categoryMap[cat._id] = { ...cat._doc, children: [] };
        });

        // Organize nested categories
        const rootCategories = [];
        categories.forEach(cat => {
            if (cat.parentId) {
                categoryMap[cat.parentId].children.push(categoryMap[cat._id]);
            } else {
                rootCategories.push(categoryMap[cat._id]);
            }
        });

        return response.status(200).json({
            message: "All categories fetched",
            success: true,
            error: false,
            data: rootCategories
        });

    } catch (error) {
        return response.status(500).json({
            message: "Server error while getting categories",
            success: false,
            error: true
        });
    }
}

//get category count
export async function getCategoriesCount(request, response) {
    try {

        const categoryCount = await CategoryModel.countDocuments({ parentId: undefined })

        if (!categoryCount) {
            response.status(500).json({ error: true })
        } else {
            response.send({
                categoryCount: categoryCount
            })
        }
    } catch (error) {
        return response.status(500).json({
            message: "Server error while getting Categories count ",
            error: true
        });
    }
}


// Get Sub-Category Count (categories having parentId)
export async function getSubCategoriesCount(request, response) {
    try {

        const categories = await CategoryModel.find();

        if (!categories) {
            return response.status(500).json({
                message: "Categories not found",
                error: true
            });
        }

        // Filter sub categories → those which have parentId
        const subCategoryList = categories.filter(cat => cat.parentId);

        return response.status(200).json({
            message: "Sub Categories count fetched successfully",
            success: true,
            subCategoryCount: subCategoryList.length
        });

    } catch (error) {
        return response.status(500).json({
            message: "Server error while getting sub categories count",
            error: true
        });
    }
}

//get single category 
export async function getCategory(request, response) {
    try {
        const category = await CategoryModel.findById(request.params.id)

        if (!category) {
            response.status(500).json({
                message: "The category with given Id was Found",
                error: true
            })
        }
        return response.status(200).json({
            success: true,
            category: category
        })
    } catch (error) {
        return response.status(500).json({
            message: "Server error while getting category By id",
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

//Delete Category

// export async function deleteCategory(request, response) {
//     try {
//         const category = await CategoryModel.findById(request.params.id)
//         const images = category.images

//         for (img of images) {
//             const imgUrl = img;
//             const urlArr = imgUrl.split("/")
//             const image = urlArr[urlArr.length - 1];
//             const imageName = image.split(".")[0];
//             if (imageName) {
//                 cloudinary.uploader.destroy(imageName)
//             }
//         }

//         const subCategory = await CategoryModel.find({
//             parentId: request.params.id
//         })

//         for (let i = 0; i < subCategory.length; i++) {
//             // console.log(subCategory[id]._id);
//             const thirdsubCategory = await CategoryModel.find({
//                 parentId: subCategory[id]._id
//             })
//             for (let i = 0; i < thirdsubCategory; i++) {
//                 const deletedThirdSubCat = await CategoryModel.findByIdAndDelete(thirdsubCategory[i]._id)
//             }
//             const deletedSubCat = await CategoryModel.findByIdAndDelete(subCategory[i]._id)

//         }
//         const deletedCat = await CategoryModel.findByIdAndDelete(request.params.id)

//         if (!deletedSubCat) {
//             response.status(404).json({
//                 message: "category not found",
//                 error: true
//             })
//         }
//         response.status(200).json({
//             success: true,
//             message: "category Deleted"
//         })
//     } catch (error) {

//     }

// }

export async function deleteCategory(request, response) {
    try {

        // Find category
        const category = await CategoryModel.findById(request.params.id);
        if (!category) {
            return response.status(404).json({
                message: "Category not found",
                error: true,
                success: false
            });
        }

        // Delete images from Cloudinary
        const images = category.images;
        for (let img of images) {
            const imageName = img.split("/").pop().split(".")[0];
            if (imageName) {
                await cloudinary.uploader.destroy(imageName);
            }
        }

        // Delete sub categories
        const subCategories = await CategoryModel.find({ parentId: request.params.id });

        for (let i = 0; i < subCategories.length; i++) {
            const thirdSubCategories = await CategoryModel.find({ parentId: subCategories[i]._id });

            for (let j = 0; j < thirdSubCategories.length; j++) {
                await CategoryModel.findByIdAndDelete(thirdSubCategories[j]._id);
            }

            await CategoryModel.findByIdAndDelete(subCategories[i]._id);
        }

        // Delete main category
        await CategoryModel.findByIdAndDelete(request.params.id);

        return response.status(200).json({
            success: true,
            error: false,
            message: "Category and all subcategories deleted successfully"
        });

    } catch (error) {

        return response.status(500).json({
            message: "Server error while deleting category",
            error: true,
            success: false
        });
    }
}


//update catgory

// export async function updatedCategory(request, response) {
//     try {
//         const category = await CategoryModel.findByIdAndUpdate(
//             request.params.id, {
//             name: request.body.name,
//             images: request.body.images,
//             parentCatName: request.body.parentCatName || null,
//             parentId: request.body.parentId || null
//         }, { new: true }
//         )

//         if (!category) {
//             return response.status(500).json({
//                 message: "category cannot be updated",
//                 success: false
//             })
//         }
//         imagesArr = []
//         response.status(200).send(
//             {
//                 success: true,
//                 category: category
//             }
//         )
//     } catch (error) {

//     }
// }

export async function updatedCategory(request, response) {
    try {
        const category = await CategoryModel.findByIdAndUpdate(
            request.params.id,
            {
                name: request.body.name,
                images: request.body.images,
                parentCatName: request.body.parentCatName || null,
                parentId: request.body.parentId || null
            },
            { new: true }
        );

        if (!category) {
            return response.status(404).json({
                message: "Category cannot be updated",
                success: false,
                error: true
            });
        }

        // No need for imagesArr reset if not used
        imagesArr = [];

        return response.status(200).json({
            message: "Category updated successfully",
            success: true,
            error: false,
            category: category
        });

    } catch (error) {
        return response.status(500).json({
            message: "Server error while updating category",
            success: false,
            error: true
        });
    }
}
