import AppError from '../../utils/error.util.js';
import asyncHandler from '../middlewares/asyncHAndler.middleware.js';
import Translation from '../models/translation.model.js';

export const getTranslations = asyncHandler(async (req, res, next) => {
  try {
    const translations = await Translation.find({});

    res.status(200).json({
      success: true,
      translations,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

export const getTranslationsI18n = asyncHandler(async (req, res, next) => {
  try {
    const { lang } = req.params;

    if (!lang) {
      return next(new AppError('Language is required', 400));
    }

    const translations = await Translation.find({});
    const result = translations.reduce((acc, item) => {
      acc[item.key] = item.translations[lang] || item.translations['vi'];
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

export const addTranslation = asyncHandler(async (req, res, next) => {
  const { key, translations } = req.body;

  const existingTranslation = await Translation.findOne({ key });
  if (existingTranslation) {
    return next(new AppError('Translation key already exists', 400));
  }

  const newTranslation = await Translation.create({ key, translations });

  res.status(201).json({
    success: true,
    message: 'Translation added successfully',
    data: newTranslation,
  });
});

export const updateTranslation = asyncHandler(async (req, res, next) => {
  const { key } = req.params;
  const { translations } = req.body;

  const updatedTranslation = await Translation.findOneAndUpdate(
    { key },
    { translations },
    { new: true }
  );

  if (!updatedTranslation) {
    return next(new AppError('Translation not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Translation updated successfully',
    data: updatedTranslation,
  });
});

export const deleteTranslation = asyncHandler(async (req, res, next) => {
  const { key } = req.params;

  const deletedTranslation = await Translation.findOneAndDelete({ key });

  if (!deletedTranslation) {
    return next(new AppError('Translation not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Translation deleted successfully',
  });
});

export const importTranslations = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
      return next(
        new AppError('Invalid data format. Expecting an array.', 400)
      );
    }

    // Lọc trùng key (ưu tiên bản ghi mới nhất)
    const uniqueData = Array.from(
      new Map(data.map((item) => [item.key, item])).values()
    );

    const operations = uniqueData.map((item) => ({
      updateOne: {
        filter: { key: item.key },
        update: {
          $set: {
            key: item.key,
            'translations.en': item.translations?.en || '',
            'translations.vi': item.translations?.vi || '',
            'translations.jp': item.translations?.jp || '',
          },
        },
        upsert: true,
      },
    }));

    await Translation.bulkWrite(operations);

    res.status(200).json({
      success: true,
      message: 'Translations imported successfully',
      count: uniqueData.length,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});
