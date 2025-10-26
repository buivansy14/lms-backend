import Category from '../models/category.model.js';
import asyncHandler from '../middlewares/asyncHAndler.middleware.js';
import AppError from '../../utils/error.util.js';

// @desc    Get all categories
// @route   GET /api/categories
export const getAllCategories = asyncHandler(async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

// @desc    Get category by ID
// @route   GET /api/categories/:id
export const getCategoryById = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) return next(new AppError('Category not found', 404));

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

// @desc    Create new category
// @route   POST /api/categories
export const createCategory = asyncHandler(async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;

    const exists = await Category.findOne({ name });
    if (exists) return next(new AppError('Category already exists', 400));

    const category = await Category.create({
      name,
      description,
      isActive,
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

// @desc    Update category
// @route   PUT /api/categories/:id
export const updateCategory = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return next(new AppError('Category not found', 404));

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
export const deleteCategory = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Category.findByIdAndDelete(id);

    if (!deleted) return next(new AppError('Category not found', 404));

    res
      .status(200)
      .json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});
