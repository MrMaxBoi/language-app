import fs from "fs";
import path from "path";

import questions from "../data/questions.js";
import { buildSkillQuestionCoverage } from "../data/skillGraph.js";

const TARGETS = {
  foundation: 5,
  core: 10,
  "early-intermediate": 5,
  unmapped: 1,
};

const getTargetForSkill = (skill) => {
  if (skill.strand === "Foundation") return TARGETS.foundation;
  if (skill.level === "early-intermediate") return TARGETS["early-intermediate"];
  if (skill.level === "core") return TARGETS.core;
  return TARGETS.core;
};

const buildGapReport = () => {
  const coverage = buildSkillQuestionCoverage(questions);
  const skills = coverage.bySkill
    .map((skill) => {
      const target = getTargetForSkill(skill);
      const questionCount = skill.questionCount || 0;
      return {
        skillId: skill.id,
        skillName: skill.name,
        strand: skill.strand,
        domain: skill.domain,
        level: skill.level,
        jlptLevel: skill.jlptLevel,
        questionCount,
        target,
        gap: Math.max(0, target - questionCount),
        status: questionCount >= target ? "ready" : questionCount > 0 ? "thin" : "empty",
        prerequisites: skill.prerequisites,
      };
    })
    .sort((a, b) => b.gap - a.gap || a.strand.localeCompare(b.strand) || a.skillId.localeCompare(b.skillId));

  const summary = skills.reduce(
    (acc, skill) => {
      acc.totalTargetQuestions += skill.target;
      acc.currentQuestions += skill.questionCount;
      acc.totalGap += skill.gap;
      acc.byStatus[skill.status] = (acc.byStatus[skill.status] || 0) + 1;
      acc.byStrand[skill.strand] = acc.byStrand[skill.strand] || {
        skills: 0,
        currentQuestions: 0,
        targetQuestions: 0,
        gap: 0,
      };
      acc.byStrand[skill.strand].skills += 1;
      acc.byStrand[skill.strand].currentQuestions += skill.questionCount;
      acc.byStrand[skill.strand].targetQuestions += skill.target;
      acc.byStrand[skill.strand].gap += skill.gap;
      return acc;
    },
    {
      totalSkills: skills.length,
      currentQuestions: 0,
      totalTargetQuestions: 0,
      totalGap: 0,
      byStatus: {},
      byStrand: {},
      generatedFallbackCount: coverage.generatedFallbackCount,
    }
  );

  return {
    generatedAt: new Date().toISOString(),
    targets: TARGETS,
    summary,
    skills,
    topGaps: skills.filter((skill) => skill.gap > 0).slice(0, 20),
  };
};

const renderMarkdown = (report) => {
  const lines = [
    "# Skill Question Gap Report",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Summary",
    "",
    `- Skills: ${report.summary.totalSkills}`,
    `- Current mapped questions: ${report.summary.currentQuestions}`,
    `- Target questions: ${report.summary.totalTargetQuestions}`,
    `- Question gap: ${report.summary.totalGap}`,
    `- Generated fallback mappings: ${report.summary.generatedFallbackCount}`,
    "",
    "## Strand Gaps",
    "",
    "| Strand | Skills | Current | Target | Gap |",
    "|---|---:|---:|---:|---:|",
    ...Object.entries(report.summary.byStrand)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([strand, stats]) => `| ${strand} | ${stats.skills} | ${stats.currentQuestions} | ${stats.targetQuestions} | ${stats.gap} |`),
    "",
    "## Top Skill Gaps",
    "",
    "| Skill | Strand | Level | Current | Target | Gap |",
    "|---|---|---|---:|---:|---:|",
    ...report.topGaps.map(
      (skill) =>
        `| ${skill.skillName} | ${skill.strand} | ${skill.level} | ${skill.questionCount} | ${skill.target} | ${skill.gap} |`
    ),
    "",
    "## Full Skill Table",
    "",
    "| Skill ID | Skill | Strand | Current | Target | Gap | Status |",
    "|---|---|---|---:|---:|---:|---|",
    ...report.skills
      .slice()
      .sort((a, b) => a.strand.localeCompare(b.strand) || b.gap - a.gap || a.skillId.localeCompare(b.skillId))
      .map(
        (skill) =>
          `| ${skill.skillId} | ${skill.skillName} | ${skill.strand} | ${skill.questionCount} | ${skill.target} | ${skill.gap} | ${skill.status} |`
      ),
    "",
  ];

  return `${lines.join("\n")}\n`;
};

const writeFile = (filePath, content) => {
  const absolutePath = path.resolve(filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content);
  return absolutePath;
};

const report = buildGapReport();
const args = new Set(process.argv.slice(2));

console.log("Skill question gap summary:");
console.log(JSON.stringify(report.summary, null, 2));
console.log("\nTop gaps:");
for (const skill of report.topGaps.slice(0, 10)) {
  console.log(`- ${skill.skillName}: ${skill.questionCount}/${skill.target} (${skill.gap} needed)`);
}

if (args.has("--write")) {
  const jsonPath = writeFile("backend/tests/SKILL_QUESTION_GAP_REPORT.json", JSON.stringify(report, null, 2));
  const markdownPath = writeFile("backend/tests/SKILL_QUESTION_GAP_REPORT.md", renderMarkdown(report));
  console.log(`\nWrote JSON report: ${jsonPath}`);
  console.log(`Wrote Markdown report: ${markdownPath}`);
}

