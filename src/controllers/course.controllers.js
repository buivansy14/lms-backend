import cloudinary from 'cloudinary';
import fs from 'fs/promises';

import asyncHandler from '../middlewares/asyncHAndler.middleware.js';
import Course from '../models/course.model.js';
import AppError from '../../utils/error.util.js';
import UserCourseProgress from '../models/userCourseProgress.model.js';
import mongoose from 'mongoose';
import User from '../models/usermodel.js';

/**
 * @GET_ALL_COURSES
 * Fetches all courses excluding lectures.
 */

export const getAllCourse = asyncHandler(async (req, res, next) => {
  try {
    const courses = await Course.aggregate([
      {
        $project: {
          title: 1,
          description: 1,
          category: 1,
          thumbnail: 1,
          lectures: { $slice: ['$lectures', 1] },
          numberOfLectures: 1,
          oldPrice: 1,
          price: 1,
          createdBy: 1,
          createdAt: 1,
          updatedAt: 1,
          totalDuration: {
            $reduce: {
              input: '$lectures',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.lecture.duration'] },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'usercourseprogresses',
          localField: '_id',
          foreignField: 'courseId',
          as: 'students',
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          category: 1,
          thumbnail: 1,
          lectures: 1,
          numberOfLectures: 1,
          oldPrice: 1,
          price: 1,
          createdBy: 1,
          createdAt: 1,
          updatedAt: 1,
          totalDuration: 1,
          totalStudents: { $size: '$students' },
        },
      },
    ]);
    res.status(200).json({
      success: true,
      message: 'All course',
      courses,
    });
  } catch (error) {
    return next(new AppError(e.message, 500));
  }
});

export const getAllCourseUser = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  try {
    const coursesUser = await UserCourseProgress.find({ userId });
    const courseIds = coursesUser.map((course) => course.courseId);

    const coursesMatch = await Course.aggregate([
      {
        $match: {
          _id: { $in: courseIds.map((id) => new mongoose.Types.ObjectId(id)) },
        },
      },
      {
        $lookup: {
          from: 'usercourseprogresses',
          localField: '_id',
          foreignField: 'courseId',
          as: 'students',
        },
      },
      {
        $addFields: {
          isActive: true, // Thêm field mặc định isActive với giá trị true
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          category: 1,
          thumbnail: 1,
          lectures: { $slice: ['$lectures', 1] },
          numberOfLectures: 1,
          oldPrice: 1,
          price: 1,
          createdBy: 1,
          createdAt: 1,
          updatedAt: 1,
          totalDuration: {
            $reduce: {
              input: '$lectures',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.lecture.duration'] },
            },
          },
          totalStudents: { $size: '$students' },
          isActive: 1, // Hiển thị field `isActive` trong kết quả
        },
      },
    ]);

    const coursesNotMatched = await Course.aggregate([
      {
        $match: {
          _id: { $nin: courseIds.map((id) => new mongoose.Types.ObjectId(id)) },
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          category: 1,
          thumbnail: 1,
          lectures: { $slice: ['$lectures', 1] },
          numberOfLectures: 1,
          createdBy: 1,
          createdAt: 1,
          updatedAt: 1,
          oldPrice: 1,
          price: 1,
          totalDuration: {
            $reduce: {
              input: '$lectures',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.lecture.duration'] },
            },
          },
        },
      },
      {
        $addFields: {
          isActive: false,
        },
      },
      {
        $lookup: {
          from: 'usercourseprogresses',
          localField: '_id',
          foreignField: 'courseId',
          as: 'students',
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          category: 1,
          thumbnail: 1,
          lectures: 1,
          numberOfLectures: 1,
          oldPrice: 1,
          price: 1,
          createdBy: 1,
          createdAt: 1,
          updatedAt: 1,
          totalDuration: 1,
          totalStudents: { $size: '$students' },
        },
      },
    ]);
    res.status(200).json({
      success: true,
      message: 'Courses categorized by status',
      data: {
        activeCourses: coursesMatch,
        inactiveCourses: coursesNotMatched,
      },
    });
  } catch (error) {
    console.log(error.message);
    return next(new AppError(error.message, 500));
  }
});
/**
 * @GET_LECTURES_BY_COURSE_ID
 * Fetches lectures for a specific course.
 */
