import React, { useState, useEffect } from "react";
import {
	Box,
	VStack,
	HStack,
	Text,
	SimpleGrid,
	Spinner,
	useColorMode,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	StatArrow,
	Container,
	Heading,
	useToast,
} from "@chakra-ui/react";
import {
	fetchAnalytics,
	fetchMemoryHealth,
	fetchRecommendationInsights,
} from "../services/dashboard.service.js";
import SkillMasteryChart from "../components/SkillMasteryChart.jsx";
import MemoryHealthPanel from "../components/MemoryHealthPanel.jsx";
import SessionTimeline from "../components/SessionTimeline.jsx";
import DifficultyAdaptationChart from "../components/DifficultyAdaptationChart.jsx";
import RecommendationInsights from "../components/RecommendationInsights.jsx";

/**
 * Dashboard Page Component
 * Main intelligence dashboard for learner analytics
 */
const DashboardPage = () => {
	const { colorMode } = useColorMode();
	const isDark = colorMode === "dark";
	const toast = useToast();

	const [analytics, setAnalytics] = useState(null);
	const [memoryHealth, setMemoryHealth] = useState(null);
	const [recommendations, setRecommendations] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const userId = "guest";

	// ==========================================
	// LOAD ALL DASHBOARD DATA
	// ==========================================

	useEffect(() => {
		const loadDashboardData = async () => {
			try {
				setLoading(true);
				setError(null);

				const [analyticsData, memoryData, recommendationsData] =
					await Promise.all([
						fetchAnalytics(userId),
						fetchMemoryHealth(userId),
						fetchRecommendationInsights(userId),
					]);

				setAnalytics(analyticsData);
				setMemoryHealth(memoryData);
				setRecommendations(recommendationsData);

				toast({
					title: "Dashboard loaded",
					status: "success",
					duration: 2,
					isClosable: true,
				});
			} catch (err) {
				console.error("Error loading dashboard:", err);
				setError(err.message);
				toast({
					title: "Error loading dashboard",
					description: err.message,
					status: "error",
					duration: 4,
					isClosable: true,
				});
			} finally {
				setLoading(false);
			}
		};

		loadDashboardData();
	}, [userId, toast]);

	// ==========================================
	// RENDER
	// ==========================================

	return (
		<Box minH="100vh" bg={isDark ? "gray.900" : "gray.50"} py={8}>
			<Container maxW="container.xl">
				<VStack align="start" spacing={8}>
					{/* Header */}
					<VStack align="start" spacing={2}>
						<Heading size="lg" color={isDark ? "white" : "black"}>
							🎯 Learner Intelligence Dashboard
						</Heading>
						<Text color="gray.500" fontSize="sm">
							Real-time adaptive learning analytics & recommendation transparency
						</Text>
					</VStack>

					{/* Loading state */}
					{loading && (
						<Box w="full" py={12} textAlign="center">
							<Spinner size="lg" />
							<Text mt={4} color="gray.500">
								Loading your intelligence dashboard...
							</Text>
						</Box>
					)}

					{/* Error state */}
					{error && !loading && (
						<Box
							p={4}
							bg="red.50"
							borderRadius="md"
							border="1px solid red.200"
							w="full"
						>
							<Text color="red.700">
								Error: {error}. Please refresh the page.
							</Text>
						</Box>
					)}

					{/* Overall Performance Section */}
					{!loading && analytics && (
						<>
							<Box w="full">
								<Heading size="md" mb={4}>
									📊 Overall Performance
								</Heading>
								<SimpleGrid
									columns={{ base: 1, md: 2, lg: 5 }}
									spacing={4}
									w="full"
								>
									<Box
										p={4}
										bg={isDark ? "gray.800" : "white"}
										borderRadius="lg"
										boxShadow="md"
									>
										<Stat>
											<StatLabel>Average Accuracy</StatLabel>
											<StatNumber>
												{analytics.averageAccuracy}%
											</StatNumber>
											<StatHelpText>
												across all sessions
											</StatHelpText>
										</Stat>
									</Box>
									<Box
										p={4}
										bg={isDark ? "gray.800" : "white"}
										borderRadius="lg"
										boxShadow="md"
									>
										<Stat>
											<StatLabel>
												Recommendation Effectiveness
											</StatLabel>
											<StatNumber>
												{analytics.averageRecommendationEffectiveness}%
											</StatNumber>
											<StatHelpText>
												system quality
											</StatHelpText>
										</Stat>
									</Box>
									<Box
										p={4}
										bg={isDark ? "gray.800" : "white"}
										borderRadius="lg"
										boxShadow="md"
									>
										<Stat>
											<StatLabel>Total Sessions</StatLabel>
											<StatNumber>
												{analytics.totalSessions}
											</StatNumber>
											<StatHelpText>
												learning sessions
											</StatHelpText>
										</Stat>
									</Box>
									<Box
										p={4}
										bg={isDark ? "gray.800" : "white"}
										borderRadius="lg"
										boxShadow="md"
									>
										<Stat>
											<StatLabel>
												{analytics.weakestTopics
													?.length > 0
													? "Weakest Topics"
													: "Topics"}
											</StatLabel>
											<StatNumber>
												{analytics.weakestTopics?.length ||
													0}
											</StatNumber>
											<StatHelpText>
												needing focus
											</StatHelpText>
										</Stat>
									</Box>
									<Box
										p={4}
										bg={isDark ? "gray.800" : "white"}
										borderRadius="lg"
										boxShadow="md"
									>
										<Stat>
											<StatLabel>
												{analytics.strongestTopics
													?.length > 0
													? "Strongest Topics"
													: "Topics"}
											</StatLabel>
											<StatNumber>
												{analytics.strongestTopics?.length ||
													0}
											</StatNumber>
											<StatHelpText>
												mastered
											</StatHelpText>
										</Stat>
									</Box>
								</SimpleGrid>
							</Box>

							{/* Session Timeline */}
							<Box w="full">
								<SessionTimeline
									analytics={analytics}
									loading={loading}
								/>
							</Box>

							{/* Difficulty & Skills Grid */}
							<SimpleGrid
								columns={{ base: 1, lg: 2 }}
								spacing={6}
								w="full"
							>
								<Box>
									<SkillMasteryChart
										analytics={analytics}
										loading={loading}
									/>
								</Box>
								<Box>
									<DifficultyAdaptationChart
										analytics={analytics}
										loading={loading}
									/>
								</Box>
							</SimpleGrid>

							{/* Memory Health */}
							<Box w="full">
								{memoryHealth && (
									<MemoryHealthPanel
										memoryHealth={memoryHealth}
										loading={loading}
									/>
								)}
							</Box>

							{/* Recommendation Transparency */}
							<Box w="full">
								{recommendations && (
									<RecommendationInsights
										recommendations={recommendations}
										loading={loading}
									/>
								)}
							</Box>
						</>
					)}
				</VStack>
			</Container>
		</Box>
	);
};

export default DashboardPage;
