import express from 'express';
import { startSession, submitAnswer, completeSession, getSessionReport } from "../controllers/session.controller.js";

const router = express.Router();

router.post('/start', startSession);

router.post('/:id/answer', submitAnswer);

router.post('/:id/complete', completeSession);

router.get('/:id/report', getSessionReport);

export default router;