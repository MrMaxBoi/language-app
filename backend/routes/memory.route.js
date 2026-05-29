import express from "express";
import { getMemoryHealth } from "../controllers/memory.controller.js";

const router = express.Router();

/**
 * GET /api/memory/:userId
 * Retrieve memory health metrics for a user
 */
router.get("/:userId", getMemoryHealth);

export default router;
