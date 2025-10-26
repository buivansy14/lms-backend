import asyncHandler from '../middlewares/asyncHAndler.middleware.js';
import Setting from '../models/setting.model.js';

// Lấy tất cả setting
export const getAllSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.find();
  res.status(200).json({ success: true, data: settings });
});

// Lấy 1 setting theo key
export const getSettingByKey = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const setting = await Setting.findOne({ key });

  if (!setting) {
    return res
      .status(404)
      .json({ success: false, message: 'Setting not found' });
  }

  res.status(200).json({ success: true, data: setting });
});

// Cập nhật hoặc tạo setting
export const updateSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  const updated = await Setting.findOneAndUpdate(
    { key },
    { value },
    { new: true, upsert: true } // nếu chưa có thì tạo mới
  );

  res.status(200).json({ success: true, data: updated });
});
