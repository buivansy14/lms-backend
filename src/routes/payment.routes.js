import { Router } from 'express';
import {
  authorizedRoles,
  isLoggedIn,
} from '../middlewares/auth.middlewares.js';
import { getAllPayment } from '../controllers/payment.controller.js';

const router = Router();

router.get(
  '/getAllPayment',
  isLoggedIn,
  authorizedRoles('ADMIN'),
  getAllPayment
);

export default router;
