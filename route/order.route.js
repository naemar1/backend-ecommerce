import { Router } from "express";
import auth from "../middlewares/auth.js";
import { createOrderController, getMonthlySales, getOrdersDetailsController, updateOrderStatusController, getUserOrdersDetailsController, getUserOrdersAdminDetailsController, cancelOrderStatusController, deleteOrderController } from "../controllers/order.controller.js";

const orderRouter = Router();

orderRouter.post('/create',createOrderController)
orderRouter.get('/get-orders',auth,getOrdersDetailsController)
orderRouter.get('/get-monthly-sales',auth, getMonthlySales)
orderRouter.get('/get-orders/:userId',auth,getUserOrdersDetailsController)
orderRouter.get('/get-orders-admin/:userId',auth,getUserOrdersAdminDetailsController)
orderRouter.delete('/delete/:orderId', auth, deleteOrderController)
orderRouter.put('/update-order/:orderId',auth,updateOrderStatusController)   
orderRouter.put('/cancel/:orderId',auth,cancelOrderStatusController) 

export default orderRouter;