import AppError from '../../utils/error.util.js';
import asyncHandler from '../middlewares/asyncHAndler.middleware.js';
import Order from '../models/order.model.js';

export const getOrderById = asyncHandler(async (req, res, next) => {
  const { id } = req.query;
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

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate({
        path: 'userId',
        select: 'fullName email',
      })
      .sort({ transaction_date: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không có đơn hàng nào.',
      });
    }

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
