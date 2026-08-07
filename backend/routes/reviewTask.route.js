import express from "express";
import { getReviewTask, getReviewTasks } from "../controllers/reviewTask.controller.js";

const router = express.Router();

router.get("/task/:id", getReviewTask);
router.get("/:userId", getReviewTasks);

export default router;
