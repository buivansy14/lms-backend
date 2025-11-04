import { getGoogleDriveDownloadLink } from '../../utils/common.util.js';
import AppError from '../../utils/error.util.js';
import asyncHandler from '../middlewares/asyncHAndler.middleware.js';
import Marketplace from '../models/marketplace.model.js';
import Order from '../models/order.model.js';
import User from '../models/usermodel.js';

/**
 * @desc Get all marketplace items (with optional filters)
 */
export const getAllMarketplace = asyncHandler(async (req, res, next) => {
  try {
    const { name, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    // Tổng số bản ghi
    const total = await Marketplace.countDocuments(filter);

    // Tính skip (bỏ qua bao nhiêu bản ghi)
    const skip = (page - 1) * limit;

    const tools = await Marketplace.find(filter)
      .select(
        'name tagline size tags image price downloads categoryId authorId isFeatured createdAt'
      )
      .populate('categoryId', 'name')
      .populate('authorId', 'name email')
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: tools.length,
      data: tools,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

/**
 * @desc Get single marketplace item by ID
 */
export const getMarketplaceById = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Marketplace.findById(id);

    if (!item) return next(new AppError('Item not found', 404));

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

export const getMarketplaceDetailForUser = asyncHandler(
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      // 🔹 Chỉ lấy tool đã publish và chỉ select các trường public
      const item = await Marketplace.findByIdAndUpdate(
        { _id: id, status: 'published' }, // điều kiện
        { $inc: { views: 1 } }, // cập nhật
        { new: true }
      )
        .select(
          'name tagline description price downloads image images tags categoryId demoUrl size typeFile views downloadUrl createdAt updatedAt installationGuide'
        ) // chỉ các trường public
        .populate('categoryId', 'name description')
        .lean();

      if (!item)
        return next(new AppError('Item not found or not published', 404));

      // 🔹 Mặc định chưa thanh toán
      let isPaid = false;
      let downloadUrl = null;

      if (userId) {
        const payment = await Order.findOne({
          userId,
          marketplaceId: id,
        }).lean();

        if (payment) {
          isPaid = true;
          downloadUrl = item.downloadUrl || null;
        }
      }

      res.status(200).json({
        success: true,
        data: {
          ...item,
          categoryName: item.categoryId?.name || null,
          isPaid,
          downloadUrl: getGoogleDriveDownloadLink(
            downloadUrl || '',
            item.typeFile
          ),
        },
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }
);

export const getMarketplacePublicDetail = asyncHandler(
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const item = await Marketplace.findByIdAndUpdate(
        { _id: id, status: 'published' }, // điều kiện
        { $inc: { views: 1 } }, // cập nhật
        { new: true }
      )
        .select(
          'name tagline description price downloads image images tags categoryId demoUrl size typeFile views createdAt updatedAt installationGuide'
        ) // chỉ các trường public
        .populate('categoryId', 'name description')
        .lean();

      if (!item)
        return next(new AppError('Item not found or not published', 404));

      res.status(200).json({
        success: true,
        data: {
          ...item,
          categoryName: item.categoryId?.name || null,
          isPaid: false,
        },
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }
);

/**
 * @desc Create new marketplace item
 */
export const createMarketplace = asyncHandler(async (req, res, next) => {
  try {
    const {
      name,
      description,
      categoryId,
      price,
      image,
      images,
      demoUrl,
      tags,
      status,
      tagline,
      size,
      typeFile,
      installationGuide,
    } = req.body;

    if (!name || !description || !price)
      return next(new AppError('Missing required fields', 400));

    const item = await Marketplace.create({
      name,
      description,
      categoryId,
      price,
      image,
      images,
      demoUrl,
      tags,
      status,
      tagline,
      size,
      typeFile,
      installationGuide,
    });

    res.status(201).json({
      success: true,
      message: 'Marketplace item created successfully',
      data: item,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

/**
 * @desc Update marketplace item
 */
export const updateMarketplace = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await Marketplace.findById(id);
    if (!item) return next(new AppError('Item not found', 404));
    Object.assign(item, req.body); // ✅ merge toàn bộ field

    const updated = await item.save(); // ✅ chạy validate + hooks

    res.status(200).json({
      success: true,
      message: 'Marketplace item updated',
      data: updated,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

/**
 * @desc Delete marketplace item
 */
export const deleteMarketplace = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await Marketplace.findById(id);
    if (!item) return next(new AppError('Item not found', 404));
    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Marketplace item deleted',
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

/**
 * @desc Publish or archive marketplace item
 */
export const updateStatus = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'published', 'archived'].includes(status))
      return next(new AppError('Invalid status value', 400));

    const item = await Marketplace.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!item) return next(new AppError('Item not found', 404));

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: item,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

export const getMarketplaceUsers = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1️⃣ Kiểm tra Marketplace tồn tại
  const marketplace = await Marketplace.findById(id);
  if (!marketplace) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy Marketplace',
    });
  }

  // 2️⃣ Lấy danh sách user đã mua tool này
  const orders = await Order.find({ marketplaceId: req.params.id })
    .populate('userId')
    .populate('marketplaceId');

  const purchasedUsers = orders.map((o) => o.userId);

  // 3️⃣ Lấy danh sách tất cả user
  const allUsers = await User.find({}, 'name email');

  // 4️⃣ Lọc ra những user chưa mua
  const purchasedIds = purchasedUsers.map((u) => u._id.toString());
  const availableUsers = allUsers.filter(
    (u) => !purchasedIds.includes(u._id.toString())
  );

  // 5️⃣ Trả về kết quả
  res.status(200).json({
    success: true,
    data: {
      purchasedUsers,
      availableUsers,
    },
  });
});
