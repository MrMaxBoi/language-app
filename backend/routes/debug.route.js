import express from 'express';
import { getLearningState, getSelectionReport, getAdaptiveHealth, getCoverageReport, getEngineIntelligence } from '../controllers/debug.controller.js';

const router = express.Router();

router.get('/learning-state/:userId', getLearningState);
router.get('/selection-report/:userId', getSelectionReport);
router.get('/adaptive-health/:userId', getAdaptiveHealth);
router.get('/coverage/:userId', getCoverageReport);
router.get('/engine-intelligence/:userId', getEngineIntelligence);

export default router;
