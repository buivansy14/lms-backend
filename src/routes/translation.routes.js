import { Router } from 'express';
import {
  addTranslation,
  deleteTranslation,
  getTranslations,
  getTranslationsI18n,
  importTranslations,
  updateTranslation,
} from '../controllers/translation.controller.js';

const router = Router();

router.get('/get-translations', getTranslations);
router.get('/get-translations-i18n/:lang', getTranslationsI18n);
router.post('/add-translation', addTranslation);
router.post('/import-translations', importTranslations);
router.put('/update-translation/:key', updateTranslation);
router.delete('/delete-translation/:key', deleteTranslation);

export default router;
