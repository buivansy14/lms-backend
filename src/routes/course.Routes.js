import { Router } from 'express';

import {
  getAllCourse,
  getLecturesByCourseId,
  createCourse,
  updateCourse,
  removeCourse,
  addLectureToCourseById,
  removeLecture,
  getAllCourseUser,
  getCoursesWithUsers,
  getSecureVideo,
  getInfoLectures,
} from '../controllers/course.controllers.js';
import {
  authorizedRoles,
  authorizedSubscriber,
  isLoggedIn,
} from '../middlewares/auth.middlewares.js';
import upload from '../middlewares/multer.middleware.js';

const router = Router();
/**
 * @route GET /courses
 * @description Get all courses
 * @access Public
 */
router
  .route('/')
  .get(getAllCourse)
  .post(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    upload.single('thumbnail'),
    createCourse
  );

router.route('/user').get(isLoggedIn, getAllCourseUser);
/**
 * @route GET, PUT, DELETE /courses/:id
 * @description Get, update, or remove a course by ID
 * @access Admin only
 */
router
  .route('/:id')
  .put(isLoggedIn, authorizedRoles('ADMIN'), updateCourse)
  .delete(isLoggedIn, authorizedRoles('ADMIN'), removeCourse)
  .post(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    upload.single('lecture'),
    addLectureToCourseById
  );
/**
 * @route DELETE /courses/:courseId/lectures/:lectureId
 * @description Remove a specific lecture from a course
 * @access Admin only
 */
router
  .route('/:courseId/lectures/:lectureId')
  .get(
    isLoggedIn,
    // authorizedSubscriber,
    authorizedRoles('ADMIN'),
    getLecturesByCourseId
  )
  .delete(isLoggedIn, authorizedRoles('ADMIN'), removeLecture);

router
  .route('/getCoursesWithUsers')
  .get(isLoggedIn, authorizedRoles('ADMIN'), getCoursesWithUsers);

router.route('/getSecureVideo/lms/:videoId').get(isLoggedIn, getSecureVideo);
router.route('/getInfoLectures/:courseId').get(getInfoLectures);

export default router;
