import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Progress,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useSessionStore } from "../store/sessionStore";

const formatPercent = (value) => `${Math.round(Number(value) || 0)}%`;

const getSkillBadge = (status) => {
  if (status === "strong") return { label: "Strong", color: "green" };
  if (status === "needs_review") return { label: "Review", color: "orange" };
  if (status === "steady") return { label: "Steady", color: "blue" };
  return { label: "New", color: "gray" };
};

const getDifficultyColor = (difficulty) => {
  if (difficulty === "hard") return "red";
  if (difficulty === "medium") return "purple";
  return "green";
};

const getDifficultyStats = ({ data, difficulty, answers }) => {
  if (typeof data === "number") {
    return {
      total: data,
      correct: null,
      accuracy: 0,
    };
  }

  const matchingAnswers = answers.filter((answer) => answer.difficulty === difficulty);
  const total = data?.total || matchingAnswers.length;
  const correct = data?.correct;
  const rawAccuracy = data?.accuracy || 0;
  const accuracy = rawAccuracy <= 1 ? Math.round(rawAccuracy * 100) : Math.round(rawAccuracy);

  return {
    total,
    correct,
    accuracy,
  };
};

const MetricCard = ({ label, value, helpText, tone = "blue" }) => (
  <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="md" p={5}>
    <Text fontSize="sm" color="gray.500" fontWeight="semibold">
      {label}
    </Text>
    <Heading size="lg" color={`${tone}.600`} mt={2}>
      {value}
    </Heading>
    {helpText ? (
      <Text fontSize="sm" color="gray.600" mt={2}>
        {helpText}
      </Text>
    ) : null}
  </Box>
);

