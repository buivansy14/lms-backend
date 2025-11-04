import { Router } from 'express';

import {
  createMarketplace,
  getMarketplaceById,
  getAllMarketplace,
  deleteMarketplace,
  updateMarketplace,
  getMarketplaceDetailForUser,
  getMarketplacePublicDetail,
  getMarketplaceUsers,
} from '../controllers/marketplace.controllers.js';
import {
  authorizedRoles,
  isLoggedIn,
} from '../middlewares/auth.middlewares.js';

const router = Router();

router
  .route('/')
  .get(getAllMarketplace)
  .post(isLoggedIn, authorizedRoles('ADMIN'), createMarketplace);

router.route('/detail/:id').get(getMarketplacePublicDetail);
router
  .route('/detail/:id/for-user')
  .get(isLoggedIn, getMarketplaceDetailForUser);

router
  .route('/:id')
  .get(isLoggedIn, authorizedRoles('ADMIN'), getMarketplaceById)
  .put(isLoggedIn, authorizedRoles('ADMIN'), updateMarketplace)
  .delete(isLoggedIn, authorizedRoles('ADMIN'), deleteMarketplace);

router
  .route('/:id/users')
  .get(isLoggedIn, authorizedRoles('ADMIN'), getMarketplaceUsers);

export default router;
