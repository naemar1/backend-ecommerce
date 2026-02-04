import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import {
    createProduct,
    getAllFeaturedProducts,
    getAllProducts,
    getAllProductsByCatId,
    getAllProductsByCatName,
    getAllProductsByPrice,
    getAllProductsByRating,
    getAllProductsBySubCatId,
    getAllProductsBySubCatName,
    getAllProductsByThirdLevelCatId,
    getAllProductsByThirdLevelCatName,
    getProductsCount,
    deleteProduct,
    getProduct,
    uploadImages,
    removeImageFromCloudinary,
    updateProduct,
    deleteMultipleProduct,
    createProductRAMS,
    deleteProductRAMS,
    updateProductRams,
    deleteMultipleProductRams,
    getProductRams,
    getProductRamsById,
    createProdutWEIGHT,
    deleteProductWEIGHT,
    updateProductWeight,
    deleteMultipleProductWeight,
    getProductWeight,
    getProductWeightById,
    createProdutSize,
    deleteProductSize,
    updateProductSize,
    deleteMultipleProductSize,
    getProductSize,
    getProductSizeById,
    uploadBannerImages,
    filters,
    sortBy,
    // searchProductcontroller,
    searchProducts
} from '../controllers/product.controller.js';

const productRouter = Router();

productRouter.post('/uploadImages', auth, upload.array('images'), uploadImages);
productRouter.post('/uploadBannerImages', auth, upload.array('bannerimages'), uploadBannerImages)
productRouter.post('/create', auth, createProduct);
productRouter.get("/search", searchProducts);
productRouter.get('/getAllProducts', getAllProducts);
productRouter.get('/getAllProductsByCatId/:id', getAllProductsByCatId);
productRouter.get('/getAllProductsByCatName', getAllProductsByCatName);
productRouter.get('/getAllProductsBySubCatId/:id', getAllProductsBySubCatId);
productRouter.get('/getAllProductsBySubCatName', getAllProductsBySubCatName);
productRouter.get('/getAllProductsByThirdLevelCat/:id', getAllProductsByThirdLevelCatId);
productRouter.get('/getAllProductsByThirdLevelCatName', getAllProductsByThirdLevelCatName);
productRouter.get('/getAllProductsByPrice', getAllProductsByPrice);
productRouter.get('/getAllProductsByRating', getAllProductsByRating);
productRouter.get('/getAllProductsCount', getProductsCount);
productRouter.get('/getAllFeaturedProducts', getAllFeaturedProducts);
productRouter.get('/:id', getProduct);
productRouter.delete('/deleteImage', auth, removeImageFromCloudinary);
productRouter.delete('/deleteMultiple', deleteMultipleProduct);
productRouter.delete('/:id', deleteProduct);
productRouter.put('/updateProduct/:id', auth, updateProduct);

productRouter.post('/productRAMS/create', auth, createProductRAMS);
productRouter.delete('/deleteProductRAMS/:id', deleteProductRAMS);
productRouter.delete('/productRAMS/deleteMultipleRAMS', deleteMultipleProductRams);
productRouter.get('/productRAMS/get', getProductRams);
productRouter.get('/getProductRAMS/:id', getProductRamsById);
productRouter.put('/updateProductRAMS/:id', auth, updateProductRams);

productRouter.post('/productWeight/create', auth, createProdutWEIGHT);
productRouter.delete('/deleteProductWeight/:id', deleteProductWEIGHT);
productRouter.delete('/productweight/deleteMultipleWeight', deleteMultipleProductWeight);
productRouter.get('/productWeight/get', getProductWeight);
productRouter.get('/productweight/:id', getProductWeightById);
productRouter.put('/updateProductWeight/:id', auth, updateProductWeight);

productRouter.post('/productSize/create', auth, createProdutSize);
productRouter.delete('/deleteProductSize/:id', deleteProductSize);
productRouter.delete('/productSize/deleteMultipleSize', deleteMultipleProductSize);
productRouter.get('/productSize/get', getProductSize);
productRouter.get('/productSize/:id', getProductSizeById);
productRouter.put('/updateProductSize/:id', auth, updateProductSize);

productRouter.post('/filters', filters);
productRouter.post('/sortBy', sortBy);
// productRouter.get('/search/get', searchProductcontroller);



export default productRouter;