import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    products: [
        {
            productId: {
                type: String,
            },
            prodiuctTitle: {
                type: String,
            },
            quantity: {
                type: Number,
            },
            price: {
                type: Number,
            },
            image: {
                type: String,
            },
            subTotal: {
                type: Number,
            }
        }
    ],
    paymentId: {
        type: String,
        default: ""
    },

    payment_status: {
        type: String,
        default: ""
    },

    delivery_address: {
        type: mongoose.Schema.ObjectId,
        ref: "address"
    },

    deliveryDate: {
        type: Date,
        default: null
    },

    totalAmount: {
        type: Number,
        default: 0
    },

    order_status: {
        type: String,
        enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
        default: "Pending"
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }

    // invoice_receipt:{
    //     type:String,
    //     default:""
    // }
}, { timestamps: true })

const OrderModel = mongoose.model('order', orderSchema)
export default OrderModel