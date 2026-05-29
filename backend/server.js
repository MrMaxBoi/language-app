import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cron from "node-cron";

import { connectDB } from "./config/db.js";
import { applyMemoryDecay } from "./services/decay.service.js";

import sessionRoutes from "./routes/session.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import memoryRoutes from "./routes/memory.route.js";
import recommendationsRoutes from "./routes/recommendations.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

const __dirname = path.resolve();

app.use(cors());
app.use(express.json()); // to accept json data in req.body

app.use('/api/sessions', sessionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/recommendations', recommendationsRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/dist")));
    app.get('/{*any}', (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}

app.listen(PORT, () => {
    if (process.env.NODE_ENV !== "test") {
        connectDB();
    }
    console.log(`Server is running at http://localhost:${PORT}`);
});
