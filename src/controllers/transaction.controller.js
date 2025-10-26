import { v4 as uuidv4 } from 'uuid';

import asyncHandler from '../middlewares/asyncHAndler.middleware.js';
import Transaction from '../models/transaction.model.js';
import axios from 'axios';
import Order from '../models/order.model.js';
import { activeCourses } from './userCourseProgress.controller.js';
import Course from '../models/course.model.js';
import Marketplace from '../models/marketplace.model.js';
import AppError from '../../utils/error.util.js';

export const createQR = asyncHandler(async (req, res, next) => {
  const { message, courseId } = req.body;

  const transactionId = uuidv4().slice(0, 8);

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return next(new AppError('Course with given id does not exist', 500));
    }
    const amount = course?.price;
    const transaction = new Transaction({
      transactionId,
      amount,
      message,
    });

    await transaction.save();

    const qr = `https://qr.sepay.vn/img?acc=103869790238&bank=VietinBank&amount=${amount}&des=SEVQR+Don+Hang+${transactionId}&template=compact`;

    res.status(200).json({
      success: true,
      qrUrl: qr,
      transactionId,
      amount,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

export const createMarketplaceQR = asyncHandler(async (req, res, next) => {
  const { message, marketplaceId } = req.body;

  const transactionId = uuidv4().slice(0, 8);

  try {
    const marketplace = await Marketplace.findById(marketplaceId);

    if (!marketplace) {
      return next(
        new AppError('Marketplace with given id does not exist', 500)
      );
    }
    const amount = marketplace?.price;
    const transaction = new Transaction({
      transactionId: `PAY${transactionId}`,
      amount,
      message,
    });

    await transaction.save();

    const qr = `https://qr.sepay.vn/img?acc=103869790238&bank=VietinBank&amount=${amount}&des=SEVQR+Don+Hang+PAY${transactionId}&template=compact`;

    res.status(200).json({
      success: true,
      qrUrl: qr,
      transactionId: `PAY${transactionId}`,
      amount,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

export const deleteTransaction = asyncHandler(async (req, res, next) => {
  const { transactionId } = req.body;

  try {
    const transaction = await Transaction.findOneAndDelete({ transactionId });

    if (!transaction) {
      return next(new AppError('Transaction not found', 404));
    }

    res.status(200).json({
      success: true,
      message: `Transaction ${transactionId} has been deleted successfully`,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

export const checkTransaction = asyncHandler(async (req, res, next) => {
  const { transactionId } = req.body;

  try {
    const transaction = await Transaction.findOne({ transactionId });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction found',
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

export const getPaymentStatus = asyncHandler(async (req, res, next) => {
  const { transactionId, courseId } = req.query;
  const { id } = req.user;
  if (!courseId || !transactionId) {
    res.status(400).json({
      message: 'Đã có lỗi xảy ra',
    });
  }
  try {
    const result = await checkPaymentStatus(transactionId, id, courseId);
    res.status(200).json({
      result,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

export const getPaymentStatusByMarketplace = asyncHandler(
  async (req, res, next) => {
    const { transactionId, marketplaceId } = req.query;
    const { id } = req.user;
    if (!marketplaceId || !transactionId) {
      res.status(400).json({
        message: 'Đã có lỗi xảy ra',
      });
    }
    try {
      const result = await checkPaymentStatusByMarketplace(
        transactionId,
        id,
        marketplaceId
      );
      res.status(200).json({
        result,
      });
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
  }
);

export const checkPaymentStatusByMarketplace = async (
  transactionId,
  userId,
  marketplaceId
) => {
  try {
    const response = await axios.get(
      'https://my.sepay.vn/userapi/transactions/list',
      {
        params: {
          account_number: process.env.VIETIN_BANK,
          limit: 20,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TOKEN}`,
        },
      }
    );

    const transactions = response.data.transactions;

    const matchingTransaction = transactions.find((transaction) =>
      transaction.transaction_content.includes(transactionId)
    );

    if (matchingTransaction) {
      const order = await Order.create({
        ...matchingTransaction,
        order_id: transactionId,
        transaction_id: matchingTransaction.id,
        userId,
        marketplaceId,
      });

      const marketplace = await Marketplace.findByIdAndUpdate(
        marketplaceId,
        { $inc: { downloads: 1 } }, // tăng download lên 1
        { new: true } // trả về document sau khi cập nhật
      )
        .select('name downloadUrl price downloads')
        .lean();

      return {
        status: 'success',
        id: order?._id,
        marketplace: {
          name: marketplace?.name,
          downloadUrl: marketplace?.downloadUrl, // ✅ đường dẫn tải
          price: marketplace?.price,
        },
      };
    } else {
      return { status: 'failed', message: 'Chưa thanh toán thành công' };
    }
  } catch (error) {
    console.error('Lỗi khi gọi API:', error);
    return { status: 'error', message: 'Lỗi khi kiểm tra thanh toán' };
  }
};

const checkPaymentStatus = async (transactionId, userId, courseId) => {
  try {
    const response = await axios.get(
      'https://my.sepay.vn/userapi/transactions/list',
      {
        params: {
          account_number: process.env.VIETIN_BANK,
          limit: 20,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TOKEN}`,
        },
      }
    );

    const transactions = response.data.transactions;

    const matchingTransaction = transactions.find((transaction) =>
      transaction.transaction_content.includes(transactionId)
    );

    if (matchingTransaction) {
      const order = await Order.create({
        ...matchingTransaction,
        order_id: transactionId,
        transaction_id: matchingTransaction.id,
        userId,
        courseId,
      });

      await activeCourses({ courseId, userId });

      return { status: 'success', id: order?._id };
    } else {
      return { status: 'failed', message: 'Chưa thanh toán thành công' };
    }
  } catch (error) {
    console.error('Lỗi khi gọi API:', error);
    return { status: 'error', message: 'Lỗi khi kiểm tra thanh toán' };
  }
};
