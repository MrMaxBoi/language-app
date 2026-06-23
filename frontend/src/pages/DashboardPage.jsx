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
import {
	fetchAnalytics,
	fetchEngineIntelligence,
	fetchMemoryHealth,
	fetchRecommendationInsights,
} from "../services/dashboard.service.js";

const userId = "guest";

const formatPercent = (value) => `${Math.round(Number(value) || 0)}%`;

const formatSkillName = (skill = {}) =>
	skill.skillName || skill.subtopic || skill.topic || skill.skillId || "Unknown skill";

const formatReason = (reason = "") =>
	reason
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");

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

const MetricCard = ({ label, value, detail, color = "blue" }) => (
	<DashboardCard>
		<Text fontSize="sm" color="gray.500" fontWeight="semibold">
			{label}
		</Text>
		<Heading size="lg" color={`${color}.600`} mt={2}>
			{value}
		</Heading>
		{detail ? (
			<Text fontSize="sm" color="gray.600" mt={2}>
				{detail}
			</Text>
		) : null}
	</DashboardCard>
);

const SkillRow = ({ skill, variant = "weak" }) => {
	const mastery = getMasteryPercent(skill);
	const color = variant === "strong" ? "green" : variant === "review" ? "orange" : "blue";

	return (
		<Box>
			<HStack justify="space-between" align="start" mb={2}>
				<Box>
					<Text fontWeight="semibold">{formatSkillName(skill)}</Text>
					<Text fontSize="sm" color="gray.500">
						{skill.topic || "Skill"} {skill.subtopic ? `/ ${skill.subtopic}` : ""}
					</Text>
				</Box>
				<Badge colorScheme={color}>{formatPercent(mastery)}</Badge>
			</HStack>
			<Progress value={mastery} colorScheme={color} borderRadius="full" />
		</Box>
	);
};

const DashboardPage = () => {
	const navigate = useNavigate();
	const [dashboardData, setDashboardData] = useState({
		analytics: null,
		memory: null,
		recommendations: null,
		engine: null,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const loadDashboard = async () => {
			try {
				setLoading(true);
				setError(null);

				const [analytics, memory, recommendations, engine] = await Promise.all([
					fetchAnalytics(userId),
					fetchMemoryHealth(userId),
					fetchRecommendationInsights(userId),
					fetchEngineIntelligence(userId),
				]);

				setDashboardData({ analytics, memory, recommendations, engine });
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
		const coveragePercent = engine.learningProgress?.coveragePercent || engine.engineHealth?.coveragePercent || 0;
		const weakSkills = analytics.weakestSkills || engine.selectionInsights?.weakestTopics || [];
		const strongSkills = analytics.strongestSkills || engine.selectionInsights?.strongestTopics || [];
		const prioritySkills = recommendations.learnerContext?.prioritySkills || [];
		const nextFocus = prioritySkills[0] || weakSkills[0] || recommendations.recommendations?.[0] || null;
		const stage = getLearnerStage({
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
			coveragePercent,
			weakSkills,
			strongSkills,
			prioritySkills,
			nextFocus,
			stage,
			recentSessions: analytics.recentSessions || engine.learningProgress?.timeline || [],
			reviewMemories: (memory.memories || [])
				.filter((item) => item.isOverdue || item.isWeak || item.decayRisk >= 30)
				.slice(0, 5),
		};
	}, [dashboardData]);

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
									Your Kokoro Dashboard
								</Heading>
								<Text color="gray.600" mt={3} maxW="3xl">
									{getStageMessage(summary.stage)}
								</Text>
							</Box>
							<HStack align="start">
								<Button colorScheme="blue" onClick={() => navigate("/session")}>
									Start Learning
								</Button>
								<Button variant="outline" onClick={() => navigate("/engine")}>
									Engine View
								</Button>
							</HStack>
						</Flex>
					</DashboardCard>

					{!hasSessions ? (
						<DashboardCard p={6}>
							<Heading size="md">No completed sessions yet</Heading>
							<Text color="gray.600" mt={3}>
								Finish one short session and Kokoro will start showing weak skills, review timing, and next focus here.
							</Text>
							<Button colorScheme="blue" mt={5} onClick={() => navigate("/session")}>
								Start First Session
							</Button>
						</DashboardCard>
					) : null}

					<SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
						<MetricCard
							label="Average Accuracy"
							value={formatPercent(summary.analytics.averageAccuracy)}
							detail={`${summary.analytics.totalSessions || 0} completed sessions`}
						/>
						<MetricCard
							label="Skill Coverage"
							value={formatPercent(summary.coveragePercent)}
							detail="Canonical skill graph exposure"
							color="purple"
						/>
						<MetricCard
							label="Memory Health"
							value={formatPercent(summary.memory.healthScore)}
							detail={`${summary.memory.healthMetrics?.overdueCount || 0} due for review`}
							color="green"
						/>
						<MetricCard
							label="Next Difficulty"
							value={summary.recommendations.learnerContext?.targetDifficulty || "easy"}
							detail={`${summary.recommendations.learnerContext?.recentAccuracy || 0}% recent accuracy`}
							color="orange"
						/>
					</SimpleGrid>

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
											Kokoro will likely use this to balance review and progress.
										</Text>
									</Box>
									{summary.nextFocus.reason ? (
										<Badge alignSelf="start" colorScheme="orange">
											{formatReason(summary.nextFocus.reason)}
										</Badge>
									) : null}
									<Button colorScheme="blue" onClick={() => navigate("/session")}>
										Practice This Next
									</Button>
								</VStack>
							) : (
								<Text color="gray.600" mt={3}>
									No next focus yet. Complete a session so Kokoro can choose one.
								</Text>
							)}
						</DashboardCard>

						<DashboardCard p={6}>
							<Heading size="md">Needs Review</Heading>
							<VStack align="stretch" spacing={4} mt={4}>
								{summary.weakSkills.slice(0, 4).length > 0 ? (
									summary.weakSkills.slice(0, 4).map((skill) => (
										<SkillRow key={skill.skillId || `${skill.topic}-${skill.subtopic}`} skill={skill} />
									))
								) : (
									<Text color="gray.600">No weak skills are standing out right now.</Text>
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
							<Heading size="md">Review Queue</Heading>
							<VStack align="stretch" spacing={4} mt={4}>
								{summary.reviewMemories.length > 0 ? (
									summary.reviewMemories.map((memory) => (
										<Box key={memory.skillId || `${memory.topic}-${memory.subtopic}`}>
											<HStack justify="space-between" mb={2}>
												<Box>
													<Text fontWeight="semibold">{formatSkillName(memory)}</Text>
													<Text fontSize="sm" color="gray.500">
														{memory.isOverdue ? "Due now" : "Worth reviewing soon"}
													</Text>
												</Box>
												<Badge colorScheme={memory.isOverdue ? "red" : "orange"}>
													{formatPercent((memory.strength || 0) * 100)}
												</Badge>
											</HStack>
											<Progress value={(memory.strength || 0) * 100} colorScheme="orange" borderRadius="full" />
										</Box>
									))
								) : (
									<Text color="gray.600">No urgent review items right now.</Text>
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
										{formatReason(skill.reason)}
									</Badge>
									<Text fontSize="sm" color="gray.600" mt={3}>
										Urgency score: {skill.urgency}
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
