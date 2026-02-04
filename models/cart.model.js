import mongoose from "mongoose";

const cartProductSchema = new mongoose.Schema({
    productTitle : {
        type : String,
        required : true,
    },
    image : {
        type : String,
        required : true,
    },
    rating :{
        type : String,
        required : true,
    },
    price : {
        type : Number,
        required : true
    },
    oldPrice : {
        type : Number,
    },
    discount : {
        type : Number,
    },
    size : {
        type : String,
    },
    weight : {
        type : String,
    },
    ram : {
        type : String,
    },
    quantity : {
        type : Number,
        required : true
    },
    subTotal : {
        type : Number,
        required : true,
    },
    productId : {
        type : String,
        required : true,
    },
    countInStock : {
        type : Number,
        required : true,
    },
    brand : {
        type : String,
    },
    userId : {
        type : mongoose.Schema.ObjectId,
        ref : "User"
    }
},{ timestamps : true
});

const CartProductModel = mongoose.model('cart', cartProductSchema)

export default CartProductModel