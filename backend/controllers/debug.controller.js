import Skill from "../models/skill.model.js";
import Memory from "../models/memory.model.js";
import Attempt from "../models/attempt.model.js";
import Question from "../models/question.model.js";
import QuestionExposure from "../models/questionExposure.model.js";
import Session from "../models/session.model.js";
import KnowledgeCoverage from "../models/knowledgeCoverage.model.js";
import mockQuestions from "../data/questions.js";
import { getSessionQuestions, getLastSelectionReport } from "../services/questionSelection.service.js";

const toMapCounts = (arr, key) => {
  const map = {};
  for (const item of arr) {
    const k = item[key] || "unknown";
    map[k] = (map[k] || 0) + 1;
  }
  return map;
};

const normalizeSubtopicKey = (topic, subtopic) =>
  `${String(topic || "unknown").trim()}||${String(subtopic || "unknown").trim()}`;

const buildCoverageDashboard = (coverages, skills, questions) => {
  const subtopicRecords = {};

  for (const question of questions) {
    const topic = question.topic || "unknown";
    const subtopic = question.subtopic || "unknown";
    const key = normalizeSubtopicKey(topic, subtopic);
    if (!subtopicRecords[key]) {
      subtopicRecords[key] = { topic, subtopic };
    }
  }

  const coverageLookup = (coverages || []).reduce((lookup, coverage) => {
    const key = normalizeSubtopicKey(coverage.topic, coverage.subtopic);
    lookup[key] = coverage;
    return lookup;
  }, {});

  const skillLookup = (skills || []).reduce((lookup, skill) => {
    const key = normalizeSubtopicKey(skill.topic, skill.subtopic);
    lookup[key] = skill.mastery;
    return lookup;
  }, {});

  const coveredSubtopics = [];
  const uncoveredSubtopics = [];
  const masteryBySubtopic = {};
  const exposureCounts = {};
  const topicStats = {};

  for (const key of Object.keys(subtopicRecords)) {
    const { topic, subtopic } = subtopicRecords[key];
    const coverage = coverageLookup[key] || { exposureCount: 0, mastery: 0 };
    const mastery =
      typeof coverage.mastery === "number"
        ? coverage.mastery
        : typeof skillLookup[key] === "number"
        ? skillLookup[key]
        : 0;

    const exposureCount = coverage.exposureCount || 0;
    const isCovered = exposureCount >= 3;

    exposureCounts[key] = exposureCount;
    masteryBySubtopic[key] = mastery;

    if (isCovered) {
      coveredSubtopics.push({ topic, subtopic, exposureCount, mastery, lastSeenAt: coverage.lastSeenAt || null });
    } else {
      uncoveredSubtopics.push({ topic, subtopic, exposureCount, mastery, lastSeenAt: coverage.lastSeenAt || null });
    }

    topicStats[topic] = topicStats[topic] || { total: 0, covered: 0 };
    topicStats[topic].total += 1;
    if (isCovered) topicStats[topic].covered += 1;
  }

  const subtopicCoveragePercent = Object.keys(subtopicRecords).length
    ? (coveredSubtopics.length / Object.keys(subtopicRecords).length) * 100
    : 0;

  const topicCoverage = {};
  let totalTopicPercent = 0;
  let topicCount = 0;
  for (const [topic, stats] of Object.entries(topicStats)) {
    const percent = stats.total > 0 ? (stats.covered / stats.total) * 100 : 0;
    topicCoverage[topic] = { covered: stats.covered, total: stats.total, percent };
    totalTopicPercent += percent;
    topicCount += 1;
  }

  const topicCoveragePercent = topicCount ? totalTopicPercent / topicCount : 0;

  return {
    coveredSubtopics,
    uncoveredSubtopics,
    masteryBySubtopic,
    exposureCounts,
    coverageMetrics: {
      topicCoveragePercent,
      subtopicCoveragePercent,
      totalSubtopics: Object.keys(subtopicRecords).length,
      coveredSubtopics: coveredSubtopics.length,
      uncoveredSubtopics: uncoveredSubtopics.length,
      topicCoverage,
    },
  };
};