const ReportPage = () => {
  const navigate = useNavigate();
  const report = useSessionStore((state) => state.report);
  const fetchReport = useSessionStore((state) => state.fetchReport);
  const [isLoading, setIsLoading] = useState(!report);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadReport = async () => {
      if (report) return;

      setIsLoading(true);
      const result = await fetchReport();
      if (!result.success) {
        setError(result.message || "Could not load the latest session report.");
      }
      setIsLoading(false);
    };

    loadReport();
  }, [fetchReport, report]);

  if (isLoading) {
    return (
      <Flex minH="60vh" align="center" justify="center">
        <VStack spacing={4}>
          <Spinner color="blue.500" size="xl" />
          <Text color="gray.600">Loading your session report...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error || !report) {
    return (
      <Box p={8} maxW="3xl" mx="auto">
        <VStack spacing={4} align="start" bg="white" borderRadius="md" p={6} borderWidth="1px">
          <Heading size="lg">No Report Available</Heading>
          <Text color="gray.600">{error || "Finish a learning session first, then your report will appear here."}</Text>
          <Button colorScheme="blue" onClick={() => navigate("/session")}>
            Start Learning
          </Button>
        </VStack>
      </Box>
    );
  }

  const score = report.score || {};
  const analysis = report.analysis || {};
  const analytics = report.analytics || {};
  const skillSummary = report.skillSummary || [];
  const answers = report.answers || [];
  const correct = score.correct ?? 0;
  const total = score.total ?? answers.length;
  const percentage = score.percentage ?? (total > 0 ? Math.round((correct / total) * 100) : 0);
  const weakSkills = report.weakSkills || [];
  const strongSkills = report.strongSkills || [];
  const nextFocus = report.nextFocus;
  const difficultyBreakdown = analytics.difficultyBreakdown || analysis.difficultyBreakdown || {};
  const aiFeedback = analysis.aiFeedback || "";
  const roadmap = report.roadmap || {};
  const feedbackLines = aiFeedback
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <Box p={{ base: 4, md: 8 }} maxW="6xl" mx="auto">
      <VStack spacing={6} align="stretch">
        <Box>
          <HStack justify="space-between" align="start" spacing={4}>
            <Box>
              <Heading size="xl" color="gray.800">
                Session Report
              </Heading>
              <Text color="gray.600" mt={2}>
                A skill-based look at what Kokoro learned from this session.
              </Text>
            </Box>
            <Button colorScheme="blue" onClick={() => navigate("/session")}>
              Start Next Session
            </Button>
          </HStack>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <MetricCard label="Accuracy" value={formatPercent(percentage)} helpText={`${correct} of ${total} correct`} />
          <MetricCard label="Skills Practiced" value={skillSummary.length} helpText={`${weakSkills.length} need review`} tone="purple" />
          <MetricCard label="Strong Skills" value={strongSkills.length} helpText="Skills at 80%+ this session" tone="green" />
        </SimpleGrid>

        {roadmap.mode === "roadmap_lesson" ? (
          <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="md" p={6}>
            <HStack justify="space-between" align="start" spacing={4}>
              <Box>
                <Badge colorScheme="purple" mb={3}>
                  Roadmap Lesson
                </Badge>
                <Heading size="md">{roadmap.lessonTitle}</Heading>
                <Text color="gray.600" mt={2}>
                  {roadmap.unitTitle}
                </Text>
              </Box>
              <Button colorScheme="blue" variant="outline" onClick={() => navigate("/dashboard")}>
                View Roadmap
              </Button>
            </HStack>
          </Box>
        ) : null}

        <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="md" p={6}>
          <Heading size="md" mb={3}>
            Kokoro's Read
          </Heading>
          {nextFocus ? (
            <VStack align="stretch" spacing={3}>
              <Text color="gray.700">
                Your next best focus is{" "}
                <Text as="span" fontWeight="bold">
                  {nextFocus.skillName}
                </Text>
                . You scored {nextFocus.correct}/{nextFocus.total} on this skill, so Kokoro should keep it in the review lane.
              </Text>
              <Progress value={nextFocus.accuracy} colorScheme={nextFocus.status === "needs_review" ? "orange" : "blue"} borderRadius="full" />
            </VStack>
          ) : (
            <Text color="gray.600">Finish a few questions and Kokoro will choose the next focus here.</Text>
          )}
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="md" p={6}>
            <Heading size="md" mb={4}>
              Skill Outcomes
            </Heading>
            <VStack align="stretch" spacing={4}>
              {skillSummary.length > 0 ? (
                skillSummary.map((skill) => {
                  const badge = getSkillBadge(skill.status);
                  return (
                    <Box key={skill.skillId}>
                      <HStack justify="space-between" mb={2} align="start">
                        <Box>
                          <Text fontWeight="semibold">{skill.skillName}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {skill.topic} / {skill.subtopic}
                          </Text>
                        </Box>
                        <Badge colorScheme={badge.color}>{badge.label}</Badge>
                      </HStack>
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="sm" color="gray.600">
                          {skill.correct}/{skill.total} correct
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {formatPercent(skill.accuracy)}
                        </Text>
                      </HStack>
                      <Progress value={skill.accuracy} colorScheme={badge.color} borderRadius="full" />
                    </Box>
                  );
                })
              ) : (
                <Text color="gray.600">No skill data was captured for this session.</Text>
              )}
            </VStack>
          </Box>

          <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="md" p={6}>
            <Heading size="md" mb={4}>
              Difficulty Mix
            </Heading>
            <VStack align="stretch" spacing={4}>
              {["easy", "medium", "hard"].map((difficulty) => {
                const data = difficultyBreakdown[difficulty] || {};
                const difficultyStats = getDifficultyStats({ data, difficulty, answers });

                return (
                  <Box key={difficulty}>
                    <HStack justify="space-between" mb={2}>
                      <HStack>
                        <Badge colorScheme={getDifficultyColor(difficulty)} textTransform="capitalize">
                          {difficulty}
                        </Badge>
                        <Text color="gray.700">{difficultyStats.total || 0} questions</Text>
                      </HStack>
                      {difficultyStats.correct !== null && difficultyStats.correct !== undefined ? (
                        <Text fontSize="sm" color="gray.600">
                          {difficultyStats.correct}/{difficultyStats.total || 0} correct
                        </Text>
                      ) : null}
                    </HStack>
                    <Progress value={difficultyStats.accuracy || 0} colorScheme={getDifficultyColor(difficulty)} borderRadius="full" />
                  </Box>
                );
              })}
            </VStack>

            <Divider my={5} />

            <Heading size="sm" mb={3}>
              Feedback
            </Heading>
            {feedbackLines.length > 0 ? (
              <VStack align="stretch" spacing={2}>
                {feedbackLines.slice(0, 4).map((line) => (
                  <Text key={line} color="gray.700" fontSize="sm">
                    {line}
                  </Text>
                ))}
              </VStack>
            ) : (
              <Text color="gray.600" fontSize="sm">
                No written feedback was stored for this session.
              </Text>
            )}
          </Box>
        </SimpleGrid>

        <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="md" p={6}>
          <Heading size="md" mb={4}>
            Question Review
          </Heading>
          <VStack align="stretch" spacing={3}>
            {answers.length > 0 ? (
              answers.map((answer) => (
                <Box key={`${answer.questionId}-${answer.index}`} borderWidth="1px" borderColor="gray.100" borderRadius="md" p={4}>
                  <HStack justify="space-between" align="start" mb={3}>
                    <Box>
                      <HStack mb={1}>
                        <Badge colorScheme={answer.isCorrect ? "green" : "red"}>
                          {answer.isCorrect ? "Correct" : "Review"}
                        </Badge>
                        <Badge colorScheme={getDifficultyColor(answer.difficulty)}>{answer.difficulty}</Badge>
                      </HStack>
                      <Text fontWeight="semibold">{answer.skillName || answer.subtopic || answer.topic}</Text>
                      {answer.learningObjective ? (
                        <Text fontSize="sm" color="gray.500">
                          {answer.learningObjective}
                        </Text>
                      ) : null}
                    </Box>
                    <Text color="gray.500" fontSize="sm">
                      Q{answer.index}
                    </Text>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    <Box bg="gray.50" borderRadius="md" p={3}>
                      <Text fontSize="xs" color="gray.500" fontWeight="semibold">
                        Your answer
                      </Text>
                      <Text color="gray.800">{answer.userAnswer || "No answer"}</Text>
                    </Box>
                    <Box bg={answer.isCorrect ? "green.50" : "orange.50"} borderRadius="md" p={3}>
                      <Text fontSize="xs" color="gray.500" fontWeight="semibold">
                        Correct answer
                      </Text>
                      <Text color="gray.800">{answer.correctAnswer}</Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              ))
            ) : (
              <Text color="gray.600">No question attempts were found for this session.</Text>
            )}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default ReportPage;
