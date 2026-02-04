import AddressModel from "../models/address.model.js";
import UserModel from './../models/user.model.js';

export const addAddressController = async (request, response) => {
    try {
        let {
            address_line1,
            city,
            state,
            pincode,
            country,
            mobile,
            landmark,
            addressType,
            status,
            selected
        } = request.body;

        const userId = request.userId || request.body.userID;

        if (status === undefined || status === null) {
            status = true;
        } else {
            status = status === true || status === "true";
        }

        if (selected === undefined || selected === null) {
            selected = false;
        } else {
            selected = selected === true || selected === "true";
        }

        if (
            !address_line1 ||
            !pincode ||
            !country ||
            !mobile ||
            !userId ||
            !city ||
            !state
        ) {
            return response.status(400).json({
                message: "Required fields missing",
                error: true,
                success: false
            });
        }

        if (selected === true) {
            await AddressModel.updateMany(
                { userId },
                { $set: { selected: false } }
            );
        }

        const newAddress = new AddressModel({
            address_line1,
            city,
            state,
            pincode,
            country,
            mobile,
            landmark,
            addressType,
            status,
            selected,
            userId
        });

        const savedAddress = await newAddress.save();

        await UserModel.updateOne(
            { _id: userId },
            { $push: { address_details: savedAddress._id } }
        );

        return response.status(200).json({
            data: savedAddress,
            message: "Address Saved Successfully",
            success: true,
            error: false
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
};

export const getAddressesController = async (request, response) => {
    try {
        const { userId } = request.query;

        const addresses = await AddressModel.find({ userId });

        // Update user only if addresses exist
        if (addresses.length > 0) {
            await UserModel.updateOne(
                { _id: userId },
                { $set: { address_details: addresses.map(addr => addr._id) } }
            );
        }

        return response.status(200).json({
            address: addresses, // will be [] if no addresses
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
};

export const updateSelectedAddressController = async (req, res) => {
    try {

        const addressId = req.params.id;
        const userId = req.query.userId;

        if (!addressId) {
            return res.status(400).json({ 
                error: true, 
                success: false, 
                message: "Address ID is required" 
            });
        }

        await AddressModel.updateMany(
            { userId: userId },
            { $set: { selected: false } }
        );

        await AddressModel.findByIdAndUpdate(addressId, { selected: true });

        return res.status(200).json({
            error: false,
            success: true,
            message: "Selected address updated successfully",
            addressId,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to update selected address",
            error: error.message,
            success: false
        });
    }
};

export const deleteAddressController = async (request, response) => {
    try {
        const { addressId } = request.params;

        if (!addressId) {
            return response.status(400).json({
                success: false,
                message: "Address ID is required",
            });
        }

        const address = await AddressModel.findById(addressId);
        if (!address) {
            return response.status(404).json({
                success: false,
                error: true,
                message: "Address not found",
            });
        }

        await AddressModel.findByIdAndDelete(addressId);

        return response.status(200).json({
            error: false,
            success: true,
            message: "Address deleted successfully",
        });

    } catch (error) {
        return response.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const getSingleAddressController = async (request, response) => {
    try {
        const id = request.params.id;
        const address = await AddressModel.findById({_id:id});
        if (!address) {
            return response.status(404).json({
                
                message: "Address not found",
                error: true,
                success: false,
            });
        } 
        return response.status(200).json({
            error: false,
            success: true,
            address: address
        })
        } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    } 
};


export async function editAddress(request, response) {
    try {
        const id = request.params.id;
        const { address_line1, city, state, pincode, country, mobile,userId, landmark, addressType } = request.body;

        
        
        const address = await AddressModel.findByIdAndUpdate(
            id,
            {
                address_line1: address_line1,
                city: city,
                state: state,
                pincode: pincode,
                country: country,
                mobile: mobile,
                landmark: landmark,
                addressType: addressType,

            }, {
            new: true
        })
        
        return response.json({
            message: "Address Updated successfully",
            error: false,
            success: true,
            address: address 
        })

    } catch (error) {

        if (error.name === "ValidationError") {
            return response.status(400).json({
                message: error.message,
                success: false,
                error: true,
            });
        }

        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}
