import fs from "fs";
import slugify from "slugify";
import productModel from "../models/productModel.js";
import mongoose from "mongoose";

export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } = req.fields;
    const { photo } = req.files;

    // Field validation
    if (!name || !description || !price || !category || !quantity) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Category ID check
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    // Photo size validation
    if (photo && photo.size > 1000000) {
      return res.status(400).json({
        success: false,
        message: "Photo size should be less than 1MB",
      });
    }

    const product = new productModel({
      name,
      slug: slugify(name),
      description,
      price,
      category,
      quantity,
      shipping,
    });

    // Handle photo if present
    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Error in product creation",
      error: error.message,
    });
  }
};

// Get All Products
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      count: products.length,
      message: "All Products Fetched",
      products,
    });
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).send({
      success: false,
      message: "Error in getting products",
      error: error.message,
    });
  }
};

// Get Single Product
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.error("Error getting single product:", error);
    res.status(500).send({
      success: false,
      message: "Error getting single product",
      error: error.message,
    });
  }
};

// Get Product Photo
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product?.photo?.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    } else {
      return res.status(404).send({ success: false, message: "Photo not found" });
    }
  } catch (error) {
    console.error("Error getting product photo:", error);
    res.status(500).send({
      success: false,
      message: "Error getting photo",
      error: error.message,
    });
  }
};

// Delete Product
export const deleteProductController = async (req, res) => {
  try {
    const deleted = await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    if (!deleted) {
      return res.status(404).send({ success: false, message: "Product not found" });
    }
    res.status(200).send({
      success: true,
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};

// Update Product
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } = req.fields;
    const { photo } = req.files;

    switch (true) {
      case !name:
        return res.status(400).send({ error: "Name is Required" });
      case !description:
        return res.status(400).send({ error: "Description is Required" });
      case !price:
        return res.status(400).send({ error: "Price is Required" });
      case !category:
        return res.status(400).send({ error: "Category is Required" });
      case !quantity:
        return res.status(400).send({ error: "Quantity is Required" });
      case photo && photo.size > 1000000:
        return res.status(400).send({ error: "Photo should be less than 1MB" });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).send({ error: "Invalid category ID" });
    }

    const product = await productModel.findByIdAndUpdate(
      req.params.pid,
      {
        ...req.fields,
        slug: slugify(name),
        category: mongoose.Types.ObjectId(category),
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).send({ success: false, message: "Product not found" });
    }

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();

    res.status(200).send({
      success: true,
      message: "Product Updated Successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};