export const getLecturesByCourseId = asyncHandler(async (req, res, next) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.user.id;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const lecture = course.lectures.find(
      (lec) => lec._id.toString() === lectureId
    );
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found',
      });
    }

    const progress = await UserCourseProgress.findOne({ userId, courseId });
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Bạn chưa đăng ký khóa học này.',
      });
    }

    const lectureProgress = progress.lecturesProgress.find(
      (lec) => lec.lectureId.toString() === lectureId
    );
    if (lectureProgress?.locked) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không được phép truy cập bài giảng này.',
      });
    }

    const courseContent = course.lectures.map((lec, index) => {
      return {
        title: lec.title,
        completed: progress.lecturesProgress[index].completed,
        locked: progress.lecturesProgress[index].locked,
        id: lec._id,
        duration: lec.lecture.duration,
      };
    });
    const completedLectures = progress.lecturesProgress.filter(
      (lec) => lec.completed
    ).length;
    const totalLectures = course.lectures.length;

    const response = {
      courseTitle: course.title,
      title: lecture.title,
      description: lecture.description,
      videoId: lecture.lecture.public_id,
      thumbnailUrl: lecture.lecture?.thumbnail_url,
      courseContent,
      completedLectures,
      totalLectures,
    };

    res.status(200).json({
      success: true,
      lecture: response,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});
/**
 * @CREATE_COURSE
 * Creates a new course and optionally uploads a thumbnail image.
 */
export const createCourse = asyncHandler(async (req, res, next) => {
  const { title, description, category, createdBy, oldPrice, price } = req.body;
  if (!title || !description || !category || !createdBy) {
    return next(new AppError('Alll fields are required ', 400));
  }

  const course = await Course.create({
    title,
    description,
    category,
    createdBy,
    oldPrice,
    price,
    thumbnail: {
      public_id: 'Dummy',
      secure_url: 'Dummy',
    },
  });

  if (!course) {
    return next(
      new AppError('Course could not created please try again  ', 500)
    );
  }
  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: 'lms',
      });
      if (result) {
        course.thumbnail.public_id = result.public_id;
        course.thumbnail.secure_url = result.secure_url;
      }
      fs.rm(`uploads/${req.file.filename}`);
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course created sucesssfully ',
      course,
    });
  }
});
/**
 * @UPDATE_COURSE_BY_ID
 * Updates an existing course by ID.
 */
export const updateCourse = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findByIdAndUpdate(
      id,
      {
        $set: req.body,
      },
      {
        runValidators: true,
      }
    );
    if (!course) {
      return next(new AppError('Course with given id does not exist', 500));
    }
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
  res.status(200).json({
    success: true,
    message: 'Course Updated sucesssfully ',
  });
});
/**
 * @DELETE_COURSE_BY_ID
 * Deletes a course by its ID.
 */
export const removeCourse = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return next(new AppError('Course with given id does not exist', 500));
    }

    await Course.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Course Removed sucesssfully ',
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});
/**
 * @ADD_LECTURE
 * Adds a lecture to a course and uploads video to Cloudinary.
 */
export const addLectureToCourseById = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;

  const { id } = req.params;

  if (!title || !description) {
    return next(new AppError('All fields are required ', 400));
  }

  const course = await Course.findById(id);

  if (!course) {
    return next(new AppError('course are not exist', 500));
  }

  const lectureData = {
    title,
    description,
    lecture: {},
  };
  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: 'lms',
        resource_type: 'video',
      });

      if (result) {
        lectureData.lecture.duration = result.duration;
        lectureData.lecture.public_id = result.public_id;
        lectureData.lecture.secure_url = result.secure_url;

        const thumbnailUrl = cloudinary.v2.url(result.public_id, {
          resource_type: 'video',
          type: 'upload',
          width: 700,
          height: 400,
          crop: 'fill',
          fetch_format: 'jpg',
        });

        lectureData.lecture.thumbnail_url = thumbnailUrl;
      }
      fs.rm(`uploads/${req.file.filename}`);
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
    course.lectures.push(lectureData);

    course.numberOfLectures = course.lectures.length;

    await course.save();

    const addedLecture = course.lectures[course.lectures.length - 1];

    await syncLectureWithProgress(id, addedLecture._id);

    res.status(200).json({
      success: true,
      message: 'Lecture created and synced successfully!',
      course,
    });
  }
});
/**
 * @REMOVE_LECTURE
 * Removes a lecture from a course by its ID and deletes the video from Cloudinary.
 */
