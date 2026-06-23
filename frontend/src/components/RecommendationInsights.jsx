import React from "react";
import {
	Box,
	VStack,
	HStack,
	Text,
	Badge,
	Spinner,
	useColorMode,
	Progress,
	Divider,
} from "@chakra-ui/react";

/**
 * Recommendation Insights Component
 * Explains why questions are recommended
 */
const RecommendationInsights = ({ recommendations, loading = false }) => {
	const { colorMode } = useColorMode();
	const isDark = colorMode === "dark";

	if (loading) {
		return (
			<Box p={6} bg={isDark ? "gray.800" : "white"} borderRadius="lg" boxShadow="md">
				<Spinner />
			</Box>
		);
	}

	if (!recommendations || !recommendations.recommendations || recommendations.recommendations.length === 0) {
		return (
			<Box p={6} bg={isDark ? "gray.800" : "white"} borderRadius="lg" boxShadow="md">
				<Text>No recommendation data available</Text>
			</Box>
		);
	}

	const getReasonLabel = (reason) => {
		const labels = {
			overdue_memory: { label: "Overdue Review", color: "red" },
			weak_memory: { label: "Weak Memory", color: "orange" },
			weak_skill: { label: "Weak Skill", color: "yellow" },
			medium_skill: { label: "Medium Skill", color: "blue" },
			difficulty_balancing: { label: "Balanced Challenge", color: "green" },
			memory_decay_risk: { label: "Decay Risk", color: "purple" },
			challenge_progression: { label: "Progress Challenge", color: "cyan" },
		};
		return labels[reason] || { label: reason, color: "gray" };
	};

	const getRecommendationLabel = (recommendation) =>
		recommendation.skillName ||
		recommendation.subtopic ||
		recommendation.topic ||
		"Recommended skill";

	return (
		<Box p={6} bg={isDark ? "gray.800" : "white"} borderRadius="lg" boxShadow="md">
			<VStack align="start" spacing={4}>
				<HStack justify="space-between" w="full">
					<Text fontSize="lg" fontWeight="bold">
						🤖 Recommendation Transparency
					</Text>
					<Badge colorScheme="blue">
						{recommendations.recommendations?.length || 0} Questions
					</Badge>
				</HStack>

				{/* Learner context */}
				<Box
					p={4}
					bg={isDark ? "gray.700" : "gray.50"}
					borderRadius="md"
					w="full"
				>
					<Text fontSize="sm" fontWeight="bold" mb={3}>
						📍 Your Learning Context
					</Text>
					<HStack spacing={6} fontSize="sm">
						<VStack align="start" spacing={1}>
							<Text color="gray.500">Recent Accuracy</Text>
							<Text fontSize="md" fontWeight="bold">
								{recommendations.learnerContext?.recentAccuracy || 0}%
							</Text>
						</VStack>
						<VStack align="start" spacing={1}>
							<Text color="gray.500">Target Difficulty</Text>
							<Text fontSize="md" fontWeight="bold">
								{recommendations.learnerContext?.targetDifficulty || "Medium"}
							</Text>
						</VStack>
						<VStack align="start" spacing={1}>
							<Text color="gray.500">Weak Skills</Text>
							<Text fontSize="md" fontWeight="bold">
								{recommendations.learnerContext?.weakSkillsCount || 0}
							</Text>
						</VStack>
						<VStack align="start" spacing={1}>
							<Text color="gray.500">Overdue Reviews</Text>
							<Text fontSize="md" fontWeight="bold">
								{recommendations.learnerContext?.overdueMemoriesCount || 0}
							</Text>
						</VStack>
					</HStack>
				</Box>

				{/* Recommended questions */}
				<VStack w="full" spacing={3}>
					<Text fontSize="sm" fontWeight="bold">
						Why These Questions?
					</Text>

					{recommendations.recommendations?.slice(0, 5).map((rec, index) => (
						<Box
							key={rec.questionId || index}
							p={4}
							bg={isDark ? "gray.700" : "gray.50"}
							borderRadius="md"
							w="full"
							borderLeft="4px"
							borderLeftColor="blue.400"
						>
							<HStack justify="space-between" mb={3}>
								<VStack align="start" spacing={0}>
									<Text fontSize="sm" fontWeight="bold">
										{getRecommendationLabel(rec)}
									</Text>
									<Text fontSize="xs" color="gray.500">
										{rec.topic} / {rec.subtopic} • Difficulty: {rec.difficulty.toUpperCase()}
									</Text>
								</VStack>
								<Badge colorScheme="green" fontSize="lg" p={2}>
									Score: {rec.recommendationScore}
								</Badge>
							</HStack>

							<Divider my={2} />

							{/* Reasons */}
							<VStack align="start" spacing={2} mb={3}>
								<Text fontSize="xs" fontWeight="bold" color="gray.500">
									Why recommended:
								</Text>
								<HStack spacing={2} flexWrap="wrap">
									{rec.reasons?.map((reason) => {
										const { label, color } = getReasonLabel(reason);
										return (
											<Badge
												key={reason}
												colorScheme={color}
												variant="subtle"
												fontSize="xs"
											>
												{label}
											</Badge>
										);
									})}
								</HStack>
							</VStack>

							{/* Contributing factors */}
							<VStack align="start" spacing={2} fontSize="xs">
								<Text fontWeight="bold" color="gray.500">
									Contributing Factors:
								</Text>
								{rec.contributingFactors?.memoryStrength !== null && (
									<Box w="full">
										<HStack justify="space-between" mb={1}>
											<Text>Memory Strength</Text>
											<Text fontWeight="bold">
												{rec.contributingFactors?.memoryStrength}%
											</Text>
										</HStack>
										<Progress
											value={
												rec.contributingFactors?.memoryStrength || 0
											}
											colorScheme="blue"
											height="6px"
											borderRadius="full"
										/>
									</Box>
								)}
								{rec.contributingFactors?.skillMastery !== null && (
									<Box w="full">
										<HStack justify="space-between" mb={1}>
											<Text>Skill Mastery</Text>
											<Text fontWeight="bold">
												{rec.contributingFactors?.skillMastery}%
											</Text>
										</HStack>
										<Progress
											value={
												rec.contributingFactors?.skillMastery || 0
											}
											colorScheme="green"
											height="6px"
											borderRadius="full"
										/>
									</Box>
								)}
								<HStack spacing={4}>
									<Text>
										Urgency:{" "}
										<strong>
											{rec.contributingFactors?.urgencyScore}
										</strong>
									</Text>
									<Text>
										Difficulty Match:{" "}
										<strong>
											{rec.contributingFactors?.difficultyMatch}
										</strong>
									</Text>
								</HStack>
							</VStack>
						</Box>
					))}
				</VStack>

				{/* Info box */}
				<Box
					p={4}
					bg={isDark ? "gray.700" : "gray.50"}
					borderRadius="md"
					w="full"
					fontSize="xs"
				>
					<Text fontWeight="bold" mb={2}>
						🔍 How Recommendations Work
					</Text>
					<VStack align="start" spacing={1}>
						<Text>
							1. <strong>Detect weaknesses</strong>: System identifies weak
							skills and overdue memories
						</Text>
						<Text>
							2. <strong>Match difficulty</strong>: Ensures questions match
							your current learning level
						</Text>
						<Text>
							3. <strong>Prevent repetition</strong>: Avoids questions
							you've recently attempted
						</Text>
						<Text>
							4. <strong>Score candidates</strong>: Rates all questions
							based on impact
						</Text>
						<Text>
							5. <strong>Select best</strong>: Picks top recommendations
							for maximum learning gain
						</Text>
					</VStack>
				</Box>
			</VStack>
		</Box>
	);
};

export default RecommendationInsights;
