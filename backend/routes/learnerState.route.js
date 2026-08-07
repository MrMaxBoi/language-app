import express from "express";
import { getLearnerState } from "../controllers/learnerState.controller.js";

const router = express.Router();

router.get("/:userId", getLearnerState);

export default router;
