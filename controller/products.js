const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");
const { error } = require("console");
const bcrypt = require("bcryptjs");
const fileHelper = require("../utils/file");
const pdfCreate = require("pdfkit");

const image_per_page = 4;
// const image_per_page = 4;

const { validationResult } = require("express-validator");
/* Sendgrid Email  */
const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");
const { ObjectId } = require("mongodb");

const mailer = nodemailer.createTransport(
  sendGridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

exports.getAddData = (request, response, next) => {
  const path = request.url;
  console.log("object");
  response.render("admin/edit-product", {
    path: path,
    editing: false,
    errorMessage: [],
  });
};
exports.postProduct = (request, response) => {
  // const user = request.user._id;

  const title = request.body.title;
  const image = request.file;
  const price = request.body.price;
  const desc = request.body.desc;
  const userId = request.user;

  const errors = validationResult(request);
  console.log("object");
  console.log(request.body);
  /* if(!errors.isEmpty())
    {
        return response.status(422).render('admin/edit-product.ejs',{editing: false,isAuthenticate: false,path:request.url,errorMessage:errors.array(),oldInput:{
            title:title,
            image:image,
            price:price,
            desc:desc
        }});
    } */
  console.log(image);
  // console.log(userId);
  const product = new Product({
    title: title,
    image: image.path,
    price: price,
    desc: desc,
    userId: userId,
  });
  //    console.log("object")
  product
    .save()
    .then((result) => {
      response.redirect("/");
    })
    .catch((error) => {
      console.log(error);
    });
};
exports.getAdminProducts = (request, response) => {
  const path = request.url;
  const page = +request.query.page || 1;
  let totalNumber_of_products;
  Product.find().count().then(numberOfProducts => {
    totalNumber_of_products = numberOfProducts;
    return Product.find().skip((page - 1) * image_per_page).limit(image_per_page);
  }).then((products) => {
      // console.log(products);
      response.render("admin/products.ejs", {
        products: products,
        path: path,
        error: false,
        pageTitle: "Shop",
        totalProducts: totalNumber_of_products,
        hasNextProdut: image_per_page * page < totalNumber_of_products,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalNumber_of_products / image_per_page),
        currentPage: page,
      });
    })
    .catch((error) => {
      console.log(error);
    });
};
exports.getShop = (request, response, next) => {
  console.log("==>>" + request.session.isLoggedIn);
  const page = +request.query.page || 1;
  let totalNumber_of_products;
  const path = request.url;
  console.log(request.isLoggedin);
  Product.find()
    .count()
    .then((numberofProducts) => {
      totalNumber_of_products = numberofProducts;
      return Product.find()
        .skip((page - 1) * image_per_page)
        .limit(image_per_page);
    })
    .then((products) => {
      // console.log(products);
      response.render("shop/shop.ejs", {
        products: products,
        path: path,
        error: false,
        pageTitle: "Shop",
        isAuthenticate: request.session.isLoggedIn,
        totalProducts: totalNumber_of_products,
        hasNextProdut: image_per_page * page < totalNumber_of_products,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalNumber_of_products / image_per_page),
        currentPage: page,
      });
    })
    .catch((error) => {
      console.log(error);
    });
};
exports.getProduct = (request, response) => {
  const productId = request.params.productId;

  const path = request.url;

  const currentPath = "/shop/" + productId;

  // console.log(productId);

  Product.findById(productId)
    .then((product) => {
      // console.log(product)
      response.render("shop/product-details.ejs", {
        products: product,
        path: path,
        currentPath: currentPath,
        isAuthenticate: request.isLoggedin,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getLogin = (request, response) => {
  const path = request.url;

  const message = request.flash("error");
  console.log(
    "=================== start error message =========================="
  );
  console.log(message);
  console.log(
    "=================== end error message =========================="
  );
  /*    console.log(request.get('Cookie').split("=")[1])
       const isLoggedIn = request.get('Cookie').split("=")[1] === 'true'; */
  // request.session.isLoggedIn = isLoggedIn;
  // console.log(isLoggedIn)
  // console.log(request.isLoggedIn)
  console.log("==>" + request.session.isLoggedIn);

  response.render("adminRegister/adminLoginRegister.ejs", {
    path: path,
    errorMessage: [],
    oldInput: {
      email: "",
      password: "",
    },
  });
};
exports.getSignUp = (request, response) => {
  const path = request.url;
  response.render("adminRegister/signup.ejs", {
    path: path,
    isAuthenticate: false,
    errorMessage: [],
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
};
exports.postSignUp = (request, response) => {
  const username = request.body.username;
  const email = request.body.email;
  const password = request.body.password;
  const confirmPassword = request.body.confirmPassword;

  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    // return
    console.log(errors.array());

    return response.status(422).render("adminRegister/signup.ejs", {
      isAuthenticate: false,
      path: request.url,
      errorMessage: errors.array(),
      oldInput: {
        username: username,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
    });
  }

  if (password === confirmPassword) {
    User.findOne({ email: email })
      .then((user) => {
        console.log(user);
        if (user) {
          return response.redirect("/admin/signup");
        }
        return bcrypt.hash(password, 12);
      })
      .then((hashPassword) => {
        const users = new User({
          name: username,
          email: email,
          password: hashPassword,
          cart: {
            items: [],
          },
        });
        return users.save();
      })
      .then((result) => {
        response.redirect("/admin/login");
        return mailer.sendMail({
          to: email,
          from: "vkerlekar@techturbine.com",
          subject: "Welcome to Shop",
          text: "hello",
          html: "<h1>Successfully signup</h1>",
        });
      })
      .then((result) => {
        console.log("Successfully signed");
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    console.log("confirm password is not same");
    response.redirect("/admin/signup");
  }
};
exports.logoutPage = (request, response) => {
  request.session.destroy();
  response.redirect("/admin/login");
};
exports.postLogin = (request, response) => {
  const email = request.body.email;
  const password = request.body.password;
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    // return
    console.log(errors.array());

    return response.status(422).render("adminRegister/adminLoginRegister.ejs", {
      isAuthenticate: false,
      path: request.url,
      errorMessage: errors.array(),
      oldInput: {
        email: email,
        password: password,
      },
    });
  }
  if (email !== "" && password !== "") {
    User.findOne({ email: email }).then((user) => {
      if (!user) {
        request.flash("error", "Invalid email");
        return response.redirect("/admin/login");
      }

      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          console.log(doMatch);
          if (doMatch) {
            request.session.isLoggedIn = true;
            request.session.isJwtTokenValid = request.token;
            request.session.user = user;
            return request.session.save((error) => {
              console.log(error);
              response.redirect("/");
            });
          }
          request.flash("error", "Invalid password");
          response.redirect("/");
        })
        .catch((error) => {
          console.log("error");
          response.redirect("/admin/login");
        });
    });
    /* request.session.isLoggedIn = true;
        console.log(request.session.isLoggedIn)
        response.redirect('/');*/
    response.setHeader("Set-Cookie", "loggedIn=true");
  } else {
    request.flash("error", "Invalid email and password");
    response.redirect("/admin/login");
  }
};
exports.getEditProduct = (request, response, next) => {
  console.log("Hello");

  const editmode = request.query.edit;
  // console.log(editmode)
  const path = request.url;
  // console.log(path);
  const activePath = path.slice(0, 13);
  // console.log(activePath);

  const productId = request.params.productId;
  console.log(productId);
  Product.findById(productId)
    .exec()
    .then((product) => {
      // console.log(product);
      response.render("admin/edit-product", {
        path: activePath,
        editing: editmode,
        products: product,
      });
    })
    .catch((error) => {
      console.log(error);
    });
  /* request.user.getProducts({ where: { id: productID } }).then(result => {
       //    console.log(result[0]);
   }).catch(err => {
       console.log(err)
   }) */
};
exports.postEditData = (request, response, next) => {
  const user = request.user;
  const id = request.body.productId;
  const title = request.body.title;
  const image = request.body.image;
  const price = request.body.price;
  const desc = request.body.desc;
  console.log(id);
  Product.updateOne(
    { _id: id },
    {
      $set: {
        title: title,
        image: image,
        price: price,
        desc: desc,
      },
    }
  )
    .then((result) => {
      response.redirect("/admin/products");
    })
    .catch((error) => console.log(error));
  /* const product = new Product(
     {
         _id:id,
         title :title,
         image:image,
         price:price,
         desc :desc
     }); */
  /*  product.save().then((result) => {
 
     response.redirect('/admin/products');
     console.log("Updated Successfully");
 }).catch(error => {
     console.log(error);
    }); */
  /*  request.user.getProducts({ where: { id: id } }).then(product => {
         product.id = id;
         product.title = title;
         product.image = image;
         product.price = price;
         product.desc = desc;
         return product.save();
     }).then(() => {
         console.log("Product Updated Successfully");
     }).catch((error) => {
 
     }) */
};

exports.getCart = (request, response, next) => {
  const path = request.url;
  let price = 0;
  // console.log(request.user);
  request.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      for (let product of products) {
        price = price + product.productId.price * product.quantity;
      }
      // console.log(price)
      response.render("shop/cart.ejs", {
        products: products,
        path: path,
        error: false,
        pageTitle: "Cart",
        subtotal: price,
        isAuthenticate: request.isLoggedin,
      });
    })
    .catch((error) => {
      console.log(error);
    });
  /* .then(products => {
        console.log(products.quantity)
        for(let product of products){
            price = price + product.quantity * product.price;
        }
    }).catch(error => {
        console.log(error)
    }); */
  // Product.findById(products.productId).then(result => {
  //     console.log(result);
  // })
  /* let results = Product.findById(prods).then(result => {
        return result;
    })
 */
};
exports.deleteProduct = (request, response, next) => {
  const productID = request.params.productId;
  console.log(productID)
  Product.findOne({ _id: productID }).then((product) => {
    if (!product) {
      throw next(new Error("Product not found"));
    }
    fileHelper(product.image);
    return Product.deleteOne({ _id: productID })
      .then((result) => {
        console.log(result);
        response.status(200).json({message:"Success!"})
        // response.redirect("/admin/products");
        // response.redirect("/");
      })
      .catch((error) => {
        console.log("Record Failed to Delete");
        response.status(500).json({message:"Deleting Product Failed"});
      });
  });
};
exports.postCart = (request, response, next) => {
  // console.log(request.user);

  const proId = request.body.productId;

  Product.findById(proId)
    .then((product) => {
      console.log("productsss");
      // console.log(product)
      return request.user.addToCart(product);
    })
    .then((user) => {
      console.log(user);
      response.redirect("/cart");
    })
    .catch((error) => {
      console.log("error");
    });
};
exports.getOrders = (request, response, next) => {
  const path = request.url;

  Order.find({ "user.userId": request.user._id })
    .then((order) => {
      response.render("shop/order", {
        path: path,
        products: order,
        isAuthenticate: request.isLoggedin,
      });
    })
    .catch((error) => {
      console.log(error);
    });
  /* request.user.populate('cart.items.productId').execPopulate().then(user => {
        const products = user.cart.items.map(p => {
            return{quantity: p.quantity,products: p.productId}
        });

        const order = new Order({
            user:{
                name:request.user.name,
                userId:request.user
            },
            products:products
        })
        order.save();
    }).catch(error => console.log(error)) */
  /* request.user.getOrder().then(product => {
        for(let prod of product){
            console.log(prod.items)
        }
        console.log("product.items");
    }).catch(error => {
        console.log(error);
    }) */
};
exports.postOrders = (request, response) => {
  request.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((p) => {
        // console.log(p.quantity);
        return { quantity: p.quantity, product: p.productId._doc };
      });
      // console.log(products);
      const order = new Order({
        user: {
          name: request.user.name,
          userId: request.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((order) => {
      return request.user.clearCartItems();
    })
    .then((result) => {
      response.redirect("/");
    })
    .catch((error) => console.log(error));
};
exports.getCheckout = (request, response, next) => {
  const path = request.url;
  response.render("shop/checkout.ejs", {
    pageTitle: "Checkout",
    path: path,
    isAuthenticate: request.isLoggedin,
  });
};
exports.getIndex = (request, response, next) => {
  const path = request.url;
  response.render("shop/index.ejs", {
    pageTitle: "index",
    path: path,
    isAuthenticate: request.isLoggedin,
  });
};
exports.getProductsDetails = (request, response, next) => {
  const path = request.url;

  response.render("shop/product-details.ejs", {
    pageTitle: "Product Details",
    path: path,
    isAuthenticate: request.isLoggedin,
  });
};
exports.postDeleteItemCart = (request, response, next) => {
  const prodId = request.body.productID;
  request.user
    .removeFromCart(prodId)
    .then((result) => {
      response.redirect("/cart");
    })
    .catch((error) => {
      console.log(error);
    });

  /*  const cart = request.user.cart;
     request.user.deleteCartItem(prodId).then(result => {
         console.log('Product Remove From Cart')
     }).catch(error => {
         console.log(error);
     }) */
  /*   console.log(prodId);
      CartItem.destroy({ where: { productId: prodId } }).then(() => {
          console.log("item Removed Successfully");
          response.redirect('/cart');
      }).catch(error => {
          console.log(error);
      });
   */
};
exports.resetPassword = (request, response) => {
  console.log(request.body.Email);
  const email = request.body.Email;
  User.findOne({ email: email })
    .then((user) => {
      response.render("adminRegister/Password_rest.ejs", {
        request: true,
        Email: email,
      });
    })
    .catch((error) => {
      console.log(error);
    });
};
exports.getPasswordRest = (request, response) => {
  // console.log(request.body);

  response.render("adminRegister/Password_rest.ejs", { request: false });
};
exports.updatePassword = (request, response) => {
  console.log(request.body);
  const email = request.body.Email;
  const pass = request.body.Pass;
  console.log(pass);
  bcrypt
    .hash(pass, 12)
    .then((haspass) => {
      return User.updateOne({ email: email }, { $set: { password: haspass } });
    })
    .then((result) => {
      console.log("successfully password updated");
      response.redirect("/admin/login");
    })
    .catch((error) => {
      console.log(error);
    });
  /* User.findOne({email:email}).then(user => {
         console.log(user)
          user.updateOne({_id:user._id},{$set:{password:pass}}).then(resutl =>{
             console.log("successfully password updated")
         }); */
  /*  }).catch(error => {
         console.log(error)
     }) */
  /* User.updateOne({where:{email:email}},{$set:{password:pass}}).then((result) => {
        console.log("Password SuccessFully Updated")
    }).catch(error => {
        console.log(error);
    }) */
};
exports.getInvoice = (request, response, next) => {
  const orderId = request.params.orderId;
  const invoiceName = "invoice-" + orderId + ".pdf";
  const invoicePath = path.join("data", "Invoices", invoiceName);

  console.log("object");
  Order.find({ _id: orderId })
    .then((order) => {
      if (!order) {
        return next(new Error("orders not founds"));
      }
      if (order[0].user.userId.toString() !== request.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }
      /* fs.readFile(invoicePath,(error,data) =>{
            if(error){
                return next(error);
            }
            response.setHeader('Content-Type','application/pdf');
            response.setHeader('Content-Disposition','inline;filename="'+invoiceName+'"');
            response.send(data);
        } ) */
      /* const file = fs.createReadStream(invoicePath);
        response.setHeader('Content-Type','application/pdf');
        response.setHeader('Content-Disposition','inline;filename="'+invoiceName+'"');
        file.pipe(response); */
      const pdfGenerate = new pdfCreate();
      response.setHeader("Content-Type", "application/pdf");
      response.setHeader(
        "Content-Disposition",
        'inline;filename="' + invoiceName + '"'
      );
      pdfGenerate.pipe(fs.createWriteStream(invoicePath));

      pdfGenerate.pipe(response);

      pdfGenerate.image("images/shopify.png", {
        width: 30,
        align: "left",
      });

      pdfGenerate.text(`#Order ID : ${order[0]._id}`, {
        color: "red",
        width: 410,
        align: "left",
      });
      pdfGenerate.fontSize(45);
      pdfGenerate.end();
    })
    .catch((error) => {
      console.log(error);
    });
};
