const express = require('express');
const router = express.Router();

const {createUser, loginUser, getProfile, updateUserProfile} = require("../controllers/userController")
const {createProduct, getProduct, getProductById, updateProduct, deleteProduct} = require("../controllers/productController")
const {addCart, getCart, updateCart, deleteCart} = require("../controllers/cartController")
const {orderCreation, updateOrder} = require("../controllers/orderController")
const {authentication, authorization} = require("../middleware/auth")

//usreApi
router.post("/register", createUser)
router.post("/login", loginUser)
router.get("/user/:userId/profile",authentication,  authorization, getProfile)
router.put("/user/:userId/profile",authentication, authorization, updateUserProfile)

//product api
router.post("/products", createProduct)
router.get("/products", getProduct)
router.get("/products/:productId", getProductById)
router.put("/products/:productId",updateProduct)
router.delete("/products/:productId", deleteProduct)

//cart API
router.post("/users/:userId/cart",authentication, authorization,addCart)
router.put("/users/:userId/cart", authentication, authorization,updateCart)
router.get("/users/:userId/cart",authentication, authorization, getCart)
router.delete("/users/:userId/cart",authentication, authorization, deleteCart)

//order api
router.post("/users/:userId/orders",authentication, authorization, orderCreation)
router.put("/users/:userId/orders", authentication, authorization,updateOrder)



module.exports = router;