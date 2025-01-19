import { Router } from 'express';
import {
  createProgress,
  updateLectureProgress,
} from '../controllers/userCourseProgress.controller.js';
import {
  authorizedRoles,
  isLoggedIn,
} from '../middlewares/auth.middlewares.js';

const router = Router();

router
  .route('/active')
  .post(isLoggedIn, authorizedRoles('ADMIN'), createProgress);

router.route('/updateLecture').post(isLoggedIn, updateLectureProgress);

export default router;
