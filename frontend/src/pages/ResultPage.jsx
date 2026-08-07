import { useEffect, useState } from "react";
import {
	Badge,
	Box,
	Button,
	Container,
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
import { useSessionStore } from "../store/sessionStore.js";

const formatPercent = (value) => `${Math.round(Number(value) || 0)}%`;

const ResultPage = () => {
	const navigate = useNavigate();
	const report = useSessionStore((state) => state.report);
	const fetchReport = useSessionStore((state) => state.fetchReport);
	const [loading, setLoading] = useState(!report);
	const [error, setError] = useState(null);

	useEffect(() => {
		const loadReport = async () => {
			if (report) return;
			const result = await fetchReport();
			if (!result.success) setError(result.message || "Could not load result.");
			setLoading(false);
		};

		loadReport();
	}, [fetchReport, report]);

	if (loading) {
		return (
			<Flex minH="70vh" align="center" justify="center">
				<VStack spacing={4}>
					<Spinner color="blue.500" size="xl" />
					<Text color="gray.600">Preparing your result...</Text>
				</VStack>
			</Flex>
		);
	}

	if (error || !report) {
		return (
			<Container maxW="md" py={8}>
				<Box bg="white" borderWidth="1px" borderRadius="xl" p={6}>
					<Heading size="md">No result yet</Heading>
					<Text color="gray.600" mt={3}>{error || "Finish a lesson first."}</Text>
					<Button colorScheme="blue" mt={5} onClick={() => navigate("/")}>Go home</Button>
				</Box>
			</Container>
		);
	}

	const score = report.score || {};
	const answers = report.answers || [];
	const total = score.total ?? answers.length;
	const correct = score.correct ?? 0;
	const accuracy = score.percentage ?? (total ? Math.round((correct / total) * 100) : 0);
	const weakSkills = report.weakSkills || [];
	const strongSkills = report.strongSkills || [];
	const improvedSkill = strongSkills[0] || report.skillSummary?.find((skill) => skill.status === "steady");
	const needsReview = weakSkills[0] || null;
	const suggestedPractice = report.suggestedPractice || report.nextFocus || improvedSkill;
	const hasSessionMistakes = answers.some((answer) => !answer.isCorrect);
	const isDailyReview = report.roadmap?.mode === "daily_review";
	const reviewCompletion = report.reviewCompletionSummary || report.roadmap?.reviewCompletionSummary;
	const reviewCard = needsReview
		? {
				label: "Needs review",
				color: "orange",
				title: needsReview.skillName,
				text: "You missed this during the lesson, so Kokoro will keep it close.",
			}
		: {
				label: hasSessionMistakes ? "Keep practicing later" : "Scheduled for later",
				color: "blue",
				title: suggestedPractice?.skillName || "No urgent review",
				text: hasSessionMistakes
					? "Nothing stands out as urgent, but this topic can stay in rotation."
					: "You got this lesson right. Kokoro may still bring topics back later for memory review.",
			};

	if (isDailyReview && reviewCompletion) {
		const clearedTasks = reviewCompletion.clearedTasks || [];
		const remainingTasks = reviewCompletion.remainingTasks || [];

		return (
			<Box bg="gray.50" minH="100vh" pb={24}>
				<Container maxW="3xl" py={{ base: 4, md: 8 }}>
					<VStack align="stretch" spacing={5}>
						<Box bg="white" borderWidth="1px" borderRadius="xl" p={6} textAlign="center">
							<Badge colorScheme="green" borderRadius="full" px={3} py={1}>Review complete</Badge>
							<Heading mt={4}>Today&apos;s Review Complete</Heading>
							<Text color="gray.600" mt={2}>{total} questions completed</Text>
							<Progress value={accuracy} colorScheme="green" borderRadius="full" mt={5} />
							<Text fontSize="2xl" fontWeight="bold" mt={3}>{formatPercent(accuracy)}</Text>
						</Box>

						<SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
							<Box bg="green.50" borderWidth="1px" borderColor="green.200" borderRadius="xl" p={5}>
								<Text fontSize="2xl" fontWeight="bold" color="green.700">{reviewCompletion.tasksCleared || 0}</Text>
								<Text color="green.800">Review tasks cleared</Text>
							</Box>
							<Box bg="orange.50" borderWidth="1px" borderColor="orange.200" borderRadius="xl" p={5}>
								<Text fontSize="2xl" fontWeight="bold" color="orange.700">{reviewCompletion.tasksRemaining || 0}</Text>
								<Text color="orange.800">Still need attention</Text>
							</Box>
						</SimpleGrid>

						<Box bg="white" borderWidth="1px" borderRadius="xl" p={5}>
							<Badge colorScheme="green" mb={3}>Refreshed</Badge>
							{clearedTasks.length > 0 ? (
								<VStack align="stretch" spacing={2}>
									{clearedTasks.map((task) => <Text key={task.taskId}>✓ {task.skillName}</Text>)}
								</VStack>
							) : <Text color="gray.600">No topic reached its clear goal yet. Your practice still counts.</Text>}
						</Box>

						{remainingTasks.length > 0 ? (
							<Box bg="white" borderWidth="1px" borderRadius="xl" p={5}>
								<Badge colorScheme="orange" mb={3}>Still practicing</Badge>
								<VStack align="stretch" spacing={2}>
									{remainingTasks.map((task) => (
										<Text key={task.taskId}>{task.skillName} · {task.correct}/{task.requiredCorrect} correct</Text>
									))}
								</VStack>
							</Box>
						) : null}

						<SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
							<Button colorScheme="blue" borderRadius="full" onClick={() => navigate("/")}>Continue learning</Button>
							<Button colorScheme="orange" variant="outline" borderRadius="full" onClick={() => navigate("/review")}>Review remaining topics</Button>
							<Button variant="outline" borderRadius="full" onClick={() => navigate("/roadmap")}>Back to roadmap</Button>
						</SimpleGrid>
					</VStack>
				</Container>
			</Box>
		);
	}

	return (
		<Box bg="gray.50" minH="100vh" pb={24}>
			<Container maxW="3xl" py={{ base: 4, md: 8 }}>
				<VStack align="stretch" spacing={5}>
					<Box bg="white" borderWidth="1px" borderRadius="xl" p={6} textAlign="center">
						<Badge colorScheme={accuracy >= 80 ? "green" : "blue"} borderRadius="full" px={3} py={1}>
							Lesson complete
						</Badge>
						<Heading mt={4}>Nice work today</Heading>
						<Text color="gray.600" mt={2}>
							You answered {correct} of {total} correctly.
						</Text>
						<Progress value={accuracy} colorScheme={accuracy >= 80 ? "green" : "blue"} borderRadius="full" mt={5} />
						<Text fontSize="2xl" fontWeight="bold" mt={3}>{formatPercent(accuracy)}</Text>
					</Box>

					<SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
						<Box bg="white" borderWidth="1px" borderRadius="xl" p={5}>
							<Badge colorScheme="green" mb={3}>Improved</Badge>
							<Heading size="sm">{improvedSkill?.skillName || "You kept practicing"}</Heading>
							<Text color="gray.600" mt={2}>
								{improvedSkill ? "This topic looked stronger in this session." : "Every completed session helps Kokoro guide the next step."}
							</Text>
						</Box>
						<Box bg="white" borderWidth="1px" borderRadius="xl" p={5}>
							<Badge colorScheme={reviewCard.color} mb={3}>{reviewCard.label}</Badge>
							<Heading size="sm">{reviewCard.title}</Heading>
							<Text color="gray.600" mt={2}>
								{reviewCard.text}
							</Text>
						</Box>
					</SimpleGrid>

					<Box bg="white" borderWidth="1px" borderRadius="xl" p={5}>
						<Heading size="md" mb={4}>Question review</Heading>
						<VStack align="stretch" spacing={3}>
							{answers.slice(0, 5).map((answer) => (
								<HStack key={`${answer.questionId}-${answer.index}`} justify="space-between" align="start">
									<Box>
										<Text fontWeight="semibold">{answer.skillName || answer.subtopic || answer.topic}</Text>
										<Text fontSize="sm" color="gray.500">
											Your answer: {answer.userAnswer || "No answer"}
										</Text>
									</Box>
									<Badge colorScheme={answer.isCorrect ? "green" : "orange"}>
										{answer.isCorrect ? "correct" : "review"}
									</Badge>
								</HStack>
							))}
						</VStack>
					</Box>

					<SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
						<Button colorScheme="orange" variant="outline" borderRadius="full" onClick={() => navigate("/review")}>
							{hasSessionMistakes ? "Review mistakes" : "Review later"}
						</Button>
						<Button colorScheme="purple" variant="outline" borderRadius="full" onClick={() => navigate("/roadmap")}>
							Back to roadmap
						</Button>
						<Button colorScheme="blue" borderRadius="full" onClick={() => navigate("/")}>
							Continue learning
						</Button>
					</SimpleGrid>
				</VStack>
			</Container>
		</Box>
	);
};

export default ResultPage;
