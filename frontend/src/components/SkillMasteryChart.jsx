import React from "react";
import {
	Box,
	VStack,
	HStack,
	Text,
	Badge,
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
 * Skill Mastery Chart Component
 * Visualizes topic mastery levels with bar chart
 */
const SkillMasteryChart = ({ analytics, loading = false }) => {
	const { colorMode } = useColorMode();
	const isDark = colorMode === "dark";

	if (loading) {
		return (
			<Box p={6} bg={isDark ? "gray.800" : "white"} borderRadius="lg" boxShadow="md">
				<Spinner />
			</Box>
		);
	}

	if (!analytics || !analytics.recentSessions) {
		return (
			<Box p={6} bg={isDark ? "gray.800" : "white"} borderRadius="lg" boxShadow="md">
				<Text>No skill data available</Text>
			</Box>
		);
	}

	// Prefer canonical skill summaries; fall back to legacy topic summaries.
	const skillData = {};

	if (analytics.weakestSkills?.length || analytics.strongestSkills?.length) {
		for (const skill of analytics.weakestSkills || []) {
			const label = skill.skillName || skill.subtopic || skill.topic || "Unknown skill";
			skillData[label] = {
				mastery: Math.round((skill.mastery || 0) * 100),
				status: "weak",
			};
		}
		for (const skill of analytics.strongestSkills || []) {
			const label = skill.skillName || skill.subtopic || skill.topic || "Unknown skill";
			skillData[label] = {
				mastery: Math.round((skill.mastery || 0) * 100),
				status: "strong",
			};
		}
	}

	for (const session of analytics.recentSessions || []) {
		if (session.analytics?.weakTopics) {
			for (const topic of session.analytics.weakTopics) {
				if (skillData[topic]) continue;
				skillData[topic] = { mastery: 45, status: "weak" };
			}
		}
		if (session.analytics?.strongTopics) {
			for (const topic of session.analytics.strongTopics) {
				if (skillData[topic]) continue;
				skillData[topic] = { mastery: 85, status: "strong" };
			}
		}
	}

	const chartData = Object.entries(skillData).map(([skill, data]) => ({
		topic: skill.charAt(0).toUpperCase() + skill.slice(1),
		mastery: data.mastery,
		status: data.status,
	}));

	return (
		<Box p={6} bg={isDark ? "gray.800" : "white"} borderRadius="lg" boxShadow="md">
			<VStack align="start" spacing={4}>
				<HStack justify="space-between" w="full">
					<Text fontSize="lg" fontWeight="bold">
						📚 Skill Mastery
					</Text>
					<Badge colorScheme="blue">
						{chartData.length} Skills
					</Badge>
				</HStack>

				{chartData.length > 0 ? (
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={chartData}>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke={isDark ? "gray.600" : "gray.200"}
							/>
							<XAxis
								dataKey="topic"
								tick={{ fill: isDark ? "white" : "black" }}
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
							<Bar
								dataKey="mastery"
								fill="#4299e1"
								name="Mastery %"
							/>
						</BarChart>
					</ResponsiveContainer>
				) : (
					<Text py={8} textAlign="center" w="full" color="gray.500">
						No skill data yet. Complete sessions to track mastery.
					</Text>
				)}
			</VStack>
		</Box>
	);
};

export default SkillMasteryChart;
