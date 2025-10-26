import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import {
  authorizedRoles,
  isLoggedIn,
} from '../middlewares/auth.middlewares.js';

const router = express.Router();

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', isLoggedIn, authorizedRoles('ADMIN'), createCategory);
router.put('/:id', isLoggedIn, authorizedRoles('ADMIN'), updateCategory);
router.delete('/:id', isLoggedIn, authorizedRoles('ADMIN'), deleteCategory);

export default router;
