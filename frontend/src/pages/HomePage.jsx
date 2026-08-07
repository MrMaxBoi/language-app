import { useEffect, useMemo, useState } from "react";
import {
	Badge,
	Box,
	Button,
	Container,
	Flex,
	Heading,
	HStack,
	Spinner,
	Text,
	VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { fetchHomeRecommendation } from "../services/dashboard.service.js";
import { useSessionStore } from "../store/sessionStore.js";

const userId = "guest";

const formatSkillName = (skill = {}) =>
	skill.skillName || skill.subtopic || skill.topic || skill.skillId || "Japanese basics";

const HomeCard = ({ children, p = 5 }) => (
	<Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="xl" p={p}>
		{children}
	</Box>
);

const getLessonDescription = (lesson) => {
	if (!lesson) return "Kokoro will begin with a gentle foundation check.";
	if (lesson.id === "lesson-basic-pronunciation") return "Learn how kana sounds connect naturally in Japanese words.";
	return lesson.description || "Continue building your Japanese foundation step by step.";
};

const getPathSymbol = (lesson) => {
	if (lesson.status === "current") return "●";
	if (lesson.status === "completed") return "✓";
	return "○";
};

const HomePage = () => {
	const navigate = useNavigate();
	const startSession = useSessionStore((state) => state.startSession);
	const [homePlan, setHomePlan] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isStarting, setIsStarting] = useState(false);

	useEffect(() => {
		const loadHome = async () => {
			try {
				setLoading(true);
				const data = await fetchHomeRecommendation(userId);
				setHomePlan(data);
			} catch (err) {
				setError(err.message || "Could not load Kokoro home.");
			} finally {
				setLoading(false);
			}
		};

		loadHome();
	}, []);

	const summary = useMemo(() => {
		return {
			primaryAction: homePlan?.primaryAction || { type: "lesson", payload: {} },
			todayPlan: homePlan?.todayPlan || {
				badge: "NEXT LESSON",
				title: "Welcome back",
				text: "Today's plan is to continue your Japanese foundation.",
				items: ["No quick review due", "Continue your next lesson"],
			},
			nextLesson: homePlan?.nextLesson || null,
			reviewSummary: homePlan?.reviewSummary || {
				count: 0,
				topTask: null,
				title: "Nothing urgent to review",
				description: "You can keep going with your next lesson.",
				payload: null,
			},
			currentPath: homePlan?.currentPath || {
				moduleTitle: "Foundation path",
				currentStep: 1,
				totalSteps: 1,
				preview: [],
			},
		};
	}, [homePlan]);

	const handleContinue = async () => {
		try {
			setIsStarting(true);
			const result = await startSession(summary.primaryAction?.payload || summary.nextLesson?.payload || {});
			if (result.success) navigate("/session");
			else setError(result.message || "Could not start learning.");
		} finally {
			setIsStarting(false);
		}
	};

	const handleStartLesson = async () => {
		try {
			setIsStarting(true);
			const result = await startSession(summary.nextLesson?.payload || {});
			if (result.success) navigate("/session");
			else setError(result.message || "Could not start lesson.");
		} finally {
			setIsStarting(false);
		}
	};

	const handleReview = () => {
		navigate("/review");
	};

	if (loading) {
		return (
			<Flex minH="70vh" align="center" justify="center">
				<VStack spacing={4}>
					<Spinner color="blue.500" size="xl" />
					<Text color="gray.600">Preparing your next lesson...</Text>
				</VStack>
			</Flex>
		);
	}

	if (error) {
		return (
			<Container maxW="md" py={8}>
				<HomeCard>
					<Heading size="md">Kokoro could not load</Heading>
					<Text color="gray.600" mt={3}>{error}</Text>
					<Button colorScheme="blue" mt={5} onClick={() => window.location.reload()}>
						Try again
					</Button>
				</HomeCard>
			</Container>
		);
	}

	return (
		<Box bg="gray.50" minH="100vh" pb={24}>
			<Container maxW="5xl" py={{ base: 4, md: 8 }}>
				<VStack align="stretch" spacing={5}>
					<HomeCard p={6}>
						<VStack align="stretch" spacing={5}>
							<Box>
								<Badge colorScheme={summary.reviewSummary.count > 0 ? "orange" : "blue"} borderRadius="full" px={3} py={1}>
									{summary.todayPlan.badge}
								</Badge>
								<Heading size={{ base: "lg", md: "xl" }} mt={3}>
									{summary.todayPlan.title}
								</Heading>
								<Text color="gray.600" mt={2}>
									{summary.todayPlan.text}
								</Text>
							</Box>
							<VStack align="stretch" spacing={3} bg="gray.50" borderRadius="xl" p={4}>
								{summary.todayPlan.items.map((item, index) => (
									<HStack align="start" key={`${item}-${index}`}>
										<Badge colorScheme={index === 0 && summary.reviewSummary.count > 0 ? "orange" : "blue"} borderRadius="full">
											{index + 1}
										</Badge>
										<Text color="gray.700">{item}</Text>
									</HStack>
								))}
							</VStack>
							<Button colorScheme="blue" size="lg" borderRadius="full" onClick={handleContinue} isLoading={isStarting}>
								{summary.primaryAction.ctaLabel || "Continue Learning"}
							</Button>
						</VStack>
					</HomeCard>

					<HomeCard>
						<VStack align="stretch" spacing={4}>
						<HStack justify="space-between" align="start" spacing={4}>
							<Box>
								<Badge colorScheme="purple" mb={3}>Next lesson</Badge>
								<Heading size="md">
									{summary.nextLesson?.title || "Start your first lesson"}
								</Heading>
								<Text color="gray.600" mt={2}>
									{getLessonDescription(summary.nextLesson)}
								</Text>
							</Box>
							<Badge colorScheme="blue" whiteSpace="nowrap">
								{summary.nextLesson?.status?.replace("_", " ") || "ready"}
							</Badge>
						</HStack>
						<HStack justify="space-between" align={{ base: "stretch", sm: "center" }} flexDir={{ base: "column", sm: "row" }}>
							<Text color="gray.500" fontSize="sm">
								10 min · {summary.nextLesson?.status?.replace("_", " ") || "ready"}
							</Text>
							<Button variant="outline" colorScheme="blue" borderRadius="full" onClick={handleStartLesson} isLoading={isStarting}>
								Start lesson
							</Button>
						</HStack>
						</VStack>
					</HomeCard>

					<HomeCard>
						<VStack align="stretch" spacing={4}>
							<Box>
								<Badge colorScheme="orange" mb={3}>Review before continuing</Badge>
								<Heading size="md">
									{summary.reviewSummary.title}
								</Heading>
								<Text color="gray.600" mt={2}>
									{summary.reviewSummary.topTask
										? `${formatSkillName(summary.reviewSummary.topTask)}: ${summary.reviewSummary.description}`
										: summary.reviewSummary.description}
								</Text>
							</Box>
							<Button
								variant="outline"
								colorScheme="orange"
								borderRadius="full"
								alignSelf={{ base: "stretch", sm: "start" }}
								onClick={handleReview}
								isDisabled={summary.reviewSummary.count === 0}
							>
								Review now
							</Button>
						</VStack>
					</HomeCard>

					<HomeCard>
						<Badge colorScheme="cyan" mb={3}>Current path</Badge>
						<Heading size="md">{summary.currentPath.moduleTitle}</Heading>
						<Text color="gray.600" mt={2}>
							You are on step {summary.currentPath.currentStep} of {summary.currentPath.totalSteps}.
						</Text>
						<VStack align="stretch" spacing={3} mt={4}>
							{summary.currentPath.preview.map((lesson) => (
								<HStack key={lesson.id} justify="space-between" align="start" bg={lesson.status === "current" ? "blue.50" : "transparent"} borderRadius="lg" p={2}>
									<HStack align="start" spacing={3}>
										<Text color={lesson.status === "current" ? "blue.600" : lesson.status === "completed" ? "green.600" : "gray.400"} fontWeight="bold">
											{getPathSymbol(lesson)}
										</Text>
									<Box>
										<Text fontWeight="semibold">{lesson.title}</Text>
										<Text fontSize="sm" color="gray.500">{lesson.description}</Text>
									</Box>
									</HStack>
									<Badge colorScheme={lesson.status === "current" ? "blue" : lesson.status === "completed" ? "green" : "gray"}>
										{lesson.status?.replace("_", " ")}
									</Badge>
								</HStack>
							))}
						</VStack>
						<Button mt={5} variant="outline" borderRadius="full" onClick={() => navigate("/roadmap")}>
							View full roadmap
						</Button>
					</HomeCard>
				</VStack>
			</Container>
		</Box>
	);
};

export default HomePage;
