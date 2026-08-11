import { buildRoadmapForUser } from "../services/roadmap.service.js";
import { DEFAULT_ROADMAP_ID, getRoadmapById, validateRoadmap } from "../data/roadmap.js";

export const getRoadmap = async (req, res) => {
  try {
    const userId = req.query.userId || "guest";
    const roadmapId = req.query.roadmapId || DEFAULT_ROADMAP_ID;
    const definition = getRoadmapById(roadmapId);

    if (!definition) {
      return res.status(404).json({ success: false, message: "Roadmap not found" });
    }

    const validationIssues = validateRoadmap(roadmapId);
    const roadmap = await buildRoadmapForUser(userId, roadmapId);

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
