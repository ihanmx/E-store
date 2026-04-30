const path = require("path");

const express = require("express");
const { body, check } = require("express-validator");

const adminController = require("../controllers/admin");

const isAuth = require("../middleware/is-auth");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// // // /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
  "/add-product",
  [
    body("title")
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters long")
      .trim(),

    body("price").isFloat().withMessage("Price must be a number"),
    body("description")
      .isLength({ min: 3, max: 400 })
      .withMessage("Description must be between 3 and 400 characters long")
      .trim(),
  ],
  isAuth,
  adminController.postAddProduct,
);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  [
    body("title")
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters long")
      .trim(),

    body("price").isFloat().withMessage("Price must be a number"),
    body("description")
      .isLength({ min: 3, max: 400 })
      .withMessage("Description must be between 3 and 400 characters long"),
  ],
  isAuth,
  adminController.postEditProduct,
);

// router.post("/delete-product", isAuth, adminController.postDeleteProduct);
router.delete("/product/:productId", isAuth, adminController.deleteProduct);

module.exports = router;
