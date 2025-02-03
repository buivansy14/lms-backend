import { Router } from 'express';
import {
  authorizedRoles,
  isLoggedIn,
} from '../middlewares/auth.middlewares.js';
import { getAllOrders, getOrderById } from '../controllers/order.controller.js';

const router = Router();

router.route('/get-order-id').get(isLoggedIn, getOrderById);
router.route('/getAll').get(isLoggedIn, authorizedRoles('ADMIN'), getAllOrders);

export default router;
