import { Router } from 'express';
import {
  authorizedRoles,
  isLoggedIn,
} from '../middlewares/auth.middlewares.js';
import {
  createAdminOrder,
  getAllOrders,
  getOrderById,
} from '../controllers/order.controller.js';

const router = Router();

router.route('/get-order-id').get(isLoggedIn, getOrderById);
router.route('/getAll').get(isLoggedIn, authorizedRoles('ADMIN'), getAllOrders);
router
  .route('/create-order-marketplace')
  .post(isLoggedIn, authorizedRoles('ADMIN'), createAdminOrder);

export default router;
