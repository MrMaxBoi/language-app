import React, { useState, useEffect } from "react";
import {
	Box,
	Container,
	Heading,
	Spinner,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	SimpleGrid,
	Text,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	TableContainer,
	Tag,
	Stack,
	useColorModeValue,
	useToast,
} from "@chakra-ui/react";
import { fetchEngineIntelligence } from "../services/dashboard.service.js";

const MetricCard = ({ label, value, helpText, bg }) => (
	<Box p={4} bg={bg} borderRadius="lg" boxShadow="sm">
		<Stat>
			<StatLabel>{label}</StatLabel>
			<StatNumber>{value}</StatNumber>
			{helpText ? <StatHelpText>{helpText}</StatHelpText> : null}
		</Stat>
	</Box>
);

const formatSkillLabel = (item = {}) =>
	item.skillName || item.subtopic || item.topic || item.skillId || "Unknown skill";

const AdaptiveEngineDashboard = () => {
	const [engineData, setEngineData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const toast = useToast();
	const bgCard = useColorModeValue("white", "gray.800");
	const bgPage = useColorModeValue("gray.50", "gray.900");
	const userId = "guest";

	useEffect(() => {
		const loadEngineData = async () => {
			try {
				setLoading(true);
				setError(null);
				const data = await fetchEngineIntelligence(userId);
				setEngineData(data);
				toast({
					title: "Adaptive engine data loaded",
					status: "success",
					duration: 2000,
					isClosable: true,
				});
			} catch (err) {
				console.error("Error loading engine intelligence:", err);
				setError(err.message || "Failed to load dashboard data");
				toast({
					title: "Unable to load dashboard",
					description: err.message,
					status: "error",
					duration: 4000,
					isClosable: true,
				});
			} finally {
				setLoading(false);
			}
		};
		loadEngineData();
	}, [toast]);

	if (loading) {
		return (
			<Box minH="100vh" py={16} bg={bgPage}>
				<Container maxW="container.xl" textAlign="center">
					<Spinner size="xl" />
					<Text mt={4}>Loading adaptive engine intelligence...</Text>
				</Container>
			</Box>
		);
	}

	if (error) {
		return (
			<Box minH="100vh" py={16} bg={bgPage}>
				<Container maxW="container.xl">
					<Box p={6} bg={bgCard} borderRadius="lg" boxShadow="md">
						<Heading size="md" mb={4}>
							Failed to load engine data
						</Heading>
						<Text>{error}</Text>
					</Box>
				</Container>
			</Box>
		);
	}

	const {
		skills,
		memories,
		coverage,
		skillGraph,
		exposure,
		analytics,
		engineHealth,
		learningProgress,
		selectionInsights,
	} = engineData || {};

	return (
		<Box minH="100vh" py={8} bg={bgPage}>
			<Container maxW="container.xl">
				<Stack spacing={8}>
					<Box>
						<Heading>Adaptive Intelligence Dashboard</Heading>
						<Text mt={2} color="gray.500">
							Developer view of adaptive engine state, selection quality, and coverage progress.
						</Text>
					</Box>

					{/* Learning State */}
					<Box p={6} bg={bgCard} borderRadius="xl" boxShadow="sm">
						<Heading size="md" mb={4}>
							1. Learning State
						</Heading>
						<SimpleGrid columns={{ base: 1, md: 3, xl: 6 }} spacing={4}>
							<MetricCard label="Skills Tracked" value={skills?.length ?? 0} helpText="Current skill subtopics" bg={bgCard} />
							<MetricCard label="Memory Entries" value={memories?.length ?? 0} helpText="Spaced repetition memories" bg={bgCard} />
							<MetricCard label="Graph Skills" value={skillGraph?.totalSkills ?? coverage?.coverageMetrics?.totalSubtopics ?? 0} helpText="Canonical N5 skill graph" bg={bgCard} />
							<MetricCard label="Skills With Questions" value={skillGraph?.mappedSkills ?? coverage?.coverageMetrics?.coveredSubtopics ?? 0} helpText="Graph skills backed by content" bg={bgCard} />
							<MetricCard label="Content Gaps" value={skillGraph?.unmappedSkills ?? coverage?.coverageMetrics?.uncoveredSubtopics ?? 0} helpText="Graph skills needing questions" bg={bgCard} />
							<MetricCard label="Avg Skill Mastery" value={`${learningProgress?.avgSkillMastery ?? 0}%`} helpText="Mean skill mastery" bg={bgCard} />
						</SimpleGrid>
					</Box>

					{/* Skill Graph Readiness */}
					<Box p={6} bg={bgCard} borderRadius="xl" boxShadow="sm">
						<Heading size="md" mb={4}>
							2. Skill Graph Readiness
						</Heading>
						<SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
							<MetricCard label="Mapped Questions" value={skillGraph?.mappedQuestions ?? 0} helpText="Questions resolved to canonical skills" bg={bgCard} />
							<MetricCard label="Generated Fallbacks" value={skillGraph?.generatedFallbackCount ?? 0} helpText="Question mappings missing from graph" bg={bgCard} />
							<MetricCard label="Mapped Skills" value={skillGraph?.mappedSkills ?? 0} helpText="Skills with at least one question" bg={bgCard} />
							<MetricCard label="Missing Content" value={skillGraph?.unmappedSkills ?? 0} helpText="Planned N5 skills with no questions yet" bg={bgCard} />
						</SimpleGrid>
						<TableContainer>
							<Table variant="simple" size="sm">
								<Thead>
									<Tr>
										<Th>Skill</Th>
										<Th>Strand</Th>
										<Th>Domain</Th>
										<Th>Prerequisites</Th>
									</Tr>
								</Thead>
								<Tbody>
									{skillGraph?.skillsNeedingQuestions?.slice(0, 8).map((skill) => (
										<Tr key={skill.skillId}>
											<Td>{skill.skillName}</Td>
											<Td>{skill.strand}</Td>
											<Td>{skill.domain}</Td>
											<Td>{skill.prerequisites?.slice(0, 2).join(", ") || "—"}</Td>
										</Tr>
									))}
								</Tbody>
							</Table>
						</TableContainer>
					</Box>

					{/* Engine Health */}
					<Box p={6} bg={bgCard} borderRadius="xl" boxShadow="sm">
						<Heading size="md" mb={4}>
							3. Engine Health
						</Heading>
						<SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
							<MetricCard label="Repeat Rate" value={`${Math.round((engineHealth?.repeatRate ?? 0) * 100)}%`} helpText="Higher means more repeated questions" bg={bgCard} />
							<MetricCard label="Diversity Score" value={`${engineHealth?.diversityScore ?? 0}%`} helpText="Topic diversity in recent practice" bg={bgCard} />
							<MetricCard label="Coverage %" value={`${Math.round(engineHealth?.coveragePercent ?? 0)}%`} helpText="Subtopic coverage achieved" bg={bgCard} />
							<MetricCard label="Recommendation Effectiveness" value={`${engineHealth?.recommendationEffectiveness ?? 0}%`} helpText="Historical recommendation success" bg={bgCard} />
						</SimpleGrid>
					</Box>

					{/* Selection Intelligence */}
					<Box p={6} bg={bgCard} borderRadius="xl" boxShadow="sm">
						<Heading size="md" mb={4}>
							4. Selection Intelligence
						</Heading>
						<SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
							<Box>
								<Heading size="sm" mb={3}>
									Top Reason Signals
								</Heading>
								{selectionInsights?.topReasons?.length ? (
									<Stack spacing={2}>
										{selectionInsights.topReasons.map((item) => (
											<Tag size="lg" key={item.reason}>
												{item.reason} — {item.count}
											</Tag>
										))}
									</Stack>
								) : (
									<Text>No selection reason data available.</Text>
								)}
							</Box>
							<Box>
								<Heading size="sm" mb={3}>
									Weakest and Strongest Skills
								</Heading>
								<Box mb={3}>
									<Text fontWeight="bold">Weakest</Text>
									{selectionInsights?.weakestTopics?.length ? (
										<Stack spacing={1}>
											{selectionInsights.weakestTopics.map((topic) => (
												<Tag key={topic.skillId || `${topic.topic}-${topic.subtopic}`}>
													{formatSkillLabel(topic)} ({Math.round(topic.mastery * 100)}%)
												</Tag>
											))}
										</Stack>
									) : (
										<Text>No weak skills found.</Text>
									)}
								</Box>
								<Box>
									<Text fontWeight="bold">Strongest</Text>
									{selectionInsights?.strongestTopics?.length ? (
										<Stack spacing={1}>
											{selectionInsights.strongestTopics.map((topic) => (
												<Tag key={topic.skillId || `${topic.topic}-${topic.subtopic}`}>
													{formatSkillLabel(topic)} ({Math.round(topic.mastery * 100)}%)
												</Tag>
											))}
										</Stack>
									) : (
										<Text>No strong skills found.</Text>
									)}
								</Box>
							</Box>
						</SimpleGrid>
					</Box>

					{/* Coverage Analysis */}
					<Box p={6} bg={bgCard} borderRadius="xl" boxShadow="sm">
						<Heading size="md" mb={4}>
							5. Coverage Analysis
						</Heading>
						<SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
							<MetricCard label="Topic Coverage" value={`${coverage?.coverageMetrics?.topicCoveragePercent ?? 0}%`} helpText="Average topic coverage" bg={bgCard} />
							<MetricCard label="Skill Coverage" value={`${coverage?.coverageMetrics?.subtopicCoveragePercent ?? 0}%`} helpText="Percent of skills covered" bg={bgCard} />
							<MetricCard label="Uncovered Skills" value={coverage?.coverageMetrics?.uncoveredSubtopics ?? 0} helpText="Skills needing more exposure" bg={bgCard} />
						</SimpleGrid>
						<TableContainer>
							<Table variant="simple" size="sm">
								<Thead>
									<Tr>
										<Th>Skill</Th>
										<Th>Domain</Th>
										<Th>Exposure</Th>
										<Th>Mastery</Th>
									</Tr>
								</Thead>
								<Tbody>
									{coverage?.uncoveredSubtopics?.slice(0, 10).map((item) => (
										<Tr key={item.skillId || `${item.topic}-${item.subtopic}`}>
											<Td>{formatSkillLabel(item)}</Td>
											<Td>{item.topic}</Td>
											<Td>{item.exposureCount}</Td>
											<Td>{Math.round((item.mastery || 0) * 100)}%</Td>
										</Tr>
									))}
								</Tbody>
							</Table>
						</TableContainer>
					</Box>

					{/* Exposure Analysis */}
					<Box p={6} bg={bgCard} borderRadius="xl" boxShadow="sm">
						<Heading size="md" mb={4}>
							6. Exposure Analysis
						</Heading>
						<TableContainer>
							<Table variant="striped" size="sm">
								<Thead>
									<Tr>
										<Th>Question ID</Th>
										<Th>Exposure Count</Th>
										<Th>Last Seen</Th>
									</Tr>
								</Thead>
								<Tbody>
									{exposure?.slice(0, 10).map((item) => (
										<Tr key={item.questionId}>
											<Td>{item.questionId}</Td>
											<Td>{item.exposureCount || 0}</Td>
											<Td>{item.lastSeenAt ? new Date(item.lastSeenAt).toLocaleString() : "—"}</Td>
										</Tr>
									))}
								</Tbody>
							</Table>
						</TableContainer>
					</Box>

					{/* Recommendation Analysis */}
					<Box p={6} bg={bgCard} borderRadius="xl" boxShadow="sm">
						<Heading size="md" mb={4}>
							7. Recommendation Analysis
						</Heading>
						<SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
							<MetricCard label="Avg Accuracy" value={`${analytics?.averageAccuracy ?? 0}%`} helpText="From completed sessions" bg={bgCard} />
							<MetricCard label="Recommendation Effectiveness" value={`${analytics?.averageRecommendationEffectiveness ?? 0}%`} helpText="Historical system effectiveness" bg={bgCard} />
							<MetricCard label="Total Sessions" value={analytics?.totalSessions ?? 0} helpText="Completed sessions" bg={bgCard} />
						</SimpleGrid>
						<TableContainer>
							<Table variant="simple" size="sm">
								<Thead>
									<Tr>
										<Th>Session</Th>
										<Th>Accuracy</Th>
										<Th>Effectiveness</Th>
										<Th>Weak Topics</Th>
										<Th>Strong Topics</Th>
									</Tr>
								</Thead>
								<Tbody>
									{learningProgress?.timeline?.map((session) => (
										<Tr key={session.sessionId}>
											<Td>{new Date(session.date).toLocaleDateString()}</Td>
											<Td>{session.accuracy}%</Td>
											<Td>{session.recommendationEffectiveness}%</Td>
											<Td>{session.weakTopics?.slice(0, 2).map((t) => `${t}`).join(", ")}</Td>
											<Td>{session.strongTopics?.slice(0, 2).map((t) => `${t}`).join(", ")}</Td>
										</Tr>
									))}
								</Tbody>
							</Table>
						</TableContainer>
					</Box>
				</Stack>
			</Container>
		</Box>
	);
};

export default AdaptiveEngineDashboard;
