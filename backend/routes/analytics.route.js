import express from "express";
import { getUserAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

/**
 * GET /api/analytics/:userId
 * Retrieve aggregated analytics for a user
 */
router.get("/:userId", getUserAnalytics);

export default router;
