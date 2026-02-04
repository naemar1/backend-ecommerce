import { Router } from 'express';
import auth from './../middlewares/auth.js';
import { addAddressController,getSingleAddressController, deleteAddressController, getAddressesController, updateSelectedAddressController, editAddress} from '../controllers/address.controller.js';

const addressRouter = Router();

addressRouter.post("/add", auth, addAddressController); 
addressRouter.get("/get", auth, getAddressesController);
addressRouter.get("/:id", auth, getSingleAddressController);   
addressRouter.put('/select/:id', auth, updateSelectedAddressController);
addressRouter.delete('/delete/:addressId', auth, deleteAddressController);
addressRouter.put('/:id', auth, editAddress);

export default addressRouter;