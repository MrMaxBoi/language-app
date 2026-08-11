import { getLessonContentById } from "../data/lessonContent/index.js";
import { getRoadmapLessonById } from "../data/roadmap.js";

export const getLessonContent = async (req, res) => {
  const { lessonId } = req.params;
  const lesson = getRoadmapLessonById(lessonId);

  if (!lesson) {
    return res.status(404).json({ success: false, message: "Lesson not found" });
  }

  const content = getLessonContentById(lessonId);
  if (!content) {
    return res.status(404).json({ success: false, message: "Lesson content is not ready yet" });
  }

  return res.status(200).json({
    success: true,
    data: {
      ...content,
      roadmapId: lesson.roadmapId,
      primarySkillIds: lesson.primarySkillIds,
      conceptIds: lesson.conceptIds,
    },
  });
};
