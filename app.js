const path = require('path');
const express = require('express');


const session = require("express-session");

const flash = require('connect-flash');

const MongoDBStore = require('connect-mongodb-session')(session);

const adminRoute = require('./routes/admin');
const multer = require('multer');

const app = express();

const shopRoute = require('./routes/shop');

const loginRoute = require('./routes/adminLogin');
const User = require('./models/user');

const mongoose = require('mongoose');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}


const Mongouri = 'mongodb://localhost:27017/online_shop';

const store = new MongoDBStore({
    uri: Mongouri,
    collection: 'sessions'
})


app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store: store }));
app.use(flash());

console.log("CSRF ==> ");
// request.session.user._id  = null;
app.use((request, response, next) => {
    
    if (!request.session.user) {
        return next();
    }
    User.findById(request.session.user._id).then(user => {
        //    console.log(user);
        request.user = user;
        next();
        
    }).catch(error => {
        console.log(error);
        next();
    })
    
})

app.set('view engine', 'ejs')

app.set('views', 'views');


app.use(multer({storage:fileStorage}).single('image'));
/* app.use(express.static('public')); */
app.use(express.static(path.join(__dirname, 'public')));
app.use("/images",express.static(path.join(__dirname, 'images')));;

app.use("/admin", adminRoute.routes);
app.use(shopRoute);
app.use(loginRoute);



mongoose.connect(Mongouri).then(result => {
    console.log(result)
    /*     User.findOne().then((user) => {
            if(!user)
            {
                const user = new User( {
                    name : "Vishal",
                    email:"vishalkerlekar5@gmail.com",
                    password:"tech1mini",
                    cart:{
                        items:[]
                    }
                });
                user.save();
            }
        }).catch(error => {
            console.log(error);
        })
        ,function() {
            console.log("server")
        }); */
    app.listen(3000, error => {
        console.log(error);
    });

}).catch(error => {
    console.log(error)
})