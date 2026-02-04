import { request, response } from 'express';
import MyListModel from './../models/myList.model.js';

export const addToMyListController = async (request, response) => {

    try {
        const userId = request.userId //middleware
        const {
            productId,
            productTitle,
            image,
            rating,
            price,
            oldPrice,
            brand,
            discount
        } = request.body

        const item = await MyListModel.findOne({
            userId: userId,
            productId: productId
        })
        if (item) {
            return response.status(400).json({
                message: "item is already in my list"
            })
        }
        const myList = new MyListModel({
            userId,
            productId,
            productTitle,
            image,
            rating,
            price,
            oldPrice,
            brand,
            discount
        })

        const save = await myList.save();
        return response.status(200).json({
            success: true,
            error: false,
            message: "the product saved in the my list"
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message,
            success: false,
            error: true
        })
    }
}


export const deleteToMyListController = async (req, res) => {
  try {
    const deletedItem = await MyListModel.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({
        error: true,
        message: "The item was not found or already deleted"
      });
    }

    return res.status(200).json({
      success: true,
      message: "The item removed from My List"
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true
    });
  }
};



export const getMyListController = async (request, response) => {
    try {
        const userId = request.userId;
        const myListItems = await MyListModel.find({
            userId: userId
        })

        return response.status(200).json({
            success: true,
            error: false,
            data: myListItems
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message,
            error: true
        })
    }
}