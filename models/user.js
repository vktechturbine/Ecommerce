/* const getDb = require('../utils/database').getDb;    

const mongodb = require('mongodb');
class User {
    constructor(id, name, email, password, cart) {
        this._id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.cart = cart;

        console.log(this.cart);
        console.log("df")

    }
    save() {
        const db = getDb();
        db.collection('user').insertOne({ name: this.name, email: this.email, password: this.password }).then(result => {
            console.log("User SuccessFully created");
        }).catch(error => {
            console.log(error)
        });
    }
    deleteCartItem(productId) {
        // console.log(productId)
        const updateCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== productId.toString()
        });
        const db = getDb();
        // db.collection('user').find()/
        console.log(updateCartItems);
        return db.collection('user').updateOne({_id:new mongodb.ObjectId(this._id)},{$set:{cart :{items : updateCartItems}}}).then(result => {
            return result;
        }).catch(error=> {
            console.log(error);
        })

    }
   
    addToCart(product) {
        const db = getDb();
        const cartProductIndex = this.cart.items.findIndex(cp => {
            return cp.productId.toString() === product._id.toString();
        });
        console.log(cartProductIndex)
        // const updateCart = {items:[{productId:new mongodb.ObjectId(product._id),quantity:1}]}
        let newQuantity = 1;
        const updateCartItems = [...this.cart.items];
        if (cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updateCartItems[cartProductIndex].quantity = newQuantity;
        }
        else {
            updateCartItems.push({ productId: new mongodb.ObjectId(product._id), quantity: newQuantity });

        }
        const updateCart = { items: updateCartItems };

        return db.collection('user').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: updateCart } }).then(result => {
            const db = getDb();
            return result;
        }).catch(error => {
            console.log(error)
        });
    }
     getCart() {
        const db = getDb();
        console.log("hello")
        console.log(this.cart.items);
        // console.log(user.items);
        const productIds = this.cart.items.map(item => {
            return item.productId;
        })


        return db.collection('products').find({ _id: { $in: productIds } }).toArray().then((products) => {
            return products.map(prod => {
                return {
                    ...prod, quantity: this.cart.items.find((item) => {
                        return item.productId.toString() === prod._id.toString();
                    }).quantity
                }
            })
        })

        // console.log(productIds)
    }
    addtoOrder(){
       const db = getDb();
       console.log()
       return this.getCart().then(products => {
        console.log(products)
        const order = {
         items :products,
         users:{
             _id:new mongodb.ObjectId(this._id),
             name:this.name
         }
        }
            return db.collection('order').insertOne(order).then(result => {
            this.cart = {items:[]}
            return db.collection('user').updateOne({_id:new mongodb.ObjectId(this._id)},{$set:{cart:{items:[]}}});
        });
       })
    }
    getOrder(){
        const db = getDb();
        return db.collection('order').find({'users._id':new mongodb.ObjectId(this._id)}).toArray();
    } 
     static fetchAll() {
        const db = getDb();
        return db.collection('user').find().next().then(user => {
            return user;
        }).catch(error => {
            console.log(error);
        })

    }
     static findById(id) {
        const db = getDb();
        return db.collection('user').findOne({ _id: new mongodb.ObjectId(id) }).then(user => {
            return user;
        }).catch(error => {
            console.log(error);
        })
    }
}

module.exports = User; */


const mongoose = require('mongoose');

const userSchemma = mongoose.Schema({
    name:{
        type: 'string',
        required: true
    },
    email:{
        type:"string",
        required:true
    },
    password:{
        type:"string",
        required:true
    },
    cart:{
        items:[
            {
                productId:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:'Product',
                    require:true
                },
                quantity:{
                    type:Number,
                    require:true
                }
            }
        ]
    }

});
userSchemma.methods.clearCartItems = function(){
    this.cart = {items:[]};
    return this.save();
}
userSchemma.methods.removeFromCart = function(productId){
    const updateCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString();
    });
    this.cart.items = updateCartItems;
    return this.save();
}
userSchemma.methods.addToCart = function(product){
    console.log("object")
    console.log(product);
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });
    console.log(cartProductIndex)
    // const updateCart = {items:[{productId:new mongodb.ObjectId(product._id),quantity:1}]}
    let newQuantity = 1;
    const updateCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updateCartItems[cartProductIndex].quantity = newQuantity;
    }
    else {
        updateCartItems.push({ productId: product._id, quantity: newQuantity });

    }
    const updateCart = { items: updateCartItems };
    this.cart = updateCart;
    return this.save();
}

const User = mongoose.model('User',userSchemma);

module.exports = User;