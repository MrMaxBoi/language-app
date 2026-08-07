import express from "express";
import { explainRecommendations, getHomeRecommendation } from "../controllers/recommendations.controller.js";

const router = express.Router();

/**
 * GET /api/recommendations/explain/:userId
 * Explain why questions are recommended
 */
router.get("/explain/:userId", explainRecommendations);
router.get("/home/:userId", getHomeRecommendation);

export default router;
