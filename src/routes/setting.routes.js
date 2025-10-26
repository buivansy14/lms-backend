import express from 'express';
import {
  authorizedRoles,
  isLoggedIn,
} from '../middlewares/auth.middlewares.js';
import {
  updateSetting,
  getAllSettings,
  getSettingByKey,
} from '../controllers/setting.controller.js';

const router = express.Router();

router.get('/', getAllSettings);
router.get('/:key', getSettingByKey);
router.put('/:key', isLoggedIn, authorizedRoles('ADMIN'), updateSetting);

export default router;
