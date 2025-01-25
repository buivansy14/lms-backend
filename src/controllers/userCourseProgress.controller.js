import asyncHandler from '../middlewares/asyncHAndler.middleware.js';
import Course from '../models/course.model.js';
import UserCourseProgress from '../models/userCourseProgress.model.js';
import AppError from '../../utils/error.util.js';

export const createProgress = asyncHandler(async (req, res, next) => {
  const { userId, courseId } = req.body;

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    const lecturesProgress = course.lectures.map((lecture, index) => ({
      lectureId: lecture._id,
      completed: false,
      locked: index !== 0,
    }));

    const progress = await UserCourseProgress.create({
      userId,
      courseId,
      lecturesProgress,
    });

    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Active course successfully ',
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

export const updateLectureProgress = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  try {
    const { courseId, lectureId, preLectureId } = req.body;

    if (!userId || !courseId) {
      return next(
        new AppError('userId, courseId, and lectureId are required', 400)
      );
    }

    const userCourseProgress = await UserCourseProgress.findOne({
      userId,
      courseId,
    });

    if (!userCourseProgress) {
      return next(new AppError('User progress not found', 404));
    }

    const lectureProgressIndex = userCourseProgress.lecturesProgress.findIndex(
      (progress) => progress.lectureId.toString() === lectureId
    );

    const lectureProgressPreIndex =
      userCourseProgress.lecturesProgress.findIndex(
        (progress) => progress.lectureId.toString() === preLectureId
      );

    if (lectureProgressIndex !== -1) {
      userCourseProgress.lecturesProgress[lectureProgressIndex].locked = false;
    }

    if (lectureProgressPreIndex !== -1) {
      userCourseProgress.lecturesProgress[
        lectureProgressPreIndex
      ].locked = false;
      userCourseProgress.lecturesProgress[
        lectureProgressPreIndex
      ].completed = true;
    }

    await userCourseProgress.save();

    res.status(200).json({
      success: true,
      message: 'Lecture progress updated successfully',
      data: { lectureId, preLectureId },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

export const activeCourses = async ({ courseId, userId }) => {
  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return {
        message: 'Khóa học không tồn tại',
        code: 404,
      };
    }

    const lecturesProgress = course.lectures.map((lecture, index) => ({
      lectureId: lecture._id,
      completed: false,
      locked: index !== 0,
    }));

    const progress = await UserCourseProgress.create({
      userId,
      courseId,
      lecturesProgress,
    });

    await progress.save();
  } catch (error) {
    return {
      message: error?.message,
      code: 500,
    };
  }
};
