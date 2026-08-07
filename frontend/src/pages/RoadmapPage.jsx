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
import { fetchLearnerState, fetchRoadmap } from "../services/dashboard.service.js";
import { useSessionStore } from "../store/sessionStore.js";

const userId = "guest";

const statusColor = (status) => {
	if (status === "completed") return "green";
	if (status === "current") return "blue";
	if (status === "review_due") return "orange";
	return "gray";
};

const statusLabel = (status) => {
	if (status === "completed") return "completed";
	if (status === "current") return "current";
	if (status === "review_due") return "review due";
	return "locked";
};

const RoadmapPage = () => {
	const navigate = useNavigate();
	const startSession = useSessionStore((state) => state.startSession);
	const [roadmap, setRoadmap] = useState(null);
	const [learnerState, setLearnerState] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [startingLessonId, setStartingLessonId] = useState(null);

	useEffect(() => {
		const loadRoadmap = async () => {
			try {
				setLoading(true);
				const [roadmapResult, learnerStateResult] = await Promise.all([
					fetchRoadmap(userId),
					fetchLearnerState(userId),
				]);
				setRoadmap(roadmapResult);
				setLearnerState(learnerStateResult);
			} catch (err) {
				setError(err.message || "Could not load roadmap.");
			} finally {
				setLoading(false);
			}
		};

		loadRoadmap();
	}, []);

	const reviewSkillIds = useMemo(
		() => new Set((learnerState?.reviewQueue || []).map((item) => item.skillId).filter(Boolean)),
		[learnerState]
	);

	const lessons = useMemo(() => {
		const currentLessonId = learnerState?.nextLesson?.id || roadmap?.nextLesson?.id;
		return (roadmap?.units || []).flatMap((unit) =>
			unit.lessons.map((lesson) => {
				const hasReviewDue = (lesson.skillIds || []).some((skillId) => reviewSkillIds.has(skillId));
				const displayStatus =
					lesson.id === currentLessonId
						? "current"
						: hasReviewDue && lesson.status !== "locked"
							? "review_due"
							: lesson.status;
				return { ...lesson, unitTitle: unit.title, displayStatus };
			})
		);
	}, [learnerState, roadmap, reviewSkillIds]);

	const handleStartLesson = async (lessonId) => {
		try {
			setStartingLessonId(lessonId);
			const result = await startSession(lessonId);
			if (result.success) navigate("/session");
			else setError(result.message || "Could not start lesson.");
		} finally {
			setStartingLessonId(null);
		}
	};

	if (loading) {
		return (
			<Flex minH="70vh" align="center" justify="center">
				<VStack spacing={4}>
					<Spinner color="blue.500" size="xl" />
					<Text color="gray.600">Loading your learning path...</Text>
				</VStack>
			</Flex>
		);
	}

	if (error) {
		return (
			<Container maxW="md" py={8}>
				<Box bg="white" borderWidth="1px" borderRadius="xl" p={6}>
					<Heading size="md">Roadmap could not load</Heading>
					<Text color="gray.600" mt={3}>{error}</Text>
				</Box>
			</Container>
		);
	}

	return (
		<Box bg="gray.50" minH="100vh" pb={24}>
			<Container maxW="3xl" py={{ base: 4, md: 8 }}>
				<VStack align="stretch" spacing={6}>
					<Box>
						<Badge colorScheme="purple" borderRadius="full" px={3} py={1}>Roadmap</Badge>
						<Heading mt={3}>Your Japanese path</Heading>
						<Text color="gray.600" mt={2}>
							Follow the path lesson by lesson. Kokoro still adapts the questions inside each step.
						</Text>
					</Box>

					<VStack align="stretch" spacing={4}>
						{lessons.map((lesson, index) => {
							const isCurrent = lesson.displayStatus === "current";
							const isStartable = ["current", "review_due", "completed", "in_progress", "unlocked"].includes(lesson.displayStatus);
							return (
								<Flex key={lesson.id} gap={4} align="stretch">
									<VStack spacing={0} minW="42px">
										<Box
											w="42px"
											h="42px"
											borderRadius="full"
											bg={`${statusColor(lesson.displayStatus)}.500`}
											color="white"
											display="grid"
											placeItems="center"
											fontWeight="bold"
										>
											{index + 1}
										</Box>
										{index < lessons.length - 1 ? <Box flex="1" w="2px" bg="gray.200" /> : null}
									</VStack>
									<Box
										flex="1"
										bg={isCurrent ? "blue.50" : "white"}
										borderWidth="1px"
										borderColor={isCurrent ? "blue.200" : "gray.200"}
										borderRadius="xl"
										p={5}
									>
										<HStack justify="space-between" align="start" mb={2}>
											<Box>
												<Text fontSize="xs" color="gray.500" fontWeight="semibold">
													{lesson.unitTitle}
												</Text>
												<Heading size="sm">{lesson.title}</Heading>
											</Box>
											<Badge colorScheme={statusColor(lesson.displayStatus)}>
												{statusLabel(lesson.displayStatus)}
											</Badge>
										</HStack>
										<Text color="gray.600" fontSize="sm">
											{lesson.description}
										</Text>
										{lesson.progress?.attempts ? (
											<Text color="gray.500" fontSize="xs" mt={2}>
												Practiced {lesson.progress.attempts} times
											</Text>
										) : null}
										{isCurrent ? (
											<Button
												mt={4}
												colorScheme="blue"
												borderRadius="full"
												isDisabled={!isStartable}
												isLoading={startingLessonId === lesson.id}
												onClick={() => handleStartLesson(lesson.id)}
											>
												Start this lesson
											</Button>
										) : null}
									</Box>
								</Flex>
							);
						})}
					</VStack>
				</VStack>
			</Container>
		</Box>
	);
};

export default RoadmapPage;
