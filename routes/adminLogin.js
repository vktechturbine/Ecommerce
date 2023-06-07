
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const productsData = require('../controller/products');
const {check,body} = require('express-validator');
const User = require('../models/user');
const bcrypt = require("bcryptjs");
router.get('/admin/login',productsData.getLogin);
router.get('/admin/signup',productsData.getSignUp);
router.post('/checkLogin',[check('email').isEmail().withMessage("please enter valid email").custom(value =>{ 
    return User.findOne({email: value}).then(user => {
        if(!user){
            return Promise.reject("Please Sign Up first then login");
        }
    })
}).trim(),body('password').custom((value,{req} )=> {
    return User.findOne({email:req.body.email}).then(user => {
        return bcrypt.compare(value, user.password)
       /*  if(user.password !== req.body.password){
    } */
    
    
}).then(match => {
        if(!match){
            return Promise.reject("Wrong Password !! please enter Valid Password ");
        }
        return true;
        
    })
}).trim()
],productsData.postLogin);
router.post('/admin/adduser',[check('email').isEmail().withMessage("please enter valid email").custom((value,{req}) => {
    /* if(value === 'test@test.com'){
        throw new Error("This Email address is Forbidden");
    }
    return true; */
    return User.findOne({email:value}).then(userDoc => {
        if(userDoc)
        {
            return Promise.reject("This email address is already in use");

        } 
    })
}).normalizeEmail(),
body('password').isLength({min:8}).withMessage('please enter a password with only numbers and text and at least 8 characters').isAlphanumeric().trim(),
body('confirmPassword').custom((value,{req}) => {
    if(value !== req.body.password){
        throw new Error("Passwords do not match");
    }
    return true;
}).trim()
],productsData.postSignUp);
router.get('/admin/passwordRest',productsData.getPasswordRest)
router.post('/admin/reset_password',productsData.resetPassword);
router.post('/admin/reset_password_request',productsData.updatePassword)
module.exports = router;