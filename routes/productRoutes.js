import express from "express";
import {
  createProductController,
  deleteProductController,
  getProductController,
  getSingleProductController,
  productPhotoController,
  productCountController,
  updateProductController,
  productFiltersController,
  productListController,
  searchProductController,
  realtedProductController,
 productCategoryController,
 brainTreePaymentController,
braintreeTokenController,
  
} from "../controllers/productController.js";
import { isAdmin, requireSignIn } from "../middleware/authMiddleware.js";
import formidable from "formidable"; // not express-formidable
import fs from "fs";

const router = express.Router();

// ✅ Custom formidable middleware for robust form parsing
const parseForm = (req, res, next) => {
  const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 }); // 5MB limit

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(400).json({
        success: false,
        message: "Error parsing the form data",
        error: err.message,
      });
    }
    req.fields = fields;
    req.files = files;
    next();
  });
};

// ✅ Create product
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  parseForm,
  createProductController
);

// ✅ Update product
router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  parseForm,
  updateProductController
);

// ✅ Get all products
router.get("/get-product", getProductController);

// ✅ Get single product by slug
router.get("/get-product/:slug", getSingleProductController);

// ✅ Get product photo by ID
router.get("/product-photo/:pid", productPhotoController);

// ✅ Delete product by ID
router.delete("/delete-product/:pid", requireSignIn, isAdmin, deleteProductController);

//filter product
router.post("/product-filters", productFiltersController);

//product count
router.get("/product-count", productCountController);

//product per page
router.get("/product-list/:page", productListController);

// ✅ Search product
router.get("/search/:keyword", searchProductController);
export default router;
//similar product
router.get("/related-product/:pid/:cid", realtedProductController);

//category wise product
router.get("/product-category/:slug", productCategoryController);

//payments routes
//token
router.get("/braintree/token", braintreeTokenController);

//payments
router.post("/braintree/payment", requireSignIn, brainTreePaymentController);