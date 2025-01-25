import AppError from '../../utils/error.util.js';
import asyncHandler from '../middlewares/asyncHAndler.middleware.js';
import Order from '../models/order.model.js';

export const getOrderById = asyncHandler(async (req, res, next) => {
  const { id } = req.query;
  console.log({ id });
  try {
    const order = await Order.findById(id);
    if (!order) {
      return next('Giao dịch không tồn tại', 404);
    }
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});
