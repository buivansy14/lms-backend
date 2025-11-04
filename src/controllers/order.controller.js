import AppError from '../../utils/error.util.js';
import asyncHandler from '../middlewares/asyncHAndler.middleware.js';
import Order from '../models/order.model.js';
import User from '../models/usermodel.js';
import Marketplace from '../models/marketplace.model.js';

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

export const createAdminOrder = asyncHandler(async (req, res) => {
  const { marketplaceId, userId } = req.body;

  // 1️⃣ Kiểm tra đầu vào
  if (!marketplaceId || !userId) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu marketplaceId hoặc userId',
    });
  }

  // 2️⃣ Kiểm tra xem user & marketplace có tồn tại không
  const user = await User.findById(userId);
  const marketplace = await Marketplace.findById(marketplaceId);

  if (!user || !marketplace) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy user hoặc marketplace',
    });
  }

  // 3️⃣ Kiểm tra user này đã mua chưa
  const existed = await Order.findOne({ marketplaceId, userId });
  if (existed) {
    return res.status(400).json({
      success: false,
      message: 'Người dùng này đã mua tool này rồi',
    });
  }

  // 4️⃣ Tạo order mới
  const order = await Order.create({
    marketplaceId,
    userId,
    transaction_id: 'MANUAL-' + Date.now(), // tạo ID giả cho admin thêm
    order_id: 'ADMIN-' + Date.now(),
    transaction_date: new Date(),
    amount_in: '0',
    amount_out: '0',
    bank_brand_name: 'Admin',
    account_number: 'Manual Entry',
    transaction_content: `Admin thêm đơn cho ${user.name}`,
  });

  res.status(201).json({
    success: true,
    message: 'Tạo đơn hàng thành công',
    order,
  });
});
