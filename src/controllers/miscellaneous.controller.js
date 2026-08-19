import asyncHandler from '../middlewares/asyncHAndler.middleware.js';
import Contact from '../models/contact.model.js';
import User from '../models/usermodel.js';
import AppError from '../../utils/error.util.js';
import sendEmail from '../../utils/sendEmail.js';

/**
 * @CONTACT_US
 * Lưu tin nhắn vào Database & Gửi email thông báo tới Admin.
 */
export const contactUs = asyncHandler(async (req, res, next) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return next(new AppError('Vui lòng điền đầy đủ Họ tên, Email và Nội dung tin nhắn', 400));
  }

  // 1. Lưu tin nhắn vào cơ sở dữ liệu MongoDB
  let savedContact;
  try {
    savedContact = await Contact.create({
      name,
      email,
      message,
    });
  } catch (dbError) {
    return next(new AppError(dbError.message || 'Lỗi khi lưu thông tin liên hệ', 400));
  }

  // 2. Gửi email thông báo tới Admin (nếu cấu hình SMTP)
  const targetEmail = process.env.CONTACT_US_EMAIL || 'sybuivan1429@gmail.com';
  const subject = `[TechOnline] Tin nhắn liên hệ mới từ: ${name}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0b0f19; color: #ffffff; padding: 20px; text-align: center;">
        <h2 style="margin: 0; color: #f59e0b;">TechOnline LMS - Liên Hệ Mới</h2>
      </div>
      <div style="padding: 24px;">
        <p><strong>Họ và tên:</strong> ${name}</p>
        <p><strong>Email người gửi:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p><strong>Nội dung tin nhắn:</strong></p>
        <div style="background-color: #f8fafc; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px;">
          ${message.replace(/\n/g, '<br />')}
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
        Email này được gửi tự động từ hệ thống website TechOnline.
      </div>
    </div>
  `;

  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USERNAME) {
      await sendEmail(targetEmail, subject, htmlContent);
    }
  } catch (emailError) {
    console.error('Không thể gửi email thông báo (đã lưu vào DB):', emailError.message);
  }

  res.status(200).json({
    success: true,
    message: 'Tin nhắn của bạn đã được gửi thành công!',
    data: savedContact,
  });
});

/**
 * @GET_CONTACT_MESSAGES
 * Lấy danh sách các tin nhắn liên hệ (dành cho Admin).
 */
export const getContactMessages = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = status ? { status } : {};

  const messages = await Contact.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Contact.countDocuments(filter);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    data: messages,
  });
});

/**
 * @USER_STATS
 * Fetches the statistics of the users (total users and active subscribers).
 */
export const userStats = asyncHandler(async (req, res, next) => {
  const allUsersCount = await User.countDocuments();

  const subscribedUsersCount = await User.countDocuments({
    'subscription.status': 'active',
  });

  res.status(200).json({
    success: true,
    message: 'All registered users count',
    allUsersCount,
    subscribedUsersCount,
  });
});
