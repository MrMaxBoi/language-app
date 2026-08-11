import express from "express";
import { getLessonContent } from "../controllers/lesson.controller.js";

const router = express.Router();

router.get("/:lessonId/content", getLessonContent);

export default router;
