import AppError from '../../utils/error.util.js';
import asyncHandler from '../middlewares/asyncHAndler.middleware.js';
import Order from '../models/order.model.js';

export const getAllPayment = asyncHandler(async (req, res, next) => {
  try {
    const { count, skip } = req.query;

    const paymentsQuery = Order.find()
      .skip(skip || 0)
      .limit(count || 10);
    const allPayments = await paymentsQuery;

    const totalRevenue = allPayments.reduce((total, payment) => {
      const amount = parseFloat(payment.amount_in);
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const finalMonths = {
      January: 0,
      February: 0,
      March: 0,
      April: 0,
      May: 0,
      June: 0,
      July: 0,
      August: 0,
      September: 0,
      October: 0,
      November: 0,
      December: 0,
    };

    const monthlyWisePayments = allPayments.map((payment) => {
      const monthsInNumbers = new Date(payment.transaction_date); // Sử dụng transaction_date thay vì start_at
      return monthNames[monthsInNumbers.getMonth()]; // Lấy tên tháng
    });

    monthlyWisePayments.forEach((month) => {
      Object.keys(finalMonths).forEach((objMonth) => {
        if (month === objMonth) {
          finalMonths[month] += 1;
        }
      });
    });

    const monthlySalesRecord = Object.keys(finalMonths).map(
      (monthName) => finalMonths[monthName]
    );

    res.status(200).json({
      success: true,
      message: 'All payments',
      allPayments,
      finalMonths,
      monthlySalesRecord,
      totalRevenue,
    });
  } catch (error) {
    return next(new AppError(error.message, 500)); // Bắt lỗi và trả về
  }
});
