const express = require('express');
const fs = require('fs');
const router = express.Router();
const bodyParser = require('body-parser');
const Auth = require('../Authentication/isAuth');
const {check,body} = require('express-validator');

/* const path = require('path'); */
/* 
const Canvas = require('canvas');

const rootdir = require('../utils/path'); */


const productsData = require('../controller/products');

router.use(bodyParser.urlencoded({extended:false}));
router.get("/add-product", Auth,productsData.getAddData);
/* router.get("/add-product",(request,response,next) => {
    // response.sendFile(path.join(rootdir,"views",'add-product.html'));
    response.render("add-product");
}) */

router.post("/product",Auth,[
check('title').isLength({min:3,max:30}).withMessage("length of title should be maximum 30 character and minium 3 character "),
body('image').isURL().withMessage('only this file extensions are supported jpg,jpeg,png'),
body('price').isFloat().withMessage('enther only numbers'),
body('desc').isLength({min:3,max:500}).withMessage('length of description should be maximum 100 character and minium 3 character ')
],productsData.postProduct);
router.get("/products",Auth,productsData.getAdminProducts);
router.get("/edit-product/:productId",Auth,productsData.getEditProduct);
router.post("/editProduct",Auth,productsData.postEditData);
router.post("/delete-product",Auth,productsData.deletProduct);
/*
// /*
// 
//  */
// // module.exports = router;

exports.routes = router; 
