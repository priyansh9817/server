import express from 'express';
import router from './authRoutes.js';
import { isAdmin, requireSignIn } from '../middleware/authMiddleware.js';
import { CategoryController, CreateCategoryController, deleteCategoryController, SingleCategoryController, UpdateCategoryController } from '../controllers/CreateCategoryController.js';


const route = express.Router()

// routes - Create catogery 
router.post('/create-category',requireSignIn,isAdmin,CreateCategoryController)

//update category
router.put("/update-category/:id",requireSignIn,isAdmin,UpdateCategoryController); // YAHA Pe id ham issliye kiye hue hai ki agar mujhe Update ek particular cheez ko karna hai hai issliye 

//getALl category
router.get("/get-category", CategoryController);

//single category
router.get("/single-category/:slug", SingleCategoryController);

//delete category
router.delete( "/delete-category/:id",requireSignIn,isAdmin,deleteCategoryController);

export default router