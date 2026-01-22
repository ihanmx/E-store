
const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  req.user.createProduct({
      title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
  })

  

  // Product.create({
  //   title: title,
  //   price: price,
  //   imageUrl: imageUrl,
  //   description: description,
  //   userId:req.user.id,
  // })
    .then((result) => {
      //console.log(result);
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
  // const product = new Product(null, title, imageUrl, description, price); //null is the id to activate save() new product mode
  // product
  //   .save()
  //   .then(() => {
  //     res.redirect("/");
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit; //even if the val is boolean it treated as string in query

  if (!editMode) {
    res.redirect("/");
  }

  const prodId = req.params.productId;

  Product.findByPk(prodId).then((product) => {
    if (!product) {
      return res.redirect("/");
    }
     res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product,
    });}).catch((err)=>{
      console.log(err);
    });

  // Product.findbyId(prodId, (product) => {
  //   if (!product) {
  //     res.redirect("/");
  //   }
  //   res.render("admin/edit-product", {
  //     pageTitle: "Edit Product",
  //     path: "/admin/edit-product",
  //     editing: editMode,
  //     product: product,
  //   });
  // });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  Product.findByPk(prodId).then((product) => {
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.imageUrl = updatedImageUrl;
    product.description = updatedDesc;
    return product.save(); //returning the promise to avoid nesting catch and then
  }).then((result) =>{  //this then relates to the save promise
    console.log("UPDATED PRODUCT!");
      res.redirect("/admin/products");
  }).catch((err)=>{
    console.log(err);
  });




  // const updatedProduct = new Product(
  //   prodId,
  //   updatedTitle,
  //   updatedImageUrl,
  //   updatedDesc,
  //   updatedPrice
  // );

  // updatedProduct.save();


};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId).then((product)=>{
    return product.destroy();
  }).then((result)=>{
    console.log("DESTROYED PRODUCT");
    res.redirect("/admin/products");
  }).catch((err)=>{
    console.log(err);
  });
  // Product.deleteById(prodId);

  // res.redirect("/admin/products");
};

exports.getProducts = (req, res, next) => {

  Product.findAll().then((products)=>{
       res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    })


  }).catch((err)=>{
      console.log(err);
    });
  // Product.fetchAll((products) => {
  //   res.render("admin/products", {
  //     prods: products,
  //     pageTitle: "Admin Products",
  //     path: "/admin/products",
  //   });
  // });
};
