/* const { where } = require('sequelize');
const mongodb = require('mongodb');
const getDb = require('../utils/database').getDb;

class Product {
    constructor(id,title,image,price,desc,userId){
        this.id = id;
        this.title = title;
        this.image = image;
        this.price = price;
        this.desc = desc;
        this.userId = userId;
    }
    save(){
        console.log(this);
        const db = getDb();
        console.log(this)
        // console.log("id : "+this.id)
        if(this.id)
        {

            return db.collection('products').updateOne({_id:this.id},{$set:{title:this.title,image:this.image,price:this.price,desc:this.desc,userId:this.userId}}).then((result) => {
                return result;
            }).catch(error => {
                console.log(error);
            })
        }
        else{
            return db.collection('products').insertOne({title:this.title,image:this.image,price:this.price,desc:this.desc,userId:this.userId}).then((result) => {
                return result;
            }).catch(error => {
                console.log(error);
            })
        }
            // console.log("Data insertec Success Fully");
        }
    
    static fetchAll(){
        const db = getDb();
        return db.collection('products').find().toArray().then(products => {
            return products;
        }).catch(error => {
            console.log(error);
        });
    }
    static findById(id){
        const db = getDb();
        return db.collection('products').find({_id:new mongodb.ObjectId(id)}).next().then(product => {
            return product;
            // console.log(product);
        }).catch(error => {
            console.log(error);
        });
    }
    static deleteById(id){
        const db = getDb();
        console.log(id)
        return db.collection('products').deleteOne({_id:new mongodb.ObjectId(id)}).then(result => {
        return result;
        }).catch(error => {
            console.log(error);
        });
    }
}

module.exports = Product; */


const mongoose = require('mongoose');

const productSchemma   =  mongoose.Schema({
    title:{
        type:String,
        require:true
    },
    image:{
        type:String,
        require:true
    },
    price:{
        type:Number,
        require:true
    },
    desc:{
        type:String,
        require:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        require:true
    }
});

const Product =  mongoose.model('Product',productSchemma);
module.exports = Product;