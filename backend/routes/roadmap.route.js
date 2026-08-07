import express from "express";
import { getRoadmap } from "../controllers/roadmap.controller.js";

const router = express.Router();

router.get("/", getRoadmap);

export default router;
