const path = require("path");

const express = require("express");

const shopController = require("../controllers/shop");

const router = express.Router();

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/cart", shopController.getCart);
router.post("/cart", shopController.postCart);
router.post("/cart-delete-item", shopController.postCartDeleteProduct);

router.get("/orders", shopController.getOrders);

router.get("/checkout", shopController.getCheckout);

router.get("/products/:productId", shopController.getProduct); //the dynamic route always in the buttom because if i have for example products/anything it would be ignored
router.post("/create-order", shopController.postOrder);
module.exports = router;
