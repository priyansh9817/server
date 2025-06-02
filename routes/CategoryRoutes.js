import express from 'express';
import { isAdmin, requireSignIn } from '../middleware/authMiddleware.js';
import {categoryControlller,createCategoryController,deleteCategoryCOntroller,updateCategoryController,} from '../controllers/CategoryController.js';

const router = express.Router();

// Create category
router.post('/create-category', requireSignIn, isAdmin, createCategoryController);

// Update category
router.put('/update-category/:id', requireSignIn, isAdmin, updateCategoryController);

// Get all categories
router.get('/get-category', categoryControlller);

// // Get single category
// router.get('/single-category/:slug', Singlecategorycontroller);

// Delete category
router.delete('/delete-category/:id', requireSignIn, isAdmin, deleteCategoryCOntroller);

export default router;
