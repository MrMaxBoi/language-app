import { useEffect, useMemo, useState } from "react";
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
import { useSessionStore } from "../store/sessionStore";
import {
	fetchAnalytics,
	fetchEngineIntelligence,
	fetchLearnerState,
	fetchMemoryHealth,
	fetchRecommendationInsights,
	fetchRoadmap,
} from "../services/dashboard.service.js";

const userId = "guest";

const formatPercent = (value) => `${Math.round(Number(value) || 0)}%`;

const formatSkillName = (skill = {}) =>
	skill.skillName || skill.subtopic || skill.topic || skill.skillId || "Unknown skill";

const formatReason = (reason = "") =>
	({
		overdue_memory: "You have not reviewed this in a while",
		weak_memory: "This memory is starting to fade",
		weak_skill: "You recently missed this skill",
		medium_skill: "You are ready to strengthen this",
		difficulty_balancing: "This fits your current practice level",
		memory_decay_risk: "Kokoro wants to refresh it before it fades",
		challenge_progression: "This is a good next challenge",
	}[reason] ||
	reason
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" "));

const getLearnerStage = ({ totalSessions = 0, averageAccuracy = 0, weakCount = 0, coveragePercent = 0 }) => {
	if (totalSessions === 0) return "Cold Start";
	if (coveragePercent < 30) return "Foundation Building";
	if (weakCount >= 3 || averageAccuracy < 55) return "Adaptive Review";
	if (averageAccuracy >= 85 && coveragePercent >= 45) return "Core Practice";
	return "Foundation Building";
};

const getStageMessage = (stage) => {
	if (stage === "Cold Start") return "Kokoro is still learning your baseline. Start with a short session.";
	if (stage === "Adaptive Review") return "Kokoro sees a few shaky areas, so review should lead the next session.";
	if (stage === "Core Practice") return "You are ready for a wider mix of review, challenge, and new core skills.";
	return "Kokoro is building your beginner foundation while keeping weak skills in rotation.";
};

const getMasteryPercent = (skill = {}) => {
	const mastery = Number(skill.mastery) || 0;
	return mastery <= 1 ? Math.round(mastery * 100) : Math.round(mastery);
};

const DashboardCard = ({ children, p = 5 }) => (
	<Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="md" p={p}>
		{children}
	</Box>
);

const SkillRow = ({ skill, variant = "weak" }) => {
	const mastery = getMasteryPercent(skill);
	const color = variant === "strong" ? "green" : variant === "review" ? "orange" : "blue";
	const label = variant === "strong" ? "Strong" : mastery <= 30 ? "Needs practice" : "Review soon";

	return (
		<Box>
			<HStack justify="space-between" align="start" mb={2}>
				<Box>
					<Text fontWeight="semibold">{formatSkillName(skill)}</Text>
					<Text fontSize="sm" color="gray.500">
						{skill.topic || "Skill"} {skill.subtopic ? `/ ${skill.subtopic}` : ""}
					</Text>
				</Box>
				<Badge colorScheme={color}>{label}</Badge>
			</HStack>
			<Progress value={mastery} colorScheme={color} borderRadius="full" />
		</Box>
	);
};

const getLessonStatusColor = (status) => {
	if (status === "completed") return "green";
	if (status === "in_progress") return "blue";
	if (status === "unlocked") return "purple";
	return "gray";
};

const RoadmapLessonRow = ({ lesson }) => {
	return (
		<Flex
			justify="space-between"
			gap={4}
			align={{ base: "stretch", md: "center" }}
			direction={{ base: "column", md: "row" }}
			borderBottomWidth="1px"
			borderColor="gray.100"
			pb={3}
		>
			<Box>
				<HStack mb={1}>
					<Text fontWeight="semibold">{lesson.title}</Text>
					<Badge colorScheme={getLessonStatusColor(lesson.status)}>{lesson.status.replace("_", " ")}</Badge>
				</HStack>
				<Text fontSize="sm" color="gray.600">
					{lesson.description}
				</Text>
				<Text fontSize="xs" color="gray.500" mt={1}>
					{lesson.status === "completed"
						? "Completed"
						: lesson.status === "in_progress"
							? "You have started this lesson"
							: lesson.status === "unlocked"
								? "Ready when you are"
								: "Locked until earlier lessons are ready"}
				</Text>
			</Box>
		</Flex>
	);
};

