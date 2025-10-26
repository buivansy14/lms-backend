import { Router } from 'express';
import { isLoggedIn } from '../middlewares/auth.middlewares.js';
import {
  checkTransaction,
  createQR,
  deleteTransaction,
  getPaymentStatus,
  createMarketplaceQR,
  getPaymentStatusByMarketplace,
} from '../controllers/transaction.controller.js';

const router = Router();

router.route('/create-qr').post(isLoggedIn, createQR);
router.route('/create-qr-marketplace').post(isLoggedIn, createMarketplaceQR);
router.route('/delete-transaction').post(isLoggedIn, deleteTransaction);
router.route('/check-transaction').post(isLoggedIn, checkTransaction);
router.route('/get-payment-status').get(isLoggedIn, getPaymentStatus);
router
  .route('/get-payment-status-marketplace')
  .get(isLoggedIn, getPaymentStatusByMarketplace);

export default router;
