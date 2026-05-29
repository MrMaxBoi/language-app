import React from "react";
import {
	Box,
	VStack,
	HStack,
	Text,
	Badge,
	Progress,
	Spinner,
	useColorMode,
	SimpleGrid,
} from "@chakra-ui/react";

/**
 * Memory Health Panel Component
 * Visualizes spaced repetition memory metrics
 */
const MemoryHealthPanel = ({ memoryHealth, loading = false }) => {
	const { colorMode } = useColorMode();
	const isDark = colorMode === "dark";

	if (loading) {
		return (
			<Box p={6} bg={isDark ? "gray.800" : "white"} borderRadius="lg" boxShadow="md">
				<Spinner />
			</Box>
		);
	}

	if (!memoryHealth || memoryHealth.totalMemories === 0) {
		return (
			<Box p={6} bg={isDark ? "gray.800" : "white"} borderRadius="lg" boxShadow="md">
				<Text>No memory data available yet</Text>
			</Box>
		);
	}

	const {
		healthScore,
		healthMetrics,
		percentages,
		totalMemories,
	} = memoryHealth;

	const metrics = [
		{
			label: "Average Strength",
			value: Math.round(healthMetrics.averageStrength * 100),
			color: "green",
		},
		{
			label: "Overdue",
			value: percentages.overdue,
			color: "red",
		},
		{
			label: "Weak",
			value: percentages.weak,
			color: "orange",
		},
		{
			label: "Decay Risk",
			value: percentages.decayRisk,
			color: "yellow",
		},
	];

	return (
		<Box p={6} bg={isDark ? "gray.800" : "white"} borderRadius="lg" boxShadow="md">
			<VStack align="start" spacing={6}>
				<HStack justify="space-between" w="full">
					<Text fontSize="lg" fontWeight="bold">
						🧠 Memory Health
					</Text>
					<Badge colorScheme="blue" fontSize="md" p={2}>
						Health Score: {Math.round(healthScore)}
					</Badge>
				</HStack>

				{/* Overall stats */}
				<SimpleGrid columns={{ base: 2, md: 4 }} gap={4} w="full">
					{metrics.map((metric) => (
						<Box key={metric.label}>
							<Text fontSize="sm" fontWeight="bold" mb={2}>
								{metric.label}
							</Text>
							<Progress
								value={metric.value}
								colorScheme={metric.color}
								borderRadius="full"
								mb={1}
							/>
							<Text fontSize="xs" color="gray.500">
								{metric.value}%
							</Text>
						</Box>
					))}
				</SimpleGrid>

				{/* Memory counts */}
				<SimpleGrid columns={{ base: 2, md: 4 }} gap={4} w="full">
					<Box p={3} bg={isDark ? "gray.700" : "gray.50"} borderRadius="md">
						<Text fontSize="xs" color="gray.500">Total Memories</Text>
						<Text fontSize="xl" fontWeight="bold">
							{totalMemories}
						</Text>
					</Box>
					<Box p={3} bg={isDark ? "gray.700" : "gray.50"} borderRadius="md">
						<Text fontSize="xs" color="red.500">Overdue</Text>
						<Text fontSize="xl" fontWeight="bold">
							{healthMetrics.overdueCount}
						</Text>
					</Box>
					<Box p={3} bg={isDark ? "gray.700" : "gray.50"} borderRadius="md">
						<Text fontSize="xs" color="orange.500">Weak</Text>
						<Text fontSize="xl" fontWeight="bold">
							{healthMetrics.weakMemoriesCount}
						</Text>
					</Box>
					<Box p={3} bg={isDark ? "gray.700" : "gray.50"} borderRadius="md">
						<Text fontSize="xs" color="yellow.500">Decay Risk</Text>
						<Text fontSize="xl" fontWeight="bold">
							{healthMetrics.decayRiskCount}
						</Text>
					</Box>
				</SimpleGrid>

				{/* Memory insights */}
				<Box p={4} bg={isDark ? "gray.700" : "gray.50"} borderRadius="md" w="full">
					<Text fontSize="sm" fontWeight="bold" mb={2}>
						📊 Memory Insights
					</Text>
					<VStack align="start" spacing={1} fontSize="xs">
						<Text>
							• Average strength: {(healthMetrics.averageStrength * 100).toFixed(0)}%
						</Text>
						<Text>
							• Review interval: {healthMetrics.averageReviewInterval.toFixed(1)} days
						</Text>
						<Text>
							• Stable memories: {healthMetrics.stableMemoriesCount} ({Math.round((healthMetrics.stableMemoriesCount / totalMemories) * 100)}%)
						</Text>
						<Text>
							Overall health:{" "}
							<strong>
								{Math.round(healthScore) > 70
									? "Excellent 🎯"
									: Math.round(healthScore) > 50
									? "Good ⚡"
									: "Needs attention ⚠️"}
							</strong>
						</Text>
					</VStack>
				</Box>
			</VStack>
		</Box>
	);
};

export default MemoryHealthPanel;
