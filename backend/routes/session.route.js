import express from 'express';
import { startSession, submitAnswer, completeSession, getSessionReport, getQuestionAnswer, extendSession } from "../controllers/session.controller.js";

const router = express.Router();

router.post('/start', startSession);

router.get('/questions/:questionId/answer', getQuestionAnswer);

router.post('/:id/answer', submitAnswer);

router.post('/:id/extend', extendSession);

router.post('/:id/complete', completeSession);

router.get('/:id/report', getSessionReport);

export default router;
