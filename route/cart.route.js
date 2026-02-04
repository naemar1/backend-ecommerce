import { Router } from "express";
import auth from "../middlewares/auth.js";
import { addToCartItemController, deleteCartItemQtyController, emptyCartController, getCartItemController, updateCartItemController } from "../controllers/cart.controller.js";

const cartRouter = Router();

cartRouter.post('/add',auth,addToCartItemController)
cartRouter.get('/get',auth,getCartItemController)
cartRouter.delete('/delete-cart-item/:id',auth,deleteCartItemQtyController)
cartRouter.put('/update-qty',auth,updateCartItemController)
cartRouter.delete('/delete-cart-item',auth,deleteCartItemQtyController)
cartRouter.delete('/emptyCart/:id',auth,emptyCartController)

export default cartRouter;
