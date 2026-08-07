import { buildRoadmapForUser } from "../services/roadmap.service.js";
import { validateRoadmap } from "../data/roadmap.js";

export const getRoadmap = async (req, res) => {
  try {
    const userId = req.query.userId || "guest";
    const validationIssues = validateRoadmap();
    const roadmap = await buildRoadmapForUser(userId);

    return res.status(200).json({
      success: true,
      data: {
        ...roadmap,
        validation: {
          missingSkills: validationIssues,
        },
      },
    });
  } catch (error) {
    console.log("error in fetching roadmap:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
