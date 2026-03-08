const path = require("path");
const express = require("express");
const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");
const router = express.Router();

router.get("/", shopController.getIndex);
router.get("/products", shopController.getProducts);
router.get("/cart", isAuth, shopController.getCart);
router.post("/cart", isAuth, shopController.postCart);
router.post("/cart-delete-item", isAuth, shopController.postCartDeleteProduct);
router.get("/orders", isAuth, shopController.getOrders);

router.get("/products/:productId", shopController.getProduct); //the dynamic route always in the buttom because if i have for example products/anything it would be ignored
// router.post("/create-order", isAuth, shopController.postOrder);
router.get("/orders/:orderId", isAuth, shopController.getInvoice); //the dynamic route always in the buttom because if i have for example orders/anything it would be ignored
router.get("/checkout", isAuth, shopController.getCheckout);
router.get("/checkout/success", isAuth, shopController.getCheckoutSuccess);
router.get("/checkout/cancel", isAuth, shopController.getCheckout);
module.exports = router;
