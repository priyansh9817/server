import express from "express"    // here we can also write in this way instead of const express = require('express');
import dotenv from "dotenv"
//import colors from "colors";
import connectDB from "./db.js";
import morgan from "morgan"; 
import authRoutes from "./routes/authRoute.js"
import cors from "cors";
import categoryRoutes from './routes/CategoryRoutes.js'
import productRoutes from './routes/productRoutes.js'
import formidableMiddleware from "express-formidable";
// dotenv file ke library ko require 
dotenv.config();

// database config
connectDB();
//object reset 
const app = express();  

// Middleware to parse JSON request bodies
// CORS Configuration
app.use(cors({
  origin: "http://localhost:5173", // ✅ Exact frontend origin
  credentials: true               // ✅ Required if you’re sending cookies or using Authorization header
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`➡️ ${req.method} request to ${req.originalUrl}`);
  next();
});
//routes 
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/category', categoryRoutes);
app.use('/api/v1/product', productRoutes);

const PORT = process.env.PORT || 4000 // for env connection 





//rest api
app.get("/", (req, res) => {
  res.send("<h1>Welcome to ecommerce app</h1>");
})



// Start the server
app.listen(PORT,() => {
  console.log("Server is running on port 4000");
});

