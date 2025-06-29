import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [      // Array of product IDs
      // Each product is referenced by its ObjectId from the Products collection
      // This allows for a many-to-many relationship between orders and products
      // Each product in the order is represented by its ObjectId
      {
        type: mongoose.ObjectId, // Reference to the Product in the order
        ref: "Products",
      },
    ],
    payment: {},
    buyer: {

      type: mongoose.ObjectId, // Reference to the User who made the order
      ref: "users",
    },
    status: {
      type: String,
      default: "Not Process",
      enum: ["Not Process", "Processing", "Shipped", "deliverd", "cancel"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);


//