export const getLearningState = async (req, res) => {
  try {
    const { userId } = req.params;

    const [skills, memories, recentAttempts, attemptsAll] = await Promise.all([
      Skill.find({ userId }).lean(),
      Memory.find({ userId }).lean(),
      Attempt.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
      Attempt.find({ userId }).lean(),
    ]);

    const questionFrequency = attemptsAll.reduce((acc, a) => {
      const qid = String(a.questionId);
      acc[qid] = (acc[qid] || 0) + 1;
      return acc;
    }, {});

    const topicFrequency = attemptsAll.reduce((acc, a) => {
      const t = a.topic || "unknown";
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});

    const sortedSkills = [...skills].sort((a, b) => a.mastery - b.mastery);
    const weakestTopics = sortedSkills.slice(0, 5).map((s) => ({ topic: s.topic, subtopic: s.subtopic, mastery: s.mastery }));
    const strongestTopics = sortedSkills.slice(-5).reverse().map((s) => ({ topic: s.topic, subtopic: s.subtopic, mastery: s.mastery }));

    res.json({
      userId,
      skills,
      memories,
      recentAttempts,
      questionFrequency,
      topicFrequency,
      weakestTopics,
      strongestTopics,
    });
  } catch (error) {
    console.error("getLearningState error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getSelectionReport = async (req, res) => {
  try {
    const { userId } = req.params;
    const count = parseInt(req.query.count || "5", 10);

    // run selection (debug only; do not persist exposures from a report)
    const selected = await getSessionQuestions(userId, count, { persistExposure: false });
    const report = getLastSelectionReport();

    // Build per-question explanation from selected items (they include score + reasons when debug enabled)
    const explanations = selected.map((q) => ({
      questionId: q.questionId,
      _id: q._id,
      questionText: q.questionText,
      topic: q.topic,
      subtopic: q.subtopic,
      difficulty: q.difficulty,
      exposureCount: q.exposureCount || 0,
      exposurePenalty: q.exposurePenalty || 0,
      finalScore: q.score || null,
      scoreReasons: q.reasons || q.scoreReasons || [],
      // fallback flags from lastSelectionReport if available
      selectionSource: q.selectionSource || (report && report.explorationQuestions && report.explorationQuestions.includes(q.questionId) ? 'exploration' : 'exploitation'),
    }));

    res.json({ userId, count, explanations, report });
  } catch (error) {
    console.error("getSelectionReport error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getAdaptiveHealth = async (req, res) => {
  try {
    const { userId } = req.params;

    // Use last selection snapshot if available
    const report = getLastSelectionReport();

    // Historical metrics from attempts (last 500)
    const attempts = await Attempt.find({ userId }).sort({ createdAt: -1 }).limit(500).lean();

    const totalAttempts = attempts.length;
    const distinctQuestions = new Set(attempts.map((a) => String(a.questionId))).size;
    const topicCounts = attempts.reduce((m, a) => { m[a.topic] = (m[a.topic] || 0) + 1; return m; }, {});

    // repeat rate: fraction of attempts that repeat a question previously seen in the window
    const seen = new Set();
    let repeats = 0;
    for (const a of [...attempts].reverse()) { // iterate oldest->newest
      const qid = String(a.questionId);
      if (seen.has(qid)) repeats += 1; else seen.add(qid);
    }
    const repeatRate = totalAttempts > 0 ? repeats / totalAttempts : 0;

    const explorationRate = report && report.adaptiveInfluence ? (report.adaptiveInfluence.selectedBecauseExploration / (report.stats.selectedQuestions || 1)) : null;

    const difficultyCounts = report ? report.difficultyCounts : null;

    const topicDiversity = Object.keys(topicCounts).length;
    const questionDiversity = distinctQuestions;

    res.json({
      userId,
      repeatRate,
      explorationRate,
      difficultyCounts,
      topicDiversity,
      questionDiversity,
      topicCounts,
      recentSelectionReport: report,
    });
  } catch (error) {
    console.error("getAdaptiveHealth error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getEngineIntelligence = async (req, res) => {
  try {
    const { userId } = req.params;

    const [skills, memories, coverages, exposures, sessions, attempts, dbQuestions] = await Promise.all([
      Skill.find({ userId }).lean(),
      Memory.find({ userId }).lean(),
      KnowledgeCoverage.find({ userId }).lean(),
      QuestionExposure.find({ userId }).lean(),
      Session.find({ userId, status: "completed" }).sort({ completedAt: -1 }).lean(),
      Attempt.find({ userId }).sort({ createdAt: -1 }).lean(),
      Question.find({}).lean(),
    ]);

    const analytics = {
      userId,
      totalSessions: sessions.length,
      averageAccuracy: 0,
      averageRecommendationEffectiveness: 0,
      recentSessions: [],
    };

    let totalCorrect = 0;
    let totalAttempts = 0;
    let totalEffectiveness = 0;
    let effectivenessCount = 0;

    for (const session of sessions) {
      if (session.score) {
        totalCorrect += session.score.correct || 0;
        totalAttempts += session.score.total || 0;
      }
      if (
        session.analytics &&
        session.analytics.recommendationEffectiveness !== undefined
      ) {
        totalEffectiveness += session.analytics.recommendationEffectiveness;
        effectivenessCount += 1;
      }
    }

    analytics.averageAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    analytics.averageRecommendationEffectiveness = effectivenessCount > 0 ? Math.round((totalEffectiveness / effectivenessCount) * 100) : 0;
    analytics.recentSessions = sessions.slice(0, 10).map((session) => ({
      sessionId: session._id,
      completedAt: session.completedAt,
      accuracy: session.score?.percentage || 0,
      recommendationEffectiveness: session.analytics?.recommendationEffectiveness || 0,
      weakTopics: session.analytics?.weakTopics || [],
      strongTopics: session.analytics?.strongTopics || [],
      difficultyCounts: session.analytics?.difficultyCounts || {},
    }));

    const coverageReport = buildCoverageDashboard(
      coverages,
      skills,
      [
        ...dbQuestions.map((question) => ({
          topic: question.topic || "unknown",
          subtopic: question.subtopic || "unknown",
        })),
        ...mockQuestions.map((question) => ({
          topic: question.topic || "unknown",
          subtopic: question.subtopic || "unknown",
        })),
      ]
    );

    const distinctTopics = new Set(attempts.map((attempt) => attempt.topic || "unknown")).size;
    const totalAttemptsCount = attempts.length;
    const topicDiversityRatio = totalAttemptsCount ? distinctTopics / totalAttemptsCount : 0;
    const seenQuestions = new Set();
    let repeats = 0;
    for (const attempt of [...attempts].reverse()) {
      const qid = String(attempt.questionId);
      if (seenQuestions.has(qid)) {
        repeats += 1;
      } else {
        seenQuestions.add(qid);
      }
    }

    const repeatRate = totalAttemptsCount > 0 ? repeats / totalAttemptsCount : 0;
    const diversityScore = Math.min(100, Math.round(topicDiversityRatio * 100));
    const coveragePercent = coverageReport.coverageMetrics.subtopicCoveragePercent || 0;
    const recommendationEffectiveness = analytics.averageRecommendationEffectiveness;

    const report = getLastSelectionReport();
    const topReasons = report?.topReasons || [];

    const weakestTopics = [...skills]
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 5)
      .map((skill) => ({ topic: skill.topic, subtopic: skill.subtopic, mastery: skill.mastery }));

    const strongestTopics = [...skills]
      .sort((a, b) => b.mastery - a.mastery)
      .slice(0, 5)
      .map((skill) => ({ topic: skill.topic, subtopic: skill.subtopic, mastery: skill.mastery }));

    const mostExposedQuestions = [...exposures]
      .sort((a, b) => (b.exposureCount || 0) - (a.exposureCount || 0))
      .slice(0, 10)
      .map((exposure) => ({
        questionId: exposure.questionId,
        exposureCount: exposure.exposureCount || 0,
        lastSeenAt: exposure.lastSeenAt,
      }));

    const learningProgress = {
      avgSkillMastery: skills.length
        ? Math.round((skills.reduce((sum, s) => sum + (s.mastery || 0), 0) / skills.length) * 100) / 100
        : 0,
      avgMemoryStrength: memories.length
        ? Math.round((memories.reduce((sum, m) => sum + (m.strength || 0), 0) / memories.length) * 100) / 100
        : 0,
      coveragePercent,
      timeline: analytics.recentSessions.map((session) => ({
        sessionId: session.sessionId,
        date: session.completedAt,
        accuracy: session.accuracy,
        recommendationEffectiveness: session.recommendationEffectiveness,
        weakTopics: session.weakTopics,
        strongTopics: session.strongTopics,
      })),
    };

    const selectionInsights = {
      topReasons,
      weakestTopics,
      strongestTopics,
      mostExposedQuestions,
    };

    res.json({
      success: true,
      data: {
        skills,
        memories,
        coverage: coverageReport,
        exposure: exposures,
        analytics,
        engineHealth: {
          repeatRate,
          diversityScore,
          coveragePercent,
          recommendationEffectiveness,
        },
        learningProgress,
        selectionInsights,
      },
    });
  } catch (error) {
    console.error("getEngineIntelligence error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getCoverageReport = async (req, res) => {
  try {
    const { userId } = req.params;
    const [coverages, skills, dbQuestions] = await Promise.all([
      KnowledgeCoverage.find({ userId }).lean(),
      Skill.find({ userId }).lean(),
      Question.find({}).lean(),
    ]);

    // Include mock questions in the concept universe
    const allQuestions = [
      ...dbQuestions.map((question) => ({
        topic: question.topic || "unknown",
        subtopic: question.subtopic || "unknown",
      })),
      ...mockQuestions.map((question) => ({
        topic: question.topic || "unknown",
        subtopic: question.subtopic || "unknown",
      })),
    ];

    const coverageReport = buildCoverageDashboard(coverages, skills, allQuestions);

    res.json({
      userId,
      ...coverageReport,
    });
  } catch (error) {
    console.error("getCoverageReport error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