export const removeLecture = asyncHandler(async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const lectureId = req.params.lectureId;

    const course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    // Find the index of the lecture in the array
    const lectureIndex = course.lectures.findIndex(
      (lecture) => lecture._id.toString() === lectureId
    );

    if (lectureIndex === -1) {
      return next(new AppError('Lecture not found', 404));
    }
    // Delete the lecture from cloudinary
    await cloudinary.v2.uploader.destroy(
      course.lectures[lectureIndex].lecture.public_id,
      {
        resource_type: 'video',
      }
    );
    // Remove the lecture from the array
    course.lectures.splice(lectureIndex, 1);
    course.numberOfLectures -= 1;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Lecture removed successfully',
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

const syncLectureWithProgress = async (courseId, lectureId) => {
  try {
    if (!lectureId) {
      throw new Error('Lecture ID is undefined or null');
    }

    const userProgressList = await UserCourseProgress.find({ courseId });

    for (const progress of userProgressList) {
      if (!Array.isArray(progress.lecturesProgress)) {
        progress.lecturesProgress = [];
      }

      const lectureExists = progress.lecturesProgress.some(
        (lecture) => lecture?.lectureId?.toString() === lectureId.toString()
      );

      if (!lectureExists) {
        progress.lecturesProgress.push({
          lectureId,
          completed: false,
          locked: true,
        });
        await progress.save();
      }
    }

    console.log(
      `Lecture ${lectureId} synced successfully for course ${courseId}`
    );
  } catch (error) {
    console.error('Error syncing lecture with user progress:', error.message);
    throw new Error('Failed to sync lecture with user progress');
  }
};

export const getCoursesWithUsers = asyncHandler(async (req, res, next) => {
  try {
    const allUsers = await User.find({}, '_id email fullName').exec();

    const result = await Course.aggregate([
      {
        $lookup: {
          from: 'usercourseprogresses',
          localField: '_id',
          foreignField: 'courseId',
          as: 'userProgress',
        },
      },
      {
        $unwind: {
          path: '$userProgress',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userProgress.userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $group: {
          _id: '$_id',
          course: { $first: '$$ROOT' },
          users: {
            $push: {
              $cond: [
                { $ifNull: ['$userProgress', false] },
                {
                  userId: '$userProgress.userId',
                  email: { $arrayElemAt: ['$userDetails.email', 0] },
                  fullName: { $arrayElemAt: ['$userDetails.fullName', 0] },
                },
                null,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0, // Loại bỏ _id của khóa học
          courseId: '$_id',
          courseTitle: '$course.title',
          courseDescription: '$course.description',
          courseCategory: '$course.category',
          coursePrice: '$course.price',
          users: {
            $filter: {
              input: '$users',
              as: 'user',
              cond: { $ne: ['$$user', null] },
            },
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    result.forEach((course) => {
      const registeredUsersIds = course.users.map((user) =>
        user.userId.toString()
      );

      const unregisteredUsers = allUsers.filter(
        (user) => !registeredUsersIds.includes(user._id.toString())
      );

      course.unregisteredUsers = unregisteredUsers;
    });

    res.status(200).json({
      success: true,
      message: 'Courses with registered and unregistered users',
      result,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

export const getSecureVideo = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;

  console.log(`lms/${videoId}`);

  const video = await Course.findOne({
    'lectures.lecture.public_id': `lms/${videoId}`,
  }).select('lectures.lecture.public_id');

  if (!video) {
    return next(new AppError('Video not found', 404));
  }

  try {
    const signedUrl = cloudinary.v2.url(`lms/${videoId}`, {
      resource_type: 'video',
      format: 'm3u8',
      sign_url: true,
      secure: true,
    });

    res.status(200).json({
      success: true,
      message: 'Video URL generated successfully',
      videoUrl: signedUrl,
    });
  } catch (error) {
    return next(
      new AppError('Error generating video URL: ' + error.message, 500)
    );
  }
});
