const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const productsData = require('../controller/products');
const path = require('path');
const rootdir = require('../utils/path');

const Auth = require('../Authentication/isAuth');

router.use(bodyParser.urlencoded({extended:false}));
router.get("/",productsData.getShop);
router.get("/shop/:productId",Auth,productsData.getProduct);
router.post("/add-to-cart",Auth,productsData.postCart);

router.get("/cart",Auth,productsData.getCart);
router.post("/cart-delete-item",Auth,productsData.postDeleteItemCart)
router.post("/create-order",Auth,productsData.postOrders);
router.get("/order",Auth,productsData.getOrders); 
router.get("/logout",Auth,productsData.logoutPage); 
router.get("/order/:orderId",productsData.getInvoice)
/* 
/* 
router.get("/checkout",productsData.getCheckout);
router.get("/index",productsData.getIndex);
router.get("/product-details",productsData.getProductsDetails); */

module.exports = router;