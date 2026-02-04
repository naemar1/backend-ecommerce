import CartProductModel from "../models/cart.model.js";
import mongoose from "mongoose";

export const addToCartItemController = async(request,response)=>{
    try {
        const userId = request.userId
        const { productTitle, image, rating, price, oldPrice, quantity, subTotal, productId, countInStock, discount, size, weight, ram, brand} = request.body

        if (!productId){
            return response.status(402).json({
                message : "Provide productId",
                error : true,
                success : false
            })
        }

        const checkItemCart = await CartProductModel.findOne({
            userId : userId,
            productId : productId
        })
        
        if(checkItemCart){
            return response.status(400).json({
                message : "Item already in cart"
            })
        }

        const cartItem = new CartProductModel({
            productTitle : productTitle,
            image : image,
            rating : rating,
            price : price,
            oldPrice : oldPrice,
            quantity : quantity,
            subTotal : subTotal,
            productId : productId,
            countInStock : countInStock,
            userId : userId, 
            brand : brand,
            discount :discount,
            size : size,
            weight : weight,
            ram : ram,
        })

        const save = await cartItem.save()

        // const updateCartUser = await UserModel.updateOne({ _id : userId},{
        //     $push : {
        //         shopping_cart : productId
        //     }
        // })

        return response.status(200).json({
            data : save,
            message : "Item add successfully",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
        
    }
}

export const getCartItemController = async(request,response)=>{
    try {
        const userId = request.userId
        
        const cartItems = await CartProductModel.find({
            userId : userId
        })

        return response.json({
            data : cartItems,
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
        
    }
}

export const updateCartItemController = async(request,response)=>{
    try {
        const userId = request.userId
        const { _id,qty, subTotal, ram, weight, size} = request.body

        if(!_id || !qty){
            return response.status(400).json({
                message : "provide _id, qty"
            })
        }

        const updateCartitem = await CartProductModel.updateOne(
            {
            _id: _id,
            userId: userId
            },
            {
                quantity: qty,
                subTotal: subTotal,
                size : size,
                weight : weight,
                ram : ram,
            },{new: true}
        )

        return response.json({
            message : "Updated cart item",
            success : true,
            error : false,
            data : updateCartitem
        })
        
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        }) 
    }
}

export const deleteCartItemQtyController = async(request,response)=>{
    try {

        const userId = request.userId
        const { id } = request.params

        if(!id){
            return response.status(400).json({
                message : "Provide _id",
                error : true,
                success : false
            })
        }

        const deleteCartitem = await CartProductModel.deleteOne({_id: id,userId: userId},)

        if(!deleteCartitem){
            return response.status(404).json({
                message:"The product in the cart is not found",
                error:true,
                success:false
            })
        }
        return response.json({
            message : "Item removed",
            error : false,
            success : true,
            data : deleteCartitem
        })
        
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        }) 
    }
}

export const emptyCartController = async (request, response) => {
    try {
        const userId = request.params.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return response.status(400).json({
                message: "Invalid userId",
                error: true,
                success: false
            });
        }

        const result = await CartProductModel.deleteMany({
            userId: new mongoose.Types.ObjectId(userId)
        });

        return response.status(200).json({
            message: "Cart cleared successfully",
            deletedCount: result.deletedCount,
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};
