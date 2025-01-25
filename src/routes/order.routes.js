import { Router } from 'express';
import { isLoggedIn } from '../middlewares/auth.middlewares.js';
import { getOrderById } from '../controllers/order.controller.js';

const router = Router();

router.route('/get-order-id').get(isLoggedIn, getOrderById);

export default router;
