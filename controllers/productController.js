import fs from "fs";
import slugify from "slugify";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js"
import formidable from "formidable";
import braintree from "braintree";
import dotenv from "dotenv";

dotenv.config();

//payment gateway
export var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});


export const createProductController = async (req, res) => {
  try {
    console.log("FIELDS:", req.fields);
    console.log("FILES:", req.files);

    const { name, description, price, category, quantity } = req.fields;
    const { photo } = req.files;

    // Ensure all fields are present
    if (!name || !description || !price || !category || !quantity) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const product = new productModel({
      name: name[0],
      description: description[0],
      price: price[0],
      category: category[0],
      quantity: quantity[0],
      slug: slugify(name[0]),
    });

    if (photo && photo[0]) {
      product.photo.data = fs.readFileSync(photo[0].filepath);
      product.photo.contentType = photo[0].mimetype;
    }

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error in createProductController:", error);
    res.status(500).json({
      success: false,
      message: "Product creation failed",
      error,
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

//upate producta
export const updateProductController = async (req, res) => {
  try {
    const fields = req.fields;
    const files = req.files;

    // Normalize fields (handle array inputs)
    const getField = (field) => Array.isArray(field) ? field[0] : field;

    const name = getField(fields.name);
    const description = getField(fields.description);
    const price = getField(fields.price);
    const category = getField(fields.category);
    const quantity = getField(fields.quantity);
    const shipping = getField(fields.shipping);
    const photo = files?.photo;

    // Basic validation
    if (!name || !description || !price || !category || !quantity) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (photo && photo.size > 1_000_000) {
      return res.status(400).json({
        success: false,
        message: "Photo must be less than 1MB",
      });
    }

    // Prepare update data
    const updateData = {
      name,
      description,
      price,
      category,
      quantity,
      shipping,
      slug: slugify(name),
    };

    // Update product
    const product = await productModel.findByIdAndUpdate(
      req.params.pid,
      updateData,
      { new: true }
    );

    // Handle photo
    if (photo) {
      const photoFile = Array.isArray(photo) ? photo[0] : photo;
      product.photo.data = fs.readFileSync(photoFile.filepath);
      product.photo.contentType = photoFile.mimetype;
      await product.save();
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};

// filters
export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Filtering Products",
      error,
    });
  }
};

// product count
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in product count",
      error,
      success: false,
    });
  }
};

// product list base on page
export const productListController = async (req, res) => {
  try {
    const perPage = 3; // Number of products per page
    // Get the page number from request parameters, default to 1 if not provided
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in per page ctrl",
      error,
    });
  }
};
// Search Product
export const searchProductController = async(req,res) => {
  try{
    const {keyword} = req.params;
    const results = await productModel.find({
      $or: [// Search by name or description
        { name: { $regex: keyword, $options: "i" } }, // Case-insensitive search for name
        { description: { $regex: keyword, $options: "i" } }
      ]
    }).select("-photo").populate("category");
    res.json(results)
  }
  catch(error){
    console.error("Error in searchProductController:", error);
    res.status(500).json({
      success: false,
      message: "Error searching products",
      error: error.message,
    });
  }
}
// similar products
export const realtedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while geting related product",
      error,
    });
  }
};

// get prdocyst by catgory
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While Getting products",
    });
  }
};

//payment gateway api
//token
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        console.error("Braintree Token Error:", err); // Add this
        res.status(500).send(err);
      } else {
        res.send({ success: true, clientToken: response.clientToken }); 
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//payment
// export const brainTreePaymentController = async (req, res) => {
//   try {
//     const { nonce, cart } = req.body;  // nonce is the payment method nonce, cart is the array of products

//     if (!nonce || !cart || cart.length === 0) {
//       return res.status(400).json({ success: false, message: "Invalid payment data" });
//     }
//     let total = 0;
//     cart.map((i) => {
//       total += i.price;
//     });
//     gateway.transaction.sale(
//       {
//         amount: total.toFixed(2), // Ensure total is a string with two decimal places
//         paymentMethodNonce: nonce,
//         options: {
//           submitForSettlement: true,
//         },
//       },
//       function (error, result) {
//         if (result) {
//            new orderModel({
//             products: cart,
//             payment: result,
//             buyer: req.user._id,
//           }).save();
//           res.json({ ok: true });
//         } else {
//           res.status(500).send(error);
//         }
//       }
//     );
//   } catch (error) {
//     console.log(error);
//   }
// };

export const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;

    if (!nonce || !cart?.length) {
      return res.status(400).json({ success: false, message: "Invalid payment data" });
    }

    let total = 0;
    cart.forEach((item) => {
      total += item.price;
    });

    gateway.transaction.sale(
      {
        amount: total.toFixed(2), // Required format
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      async function (error, result) {
        if (error) {
          console.error("🔴 Payment Error:", error);
          return res.status(500).send({ success: false, error });
        }

        if (result?.success) {
          await new orderModel({
            products: cart,
            payment: result,
            buyer: req.user?._id || null,
          }).save();

          return res.status(200).send({
            success: true,
            message: "Payment successful",
            result,
          });
        } else {
          return res.status(500).send({
            success: false,
            message: result?.message || "Payment failed",
          });
        }
      }
    );
  } catch (error) {
    console.error("❌ Transaction Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during payment",
      error: error.message,
    });
  }
};
