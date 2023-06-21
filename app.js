const path = require('path');
const express = require('express');
const fs = require('fs');
const https = require('https');

const session = require("express-session");

const flash = require('connect-flash');

const MongoDBStore = require('connect-mongodb-session')(session);

const adminRoute = require('./routes/admin');

const jwt = require('jsonwebtoken');
const token = jwt.sign({ user: 'Vishal' }, 'secretKey');

const multer = require('multer');

const shopRoute = require('./routes/shop');

const loginRoute = require('./routes/adminLogin');
const User = require('./models/user');

const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');


const app = express();
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
const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.cert');
app.set('view engine', 'ejs')

app.set('views', 'views');

const accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log'),{flags:'a'})

app.use(helmet());
app.use(compression());
app.use(morgan('combined',{stream:accessLogStream}));
//mongodb+srv://Vishalrk:<password>@cluster0.y1iwedf.mongodb.net/

const Mongouri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.y1iwedf.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

const store = new MongoDBStore({
    uri: Mongouri,
    collection: 'sessions'
})

app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store: store }));
app.use(flash());

console.log("CSRF ==> ");

app.use((request, response, next) => {
    
    if (!request.session.user) {
        return next();
    }
    User.findById(request.session.user._id).then(user => {
       
        request.user = user;
        
        next();
        
    }).catch(error => {
        console.log(error);
        next();
    })
    
})



app.use(multer({storage:fileStorage}).single('image'));

app.use(express.static(path.join(__dirname, 'public')));
app.use("/images",express.static(path.join(__dirname, 'images')));;


app.use((request,response,next) => {
    response.locals.isAuthenticate= request.session.isLoggedIn;
    request.token = token;
    response.locals.jwttoken = token;
    console.log(response.locals.jwttoken)
    console.log("response.locals.jwttoken")
    next();
})
app.use("/admin", adminRoute.routes);
app.use(shopRoute);
app.use(loginRoute);



mongoose.connect(Mongouri).then(result => {
    
   
    https.createServer({key:privateKey,cert:certificate},app).listen(process.env.PORT || 3000, error => {
        console.log(error);
    });

}).catch(error => {
    console.log(error)
})