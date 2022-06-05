const userModel = require("../models/userModel");
const cartModel = require("../models/cartModel");
const orderModel = require("../models/orderModel");
const  { isValidBody, isValidStatus, isValidObjectId} = require('../utils/validation')
//============================================Creating order=========================================================
const orderCreation = async (req, res) => {
    try {
        const userId = req.params.userId;
        const requestBody = req.body;
        
        //validation for request body
        if (isValidBody(requestBody)) 
            return res.status(400).send({status: false,message: "Invalid request body. Please provide input to proceed."});
        
        //Extract parameters
        const { cartId, cancellable, status } = requestBody;

        //validating userId
        if (!isValidObjectId(userId)) 
            return res.status(400).send({ status: false, message: "Invalid userId in params." });
        const ExistUser = await userModel.findOne({ _id: userId });
        if (!ExistUser) 
            return res.status(400).send({status: false,message: `user doesn't exists for ${userId}`});
        
       if (!cartId) 
            return res.status(400).send({status: false,message: `this is not valid cart Id ${cartId}`});
        
        if (!isValidObjectId(cartId)) {
            return res.status(400).send({status: false,message: "Invalid cartId in request body."});
        }

        //searching cart to match the cart by userId whose is to be ordered.
        const findingCartDetails = await cartModel.findOne({_id: cartId,userId: userId});
        if (!findingCartDetails) 
            return res.status(400).send({status: false,message: `Cart doesn't belongs to ${userId}` });

        //must be a boolean value.
        if (cancellable) {
            if (typeof cancellable != "boolean") 
                return res.status(400).send({status: false,message: `Cancellable must be either 'true' or 'false'`});
              }

        // must be either - pending , completed or cancelled.
        if (status) {
            if (!isValidStatus(status)) 
                return res.status(400).send({status: false,message: `Status must be among ['pending','completed','cancelled'].`,});
        }
        //verifying whether the cart is having any products or not.
        if (!findingCartDetails.items.length) 
            return res.status(202).send({status: false,
                message: `Order already placed for this cart. Please add some products in cart to make an order.`,
            });
        //adding quantity of every products
    
        let totalQuantity = findingCartDetails.items
            .map((x) => x.quantity)
            .reduce((previousValue, currentValue) =>previousValue + currentValue);
           
        //object destructuring for response body.
        const orderDetails = {
            userId: userId,
            items: findingCartDetails.items,
            totalPrice: findingCartDetails.totalPrice,
            totalItems: findingCartDetails.totalItems,
            totalQuantity: totalQuantity,
            cancellable,
            status,
        };
        const finalOrder = await orderModel.create(orderDetails);

        //Empty the cart after the successfull order
        await cartModel.findOneAndUpdate({ _id: cartId, userId: userId }, { $set: {items: [],totalPrice: 0,totalItems: 0}});
        return res.status(200).send({ status: true, message: "Order placed successfully.", data: finalOrder });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};



const updateOrder = async (req, res) => {
    try {
        const userId = req.params.userId;
        const data = req.body;
        
        if (isValidBody(data)) 
            return res.status(400).send({status: false,message: "Invalid request body."});
        //extract params
        const { orderId, status } = data;
        if (!isValidObjectId(userId))
            return res.status(400).send({ status: false, message: "Invalid userId in params." });
        //finding user from userModel
        const ExistUser = await userModel.findOne({ _id: userId });
        if (!ExistUser) 
            return res.status(400).send({status: false,message: `user doesn't exists for ${userId}`});
        if (!orderId) 
            return res.status(400).send({status: false,message: `Order doesn't exists for ${orderId}`});
    
        //verifying does the order belongs to user or not.
       const isUserOrder = await orderModel.findOne({ userId: userId });
        if (!isUserOrder) 
            return res.status(400).send({status: false,message: `Order doesn't belongs to ${userId}`});
        if (!status) 
            return res.status(400).send({status: false,message: "Staus is Manditatory"});
        if (!isValidStatus(status)) 
            return res.status(400).send({status: false,message: "It should be among this =>'pending','completed', or 'cancelled'."});
    
        //if cancellable is true then status can be updated to any of te choices.
        if (isUserOrder.cancellable == true) {
            if ((isValidStatus(status))) {
                if (isUserOrder.status == 'pending') {
                    if(status=='pending')
                    return res.status(400).send({ status: false, message: `already in pending status.` })
                    const updatingStatus = await orderModel.findOneAndUpdate({ _id: orderId }, {$set: { status: status }}, { new: true })
                    return res.status(200).send({ status: true, message: `Successfully updated the order details.`, data: updatingStatus })
                }
    
                //if order is in completed status then nothing can be changed/updated.
                if (isUserOrder.status== 'completed') 
                    return res.status(400).send({ status: false, message: `it's already in completed status.CanNot Update.`})
                
                //if order is already in cancelled status then nothing can be changed/updated.
                if (isUserOrder.status == 'cancelled') 
                    return res.status(400).send({ status: false, message: `it's already in cancelled status.CanNot Update.`})
                
            }
        }
        //for cancellable : false
        if (isUserOrder.cancellable == false) {
        if ((isValidStatus(status))) {
        if (isUserOrder.status == 'pending') {
            if (status) {
                if (status == "cancelled") {
                return res.status(400).send({ status: false, message: `Due to cancellable is false Cannot update` })
                }
                if (status == "pending") {
                return res.status(400).send({ status: false, message: `Cannot update status from pending to pending.` })
                }
            const updateStatus = await orderModel.findOneAndUpdate({ _id: orderId }, {$set: { status: status }}, { new: true })
            return res.status(200).send({ status: true, message: `Successfully updated the order details.`, data: updateStatus })
        }
    
       //if order is in completed status then nothing can be changed/updated.
        if (isUserOrder.status == 'completed') 
        return res.status(400).send({ status: false, message: `CanNot Update because it's already in completed status.` })
                
       //if order is already in cancelled status then nothing can be changed/updated.
       if (isUserOrder.status == 'cancelled') 
         return res.status(400).send({ status: false, message: `CanNot Update because it's already in cancelled status.` })
                
            }
        }
        }
    
        } catch (err) {
            return res.status(500).send({ status: false, message: err.message });
        }
    }



module.exports = {orderCreation, updateOrder}