const getReviewLoadLabel = (count) => {
	if (count >= 6) return "Several memories need attention";
	if (count > 0) return "A few memories need review";
	return "No urgent reviews right now";
};

const getRecentRhythmLabel = (accuracy) => {
	if (accuracy >= 85) return "You have been answering confidently.";
	if (accuracy >= 65) return "You are doing okay, but review will help the next sessions feel smoother.";
	if (accuracy > 0) return "Keep the next session gentle and review-heavy.";
	return "Finish a session and Kokoro will learn your rhythm.";
};

const DashboardPage = () => {
	const navigate = useNavigate();
	const startSession = useSessionStore((state) => state.startSession);
	const [dashboardData, setDashboardData] = useState({
		analytics: null,
		memory: null,
		recommendations: null,
		engine: null,
		roadmap: null,
		learnerState: null,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [roadmapError, setRoadmapError] = useState(null);
	const [isStartingLesson, setIsStartingLesson] = useState(null);

	useEffect(() => {
		const loadDashboard = async () => {
			try {
				setLoading(true);
				setError(null);

				const [analytics, memory, recommendations, engine, roadmapResult, learnerStateResult] = await Promise.allSettled([
					fetchAnalytics(userId),
					fetchMemoryHealth(userId),
					fetchRecommendationInsights(userId),
					fetchEngineIntelligence(userId),
					fetchRoadmap(userId),
					fetchLearnerState(userId),
				]);

				const requiredResults = [analytics, memory, recommendations, engine];
				const failedRequired = requiredResults.find((result) => result.status === "rejected");
				if (failedRequired) throw failedRequired.reason;

				if (roadmapResult.status === "rejected") {
					setRoadmapError(roadmapResult.reason?.message || "Could not load roadmap.");
				} else {
					setRoadmapError(null);
				}

				setDashboardData({
					analytics: analytics.value,
					memory: memory.value,
					recommendations: recommendations.value,
					engine: engine.value,
					roadmap: roadmapResult.status === "fulfilled" ? roadmapResult.value : null,
					learnerState: learnerStateResult.status === "fulfilled" ? learnerStateResult.value : null,
				});
			} catch (err) {
				console.error("Error loading learner dashboard:", err);
				setError(err.message || "Could not load learner dashboard.");
			} finally {
				setLoading(false);
			}
		};

		loadDashboard();
	}, []);

	const summary = useMemo(() => {
		const analytics = dashboardData.analytics || {};
		const memory = dashboardData.memory || {};
		const recommendations = dashboardData.recommendations || {};
		const engine = dashboardData.engine || {};
		const learnerState = dashboardData.learnerState || {};
		const roadmap = dashboardData.roadmap || { nextLesson: learnerState.nextLesson || null, units: [] };
		const coveragePercent =
			learnerState.summary?.coveragePercent || engine.learningProgress?.coveragePercent || engine.engineHealth?.coveragePercent || 0;
		const weakSkills = learnerState.weakSkills || analytics.weakestSkills || engine.selectionInsights?.weakestTopics || [];
		const strongSkills = learnerState.strongSkills || analytics.strongestSkills || engine.selectionInsights?.strongestTopics || [];
		const prioritySkills = recommendations.learnerContext?.prioritySkills || [];
		const nextFocus = prioritySkills[0] || weakSkills[0] || recommendations.recommendations?.[0] || null;
		const nextLesson = learnerState.nextLesson || roadmap.nextLesson || null;
		const stage =
			learnerState.learnerStageLabel ||
			getLearnerStage({
				totalSessions: analytics.totalSessions || 0,
				averageAccuracy: analytics.averageAccuracy || 0,
				weakCount: weakSkills.length,
				coveragePercent,
			});

		return {
			analytics,
			memory,
			recommendations,
			engine,
			roadmap,
			learnerState,
			nextLesson,
			coveragePercent,
			weakSkills,
			strongSkills,
			prioritySkills,
			nextFocus,
			stage,
			stageMessage: learnerState.stageMessage || getStageMessage(stage),
			recentSessions: learnerState.recentSessions || analytics.recentSessions || engine.learningProgress?.timeline || [],
			reviewMemories:
				learnerState.reviewQueue ||
				(memory.memories || [])
					.filter((item) => item.isOverdue || item.isWeak || item.decayRisk >= 30)
					.slice(0, 5),
			averageAccuracy: learnerState.summary?.averageAccuracy ?? analytics.averageAccuracy,
			totalSessions: learnerState.summary?.totalSessions ?? analytics.totalSessions,
			nextDifficulty: recommendations.learnerContext?.targetDifficulty || "easy",
			recentAccuracy: recommendations.learnerContext?.recentAccuracy || 0,
			reviewLoadLabel: getReviewLoadLabel(learnerState.summary?.reviewQueueCount || 0),
			recentRhythmLabel: getRecentRhythmLabel(learnerState.summary?.averageAccuracy ?? analytics.averageAccuracy),
		};
	}, [dashboardData]);

	const handleStartLesson = async (lessonId) => {
		try {
			setIsStartingLesson(lessonId);
			const result = await startSession(lessonId);
			if (result.success) {
				navigate("/session");
			} else {
				setRoadmapError(result.message || "Could not start lesson.");
			}
		} finally {
			setIsStartingLesson(null);
		}
	};

	if (loading) {
		return (
			<Flex minH="70vh" align="center" justify="center">
				<VStack spacing={4}>
					<Spinner color="blue.500" size="xl" />
					<Text color="gray.600">Loading your learner dashboard...</Text>
				</VStack>
			</Flex>
		);
	}

	if (error) {
		return (
			<Container maxW="3xl" py={10}>
				<DashboardCard>
					<Heading size="md">Dashboard could not load</Heading>
					<Text color="gray.600" mt={3}>
						{error}
					</Text>
					<Button colorScheme="blue" mt={5} onClick={() => window.location.reload()}>
						Retry
					</Button>
				</DashboardCard>
			</Container>
		);
	}

	const hasSessions = (summary.analytics.totalSessions || 0) > 0;
	const primaryLessonId = summary.nextLesson?.id || summary.roadmap.nextLesson?.id;

	return (
		<Box bg="gray.50" minH="100vh" py={{ base: 5, md: 8 }}>
			<Container maxW="container.xl">
				<VStack align="stretch" spacing={6}>
					<DashboardCard p={6}>
						<Flex justify="space-between" gap={5} direction={{ base: "column", md: "row" }}>
							<Box>
								<Badge colorScheme="blue" mb={3}>
									{summary.stage}
								</Badge>
								<Heading size="xl" color="gray.800">
									Welcome back
								</Heading>
								<Text color="gray.600" mt={3} maxW="3xl">
									{summary.stageMessage}
								</Text>
								{summary.nextFocus ? (
									<Text color="gray.700" mt={3} fontWeight="medium">
										Today, Kokoro recommends focusing on {formatSkillName(summary.nextFocus)}.
									</Text>
								) : null}
							</Box>
							<HStack align="start">
								<Button
									colorScheme="blue"
									isLoading={isStartingLesson === primaryLessonId}
									onClick={() => (primaryLessonId ? handleStartLesson(primaryLessonId) : navigate("/session"))}
								>
									Continue Learning
								</Button>
							</HStack>
						</Flex>
					</DashboardCard>

					{!hasSessions ? (
						<DashboardCard p={6}>
							<Heading size="md">No completed sessions yet</Heading>
							<Text color="gray.600" mt={3}>
								Use the Continue Learning button above to finish one short session. After that, Kokoro will start showing review timing and next focus here.
							</Text>
						</DashboardCard>
					) : null}

					<SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
						<DashboardCard>
							<Text fontSize="sm" color="gray.500" fontWeight="semibold">
								Today&apos;s Focus
							</Text>
							<Heading size="md" mt={2}>
								{summary.nextFocus ? formatSkillName(summary.nextFocus) : "Start a short lesson"}
							</Heading>
							<Text color="gray.600" mt={2}>
								{summary.nextFocus?.reason
									? formatReason(summary.nextFocus.reason)
									: "Kokoro will choose a gentle starting point."}
							</Text>
						</DashboardCard>
						<DashboardCard>
							<Text fontSize="sm" color="gray.500" fontWeight="semibold">
								Review Load
							</Text>
							<Heading size="md" mt={2}>
								{summary.reviewLoadLabel}
							</Heading>
							<Text color="gray.600" mt={2}>
								{summary.reviewMemories.length > 0
									? `${summary.reviewMemories.length} item${summary.reviewMemories.length === 1 ? "" : "s"} are worth reviewing soon.`
									: "You can keep moving through the roadmap."}
							</Text>
						</DashboardCard>
						<DashboardCard>
							<Text fontSize="sm" color="gray.500" fontWeight="semibold">
								Recent Rhythm
							</Text>
							<Heading size="md" mt={2}>
								{summary.totalSessions || 0} completed sessions
							</Heading>
							<Text color="gray.600" mt={2}>
								{summary.recentRhythmLabel}
							</Text>
						</DashboardCard>
					</SimpleGrid>

					<DashboardCard p={6}>
						<Flex justify="space-between" gap={5} direction={{ base: "column", lg: "row" }}>
							<Box flex="1">
								<Badge colorScheme="purple" mb={3}>
									Roadmap
								</Badge>
								<Heading size="md">Your Learning Path</Heading>
								{roadmapError ? (
									<Text color="red.500" mt={3}>
										{roadmapError}
									</Text>
								) : summary.nextLesson ? (
									<VStack align="stretch" spacing={3} mt={4}>
										<Box>
											<Text fontSize="xl" fontWeight="bold">
												{summary.nextLesson.title}
											</Text>
											<Text color="gray.600" mt={1}>
												{summary.nextLesson.description}
											</Text>
										</Box>
										<HStack wrap="wrap">
											<Badge colorScheme={getLessonStatusColor(summary.nextLesson.status)}>
												{summary.nextLesson.status.replace("_", " ")}
											</Badge>
											<Badge colorScheme="gray">
												Next recommended lesson
											</Badge>
										</HStack>
									</VStack>
								) : (
									<Text color="gray.600" mt={3}>
										Your roadmap will appear once Kokoro can load the learning path.
									</Text>
								)}
							</Box>

							<Box flex="1.2">
								<Heading size="sm" mb={4}>
									{summary.roadmap.units?.[0]?.title || "Current Unit"}
								</Heading>
								<VStack align="stretch" spacing={3}>
									{summary.roadmap.units?.[0]?.lessons?.slice(0, 4).map((lesson) => (
										<RoadmapLessonRow
											key={lesson.id}
											lesson={lesson}
										/>
									)) || <Text color="gray.600">No roadmap lessons loaded yet.</Text>}
								</VStack>
							</Box>
						</Flex>
					</DashboardCard>

					<SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
						<DashboardCard p={6}>
							<Heading size="md">Next Focus</Heading>
							{summary.nextFocus ? (
								<VStack align="stretch" spacing={4} mt={4}>
									<Box>
										<Text fontSize="xl" fontWeight="bold">
											{formatSkillName(summary.nextFocus)}
										</Text>
										<Text color="gray.600" mt={1}>
											{summary.nextFocus.reason
												? formatReason(summary.nextFocus.reason)
												: "Kokoro picked this because it best balances review and progress."}
										</Text>
									</Box>
									{summary.nextFocus.reason ? (
										<Badge alignSelf="start" colorScheme="orange">
											Recommended now
										</Badge>
									) : null}
								</VStack>
							) : (
								<Text color="gray.600" mt={3}>
									No next focus yet. Complete a session so Kokoro can choose one.
								</Text>
							)}
						</DashboardCard>

						<DashboardCard p={6}>
							<Heading size="md">Review Soon</Heading>
							<VStack align="stretch" spacing={4} mt={4}>
								{summary.reviewMemories.slice(0, 4).length > 0 ? (
									summary.reviewMemories.slice(0, 4).map((skill) => (
										<Box key={skill.skillId || `${skill.topic}-${skill.subtopic}`}>
											<Text fontWeight="semibold">{formatSkillName(skill)}</Text>
											<Text fontSize="sm" color="gray.600">
												{skill.isOverdue ? "This is overdue, so Kokoro will try to refresh it soon." : "This is worth refreshing soon."}
											</Text>
										</Box>
									))
								) : (
									<Text color="gray.600">No urgent review items right now.</Text>
								)}
							</VStack>
						</DashboardCard>

						<DashboardCard p={6}>
							<Heading size="md">Getting Stronger</Heading>
							<VStack align="stretch" spacing={4} mt={4}>
								{summary.strongSkills.slice(0, 4).length > 0 ? (
									summary.strongSkills.slice(0, 4).map((skill) => (
										<SkillRow key={skill.skillId || `${skill.topic}-${skill.subtopic}`} skill={skill} variant="strong" />
									))
								) : (
									<Text color="gray.600">Strong skills will appear after a few successful sessions.</Text>
								)}
							</VStack>
						</DashboardCard>
					</SimpleGrid>

					<SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
						<DashboardCard p={6}>
							<Heading size="md">Skills To Practice</Heading>
							<VStack align="stretch" spacing={4} mt={4}>
								{summary.weakSkills.slice(0, 5).length > 0 ? (
									summary.weakSkills.slice(0, 5).map((skill) => (
										<SkillRow key={skill.skillId || `${skill.topic}-${skill.subtopic}`} skill={skill} />
									))
								) : (
									<Text color="gray.600">No weak skills are standing out right now.</Text>
								)}
							</VStack>
						</DashboardCard>

						<DashboardCard p={6}>
							<Heading size="md">Recent Sessions</Heading>
							<VStack align="stretch" spacing={3} mt={4}>
								{summary.recentSessions.slice(0, 6).length > 0 ? (
									summary.recentSessions.slice(0, 6).map((session) => (
										<HStack key={session.sessionId} justify="space-between" borderBottomWidth="1px" borderColor="gray.100" pb={3}>
											<Box>
												<Text fontWeight="semibold">
													{session.completedAt || session.date
														? new Date(session.completedAt || session.date).toLocaleDateString()
														: "Recent session"}
												</Text>
												<Text fontSize="sm" color="gray.500">
													Accuracy this session
												</Text>
											</Box>
											<Badge colorScheme={(session.accuracy || 0) >= 80 ? "green" : (session.accuracy || 0) >= 60 ? "blue" : "orange"}>
												{formatPercent(session.accuracy)}
											</Badge>
										</HStack>
									))
								) : (
									<Text color="gray.600">Recent sessions will appear here after practice.</Text>
								)}
							</VStack>
						</DashboardCard>
					</SimpleGrid>

					<DashboardCard p={6}>
						<Heading size="md">Why Kokoro Recommends This</Heading>
						<SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={4}>
							{(summary.recommendations.learnerContext?.prioritySkills || []).slice(0, 3).map((skill) => (
								<Box key={skill.skillId || skill.skillName} bg="gray.50" borderRadius="md" p={4}>
									<Text fontWeight="semibold">{formatSkillName(skill)}</Text>
									<Badge colorScheme="blue" mt={2}>
										Recommended
									</Badge>
									<Text fontSize="sm" color="gray.600" mt={3}>
										{formatReason(skill.reason)}
									</Text>
								</Box>
							))}
							{(summary.recommendations.learnerContext?.prioritySkills || []).length === 0 ? (
								<Text color="gray.600">Kokoro needs more attempts before recommendation reasons become useful.</Text>
							) : null}
						</SimpleGrid>
					</DashboardCard>
				</VStack>
			</Container>
		</Box>
	);
};

export default DashboardPage;
