import { useEffect, useMemo, useState } from "react";
import {
	Badge,
	Box,
	Button,
	Container,
	Heading,
	HStack,
	SimpleGrid,
	Spinner,
	Text,
	VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { fetchReviewTasks } from "../services/dashboard.service.js";
import { useSessionStore } from "../store/sessionStore.js";

const userId = "guest";

const formatSkillName = (skill = {}) =>
	skill.skillName || skill.subtopic || skill.topic || "Review topic";

const VISIBLE_REVIEW_ITEM_LIMIT = 3;

const getDailyReviewQuestionCount = (taskCount) => {
	if (taskCount <= 0) return 0;
	if (taskCount === 1) return 8;
	if (taskCount <= 3) return 10;
	if (taskCount <= 7) return 15;
	if (taskCount <= 12) return 20;
	return taskCount >= 20 ? 30 : 25;
};

const getBadgeColor = (type) => {
	if (type === "mistake" || type === "Mistake") return "red";
	if (type === "memory_due" || type === "Memory due") return "orange";
	return "blue";
};

const ReviewPage = () => {
	const navigate = useNavigate();
	const startSession = useSessionStore((state) => state.startSession);
	const startDailyReview = useSessionStore((state) => state.startDailyReview);
	const [reviewTaskData, setReviewTaskData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isStarting, setIsStarting] = useState(false);
	const [showAllTopics, setShowAllTopics] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		const loadReview = async () => {
			try {
				const data = await fetchReviewTasks(userId);
				setReviewTaskData(data);
			} finally {
				setLoading(false);
			}
		};

		loadReview();
	}, []);

	const reviewItems = useMemo(() => {
		return (reviewTaskData?.tasks || []).map((task) => ({
			id: task.id,
			skillId: task.skillId,
			skillName: formatSkillName(task),
			type: task.type,
			typeLabel: task.typeLabel,
			reason: task.reason,
			goal: `Get ${task.clearCondition?.requiredCorrect || 2} correct answers to clear this.`,
			progress: task.progress || { correct: 0, attempts: 0 },
		}));
	}, [reviewTaskData]);

	const visibleReviewItems = showAllTopics ? reviewItems : reviewItems.slice(0, VISIBLE_REVIEW_ITEM_LIMIT);
	const reviewPlan = useMemo(() => {
		const tasks = reviewTaskData?.tasks || [];
		const backendPreview = reviewTaskData?.dailyReview;
		const questionCount = backendPreview?.questionCount ?? getDailyReviewQuestionCount(tasks.length);
		return {
			questionCount,
			estimatedMinutes: backendPreview?.estimatedMinutes ?? (questionCount ? Math.ceil((questionCount * 35) / 60) : 0),
			mistakeTasks: backendPreview?.summary?.mistakeTasks ?? tasks.filter((task) => task.type === "mistake").length,
			memoryDueTasks: backendPreview?.summary?.memoryDueTasks ?? tasks.filter((task) => task.type === "memory_due").length,
			weakSkillTasks: backendPreview?.summary?.weakSkillTasks ?? tasks.filter((task) => task.type === "weak_skill").length,
		};
	}, [reviewTaskData]);

	const handleStartDailyReview = async () => {
		try {
			setError(null);
			setIsStarting(true);
			const result = await startDailyReview();
			if (result.success) navigate("/session");
			else setError(result.message || "Could not start today's review.");
		} finally {
			setIsStarting(false);
		}
	};

	const handleQuickPractice = async (targetItem = null) => {
		try {
			setIsStarting(true);
			const sourceItems = targetItem ? [targetItem] : reviewItems;
			const reviewSkillIds = [...new Set(sourceItems.map((item) => item.skillId).filter(Boolean))];
			const reviewTaskIds = sourceItems.map((item) => item.id).filter(Boolean);
			const reviewPayload = reviewSkillIds.length > 0
				? {
						reviewSkillIds,
						reviewTaskIds,
						reviewTitle: targetItem ? `Review: ${targetItem.skillName}` : "Review weak areas",
					}
				: {};
			console.log("🧠 Active ReviewTasks before session:", reviewTaskData?.tasks || []);
			console.log("🎯 Review target:", targetItem || { reviewSkillIds, reviewTaskIds });
			const result = await startSession(reviewPayload);
			if (result.success) navigate("/session");
		} finally {
			setIsStarting(false);
		}
	};

	const handleFixTopic = async (item) => {
		await handleQuickPractice(item);
	};

	if (loading) {
		return (
			<VStack minH="70vh" justify="center" spacing={4}>
				<Spinner color="blue.500" size="xl" />
				<Text color="gray.600">Finding review items...</Text>
			</VStack>
		);
	}

	return (
		<Box bg="gray.50" minH="100vh" pb={24}>
			<Container maxW="2xl" py={{ base: 4, md: 8 }}>
				<VStack align="stretch" spacing={5}>
					<Box bg="white" borderWidth="1px" borderRadius="xl" p={6}>
						<Badge colorScheme="orange" borderRadius="full" px={3} py={1}>Review</Badge>
						<Heading mt={3}>Today&apos;s Review</Heading>
						<Text color="gray.600" mt={2}>
							Kokoro prepared one focused session from the memories and skills that need attention.
						</Text>
					</Box>

					<Box bg="white" borderWidth="1px" borderColor="orange.200" borderRadius="xl" p={6}>
						{reviewItems.length > 0 ? (
							<VStack align="stretch" spacing={5}>
								<Box>
									<Heading size="md">{reviewPlan.questionCount} questions</Heading>
									<Text color="gray.600" mt={1}>About {reviewPlan.estimatedMinutes} minutes</Text>
								</Box>
								<SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
									<Box bg="orange.50" borderRadius="lg" p={3}>
										<Text fontWeight="bold">{reviewPlan.memoryDueTasks}</Text>
										<Text fontSize="sm" color="gray.600">Due memories</Text>
									</Box>
									<Box bg="red.50" borderRadius="lg" p={3}>
										<Text fontWeight="bold">{reviewPlan.mistakeTasks}</Text>
										<Text fontSize="sm" color="gray.600">Recent mistakes</Text>
									</Box>
									<Box bg="blue.50" borderRadius="lg" p={3}>
										<Text fontWeight="bold">{reviewPlan.weakSkillTasks}</Text>
										<Text fontSize="sm" color="gray.600">Weak skills</Text>
									</Box>
								</SimpleGrid>
								<Text color="gray.500" fontSize="sm">Built from {reviewItems.length} active review {reviewItems.length === 1 ? "task" : "tasks"}.</Text>
								<Button colorScheme="blue" size="lg" borderRadius="full" onClick={handleStartDailyReview} isLoading={isStarting}>
									Start Review
								</Button>
								{error ? <Text color="red.500" fontSize="sm">{error}</Text> : null}
							</VStack>
						) : (
							<VStack align="stretch" spacing={4}>
								<Heading size="md">You&apos;re caught up</Heading>
								<Text color="gray.600">There are no active review tasks. Continue your roadmap when you&apos;re ready.</Text>
								<Button colorScheme="blue" borderRadius="full" onClick={() => navigate("/roadmap")}>Continue learning</Button>
							</VStack>
						)}
					</Box>

					<Box>
						<Heading size="md">Focus on one topic</Heading>
						<Text color="gray.600" mt={1}>Choose a specific area when you want a shorter correction.</Text>
					</Box>

					<VStack align="stretch" spacing={3}>
						{visibleReviewItems.length > 0 ? (
							visibleReviewItems.map((item, index) => (
								<Box key={item.id || `${item.skillName}-${index}`} bg="white" borderWidth="1px" borderRadius="xl" p={5}>
									<VStack align="stretch" spacing={4}>
									<HStack justify="space-between" align="start">
										<Box>
											<Heading size="sm">{item.skillName}</Heading>
											<Text color="gray.600" mt={2}>{item.reason}</Text>
										</Box>
										<Badge colorScheme={getBadgeColor(item.type)}>{item.typeLabel}</Badge>
									</HStack>
									<Box bg="gray.50" borderRadius="lg" p={3}>
										<Text fontSize="sm" color="gray.700" fontWeight="semibold">
											Goal
										</Text>
										<Text fontSize="sm" color="gray.600">
											{item.goal}
										</Text>
										{item.progress?.attempts > 0 ? (
											<Text color="gray.500" mt={2} fontSize="sm">
												Current review progress: {item.progress.correct}/{item.progress.attempts}
											</Text>
										) : null}
									</Box>
									<Button variant="outline" colorScheme={getBadgeColor(item.type)} borderRadius="full" onClick={() => handleFixTopic(item)}>
										Fix this topic
									</Button>
									</VStack>
								</Box>
							))
						) : (
							<Box bg="white" borderWidth="1px" borderRadius="xl" p={5}>
								<Heading size="sm">No mistakes waiting</Heading>
								<Text color="gray.600" mt={2}>You can continue with your roadmap lesson.</Text>
							</Box>
						)}
					</VStack>

					{reviewItems.length > VISIBLE_REVIEW_ITEM_LIMIT ? (
						<Button variant="ghost" colorScheme="blue" onClick={() => setShowAllTopics((current) => !current)}>
							{showAllTopics ? "Show fewer topics" : `View all ${reviewItems.length} topics`}
						</Button>
					) : null}

					<Button variant="outline" borderRadius="full" onClick={() => navigate("/roadmap")}>Back to roadmap</Button>
				</VStack>
			</Container>
		</Box>
	);
};

export default ReviewPage;
