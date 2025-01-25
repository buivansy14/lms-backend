import { Router } from 'express';
import { isLoggedIn } from '../middlewares/auth.middlewares.js';
import {
  createQR,
  deleteTransaction,
  getPaymentStatus,
} from '../controllers/transaction.controller.js';

const router = Router();

router.route('/create-qr').post(isLoggedIn, createQR);
router.route('/delete-transaction').post(isLoggedIn, deleteTransaction);
router.route('/get-payment-status').get(isLoggedIn, getPaymentStatus);

export default router;
