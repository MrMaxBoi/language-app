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
	LineChart,
	Line,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";

/**
 * Session Timeline Component
 * Visualizes learning progress over time
 */
const SessionTimeline = ({ analytics, loading = false }) => {
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
				<Text>No session data available</Text>
			</Box>
		);
	}

	// Prepare timeline data
	const timelineData = analytics.recentSessions
		.slice()
		.reverse()
		.map((session, index) => ({
			session: `Session ${index + 1}`,
			accuracy: session.accuracy || 0,
			effectiveness:
				session.analytics?.recommendationEffectiveness
					? Math.round(session.analytics.recommendationEffectiveness * 100)
					: 0,
			date: session.completedAt
				? new Date(session.completedAt).toLocaleDateString()
				: "",
		}));

	return (
		<Box p={6} bg={isDark ? "gray.800" : "white"} borderRadius="lg" boxShadow="md">
			<VStack align="start" spacing={4}>
				<HStack justify="space-between" w="full">
					<Text fontSize="lg" fontWeight="bold">
						📈 Session Timeline
					</Text>
					<Text fontSize="sm" color="gray.500">
						Last {timelineData.length} sessions
					</Text>
				</HStack>

				<ResponsiveContainer width="100%" height={300}>
					<AreaChart data={timelineData}>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke={isDark ? "gray.600" : "gray.200"}
						/>
						<XAxis
							dataKey="session"
							tick={{ fill: isDark ? "white" : "black", fontSize: 12 }}
						/>
						<YAxis
							domain={[0, 100]}
							tick={{ fill: isDark ? "white" : "black" }}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: isDark ? "#2D3748" : "white",
								border: "1px solid gray",
							}}
							formatter={(value) => `${value}%`}
						/>
						<Legend />
						<Area
							type="monotone"
							dataKey="accuracy"
							fill="#48bb78"
							stroke="#38a169"
							name="Accuracy %"
						/>
						<Area
							type="monotone"
							dataKey="effectiveness"
							fill="#4299e1"
							stroke="#3182ce"
							name="Effectiveness %"
						/>
					</AreaChart>
				</ResponsiveContainer>

				{/* Summary stats */}
				<Box
					p={4}
					bg={isDark ? "gray.700" : "gray.50"}
					borderRadius="md"
					w="full"
					fontSize="sm"
				>
					<HStack spacing={6}>
						<VStack align="start" spacing={0}>
							<Text fontWeight="bold">Average Accuracy</Text>
							<Text fontSize="lg">
								{Math.round(
									timelineData.reduce((sum, s) => sum + s.accuracy, 0) /
										timelineData.length
								)}
								%
							</Text>
						</VStack>
						<VStack align="start" spacing={0}>
							<Text fontWeight="bold">Average Effectiveness</Text>
							<Text fontSize="lg">
								{Math.round(
									timelineData.reduce((sum, s) => sum + s.effectiveness, 0) /
										timelineData.length
								)}
								%
							</Text>
						</VStack>
						<VStack align="start" spacing={0}>
							<Text fontWeight="bold">Sessions</Text>
							<Text fontSize="lg">{timelineData.length}</Text>
						</VStack>
					</HStack>
				</Box>
			</VStack>
		</Box>
	);
};

export default SessionTimeline;
