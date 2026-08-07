import ReviewTask from "../models/reviewTask.model.js";
import { getActiveReviewTasks, serializeReviewTask } from "../services/reviewTask.service.js";
import { getDailyReviewPreview } from "../services/reviewSessionBuilder.service.js";

export const getReviewTasks = async (req, res) => {
  try {
    const { userId = "guest" } = req.params;
    const tasks = await getActiveReviewTasks(userId);
    const dailyReview = await getDailyReviewPreview(userId, { activeReviewTasks: tasks });

    return res.status(200).json({
      success: true,
      data: {
        userId,
        count: tasks.length,
        tasks,
        dailyReview: {
          mode: dailyReview.mode,
          taskIds: dailyReview.taskIds,
          skillIds: dailyReview.skillIds,
          questionCount: dailyReview.requestedQuestionCount,
          estimatedMinutes: dailyReview.estimatedMinutes,
          summary: dailyReview.summary,
        },
      },
    });
  } catch (error) {
    console.log("error in fetching review tasks:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getReviewTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await ReviewTask.findById(id).lean();

    if (!task) {
      return res.status(404).json({ success: false, message: "Review task not found" });
    }

    return res.status(200).json({
      success: true,
      data: serializeReviewTask(task),
    });
  } catch (error) {
    console.log("error in fetching review task:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
