import React from "react";
import {
	Box,
	VStack,
	HStack,
	Text,
	Spinner,
	useColorMode,
} from "@chakra-ui/react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";

/**
 * Difficulty Adaptation Chart Component
 * Visualizes cognitive load balancing over sessions
 */
const DifficultyAdaptationChart = ({ analytics, loading = false }) => {
	const { colorMode } = useColorMode();
	const isDark = colorMode === "dark";

	if (loading) {
		return (
			<Box p={6} bg={isDark ? "gray.800" : "white"} borderRadius="lg" boxShadow="md">
				<Spinner />
			</Box>
		);
	}

	if (!analytics || !analytics.recentSessions || analytics.recentSessions.length === 0) {
		return (
			<Box p={6} bg={isDark ? "gray.800" : "white"} borderRadius="lg" boxShadow="md">
				<Text>No difficulty data available</Text>
			</Box>
		);
	}

	// Aggregate difficulty distribution from recent sessions
	const difficultyData = analytics.recentSessions
		.slice()
		.reverse()
		.map((session, index) => ({
			session: `S${index + 1}`,
			easy:
				session.analytics?.difficultyBreakdown?.easy?.total || 0,
			medium:
				session.analytics?.difficultyBreakdown?.medium?.total || 0,
			hard:
				session.analytics?.difficultyBreakdown?.hard?.total || 0,
			easyAccuracy:
				session.analytics?.difficultyBreakdown?.easy?.accuracy
					? Math.round(session.analytics.difficultyBreakdown.easy.accuracy * 100)
					: 0,
			mediumAccuracy:
				session.analytics?.difficultyBreakdown?.medium?.accuracy
					? Math.round(session.analytics.difficultyBreakdown.medium.accuracy * 100)
					: 0,
			hardAccuracy:
				session.analytics?.difficultyBreakdown?.hard?.accuracy
					? Math.round(session.analytics.difficultyBreakdown.hard.accuracy * 100)
					: 0,
		}));

	return (
		<Box p={6} bg={isDark ? "gray.800" : "white"} borderRadius="lg" boxShadow="md">
			<VStack align="start" spacing={4}>
				<HStack justify="space-between" w="full">
					<Text fontSize="lg" fontWeight="bold">
						🎯 Difficulty Adaptation
					</Text>
					<Text fontSize="sm" color="gray.500">
						Cognitive load balancing
					</Text>
				</HStack>

				{/* Distribution chart */}
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={difficultyData}>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke={isDark ? "gray.600" : "gray.200"}
						/>
						<XAxis
							dataKey="session"
							tick={{ fill: isDark ? "white" : "black" }}
						/>
						<YAxis
							domain={[0, 10]}
							tick={{ fill: isDark ? "white" : "black" }}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: isDark ? "#2D3748" : "white",
								border: "1px solid gray",
							}}
						/>
						<Legend />
						<Bar
							dataKey="easy"
							fill="#48bb78"
							name="Easy"
						/>
						<Bar
							dataKey="medium"
							fill="#fbbf24"
							name="Medium"
						/>
						<Bar
							dataKey="hard"
							fill="#f87171"
							name="Hard"
						/>
					</BarChart>
				</ResponsiveContainer>

				{/* Accuracy insights */}
				<Box
					p={4}
					bg={isDark ? "gray.700" : "gray.50"}
					borderRadius="md"
					w="full"
					fontSize="sm"
				>
					<Text fontWeight="bold" mb={2}>
						📊 Accuracy by Difficulty
					</Text>
					<HStack spacing={6}>
						<VStack align="start" spacing={1}>
							<Text>Easy Questions</Text>
							<Text fontSize="lg" fontWeight="bold" color="green.400">
								{Math.round(
									difficultyData.reduce((sum, d) => sum + d.easyAccuracy, 0) /
										difficultyData.length
								)}
								%
							</Text>
						</VStack>
						<VStack align="start" spacing={1}>
							<Text>Medium Questions</Text>
							<Text fontSize="lg" fontWeight="bold" color="yellow.400">
								{Math.round(
									difficultyData.reduce((sum, d) => sum + d.mediumAccuracy, 0) /
										difficultyData.length
								)}
								%
							</Text>
						</VStack>
						<VStack align="start" spacing={1}>
							<Text>Hard Questions</Text>
							<Text fontSize="lg" fontWeight="bold" color="red.400">
								{Math.round(
									difficultyData.reduce((sum, d) => sum + d.hardAccuracy, 0) /
										difficultyData.length
								)}
								%
							</Text>
						</VStack>
					</HStack>
				</Box>

				{/* Insights */}
				<Box
					p={4}
					bg={isDark ? "gray.700" : "gray.50"}
					borderRadius="md"
					w="full"
					fontSize="xs"
				>
					<Text fontWeight="bold" mb={2}>
						💡 Adaptive Insights
					</Text>
					<VStack align="start" spacing={1}>
						<Text>
							✓ System adapts difficulty based on your accuracy
						</Text>
						<Text>
							✓ Balanced cognitive load prevents overload
						</Text>
						<Text>
							✓ Difficulty preference matches your learning level
						</Text>
					</VStack>
				</Box>
			</VStack>
		</Box>
	);
};

export default DifficultyAdaptationChart;
