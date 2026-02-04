import OrderModel from "../models/order.model.js";
import ProductModel from "../models/product.modal.js"; 
import mongoose from "mongoose"; 

export const createOrderController = async (request, response) => {
    try {
        let order = new OrderModel({
            userId: request.body.userId,
            products: request.body.products,
            paymentId: request.body.paymentId,
            payment_status: request.body.payment_status,
            delivery_address: request.body.delivery_address,
            totalAmount: request.body.totalAmount,
            date: request.body.date
        });

        if (!order) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        for (let i = 0; i < request.body.products.length; i++) {
            await ProductModel.findByIdAndUpdate(
                request.body.products[i].productId,
                {   
                    countInStock: parseInt(request.body.products[i].countInStock) - request.body.products[i].quantity,
                },
                { new: true }
            );
        }

        order = await order.save(); 

        return response.status(200).json({
            error: false,
            success: true,
            message: "Order Placed",
            order: order
        });

    } catch (error) {
        response.status(500).send({
            error: true,
            success: false,
            message: "Error in order creation",
            errorDetails: error.message
        });
    }
}

export async function getOrdersDetailsController(request, response) {
    try {

        const orderlist = await OrderModel
            .find({})
            .sort({ createdAt: -1 })
            .populate('delivery_address')
            .populate('userId');

        return response.json({
            message: "order list",
            data: orderlist,
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
}

export async function getUserOrdersDetailsController(request, response) {
    try {
        console.log(request)
        console.log("userId in getUserOrdersDetailsController:", request.userId);
        const userId = request.userId;
        console.log("Fetching orders for userId:", userId);

        const orderlist = await OrderModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .populate('delivery_address')
            .populate('userId');

        console.log("user orders:", orderlist);

        return response.json({
            message: "order list",
            data: orderlist,
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
}

export async function getUserOrdersAdminDetailsController(request, response) {
    try {
        console.log(request)
        console.log("userId in getUserOrdersDetailsController:", request.userId);
        const userId = request.params.userId;
        console.log("Fetching orders for userId:", userId);

        const orderlist = await OrderModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .populate('delivery_address')
            .populate('userId');

        console.log("user orders:", orderlist);

        return response.json({
            message: "order list",
            data: orderlist,
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
}
           

export async function updateOrderStatusController(req, res) {
try {
  const { orderId } = req.params;
  const { status, deliveryDate } = req.body;

  if (!status && !deliveryDate) {
    return res.status(400).json({
      success: false,
      message: "At least one field (status or deliveryDate) is required"
    });
  }

  const order = await OrderModel.findById(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found"
    });
  }

  if (status) order.order_status = status;
  if (deliveryDate) order.deliveryDate = new Date(deliveryDate);

  order.updatedAt = new Date();
  await order.save();

  return res.status(200).json({
    success: true,
    message: "Order updated successfully",
    order
  });

} catch (error) {
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    error: error.message
  });
}
}

export async function cancelOrderStatusController(req, res) {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (["Shipped", "Delivered"].includes(order.order_status)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      });
    }

    if (order.order_status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    order.order_status = "Cancelled";
    order.cancelledAt = new Date();

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        orderId: order._id,
        status: order.order_status,
      },
    });
  } catch (error) {
    console.error("Cancel order error:", error); // 🔹 log the real error
    return res.status(500).json({
      success: false,
      message: "Internal server error during order cancellation",
    });
  }
}

export async function deleteOrderController(req, res) {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Business rule: allow delete only for cancelled orders
    if (!["Cancelled"].includes(order.order_status)) {
      return res.status(400).json({
        success: false,
        message: "Only cancelled orders can be deleted",
      });
    }

    await OrderModel.findByIdAndDelete(orderId);

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      data: {
        orderId,
      },
    });
  } catch (error) {
    console.error("Delete order error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting order",
    });
  }
};

export async function getMonthlySales(req, res) {
  try {
    const { year } = req.query;

    const matchStage = year
      ? {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      : {};

    const sales = await OrderModel.aggregate([
      { $match: matchStage },

      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalOrders: { $sum: 1 }   // ✅ COUNT orders
        }
      },

      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" }
                ]
              }
            ]
          },
          totalOrders: 1
        }
      },

      { $sort: { month: 1 } }
    ]);

    return res.status(200).json({
      success: true,
      error: false,
      data: sales
    });

  } catch (error) {
    console.error("Monthly Orders Error:", error.message);
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message
    });
  }
}