import { Box, Heading, Text, VStack, Divider } from '@chakra-ui/react';
import { useSessionStore } from '../store/sessionStore';

const ReportPage = () => {
  const report = useSessionStore((state) => state.report);
  console.log("ReportPage report:", report);

  if (!report) {
    return (
      <Box p={8}>
        <VStack spacing={4} align="start">
          <Heading size="lg">Report</Heading>
          <Text color="gray.500">Loading report...</Text>
        </VStack>
      </Box>
    );
  }

  const score = report.score || {};
  const analysis = report.analysis || {};
  const aiFeedback = report.aiFeedback || null;
  const weakestTopics = analysis.weakestTopics || [];
  const correct = score.correct ?? 0;
  const total = score.total ?? 0;
  const percentageValue = total > 0 ? Math.round((correct / total) * 100) : 0;
  const percentage = `${percentageValue}%`;

  // Split AI feedback by line breaks for better readability
  const feedbackLines = aiFeedback
    ? aiFeedback
        .split('\n')
        .filter((line) => line.trim() !== '')
        .map((line) => line.trim())
    : [];

  return (
    <Box p={8} maxW="4xl" mx="auto">
      <VStack spacing={8} align="stretch">
        {/* Main Title */}
        <Heading size="xl" color="blue.600">
          Session Report
        </Heading>

        {/* Section 1: Score Summary */}
        <Box p={6} bg="blue.50" borderRadius="lg" borderLeft="4px solid" borderLeftColor="blue.500">
          <Heading size="md" mb={4}>
            Score Summary
          </Heading>
          <VStack align="start" spacing={3}>
            <Box>
              <Heading size="3xl" color="blue.600" mb={2}>
                {percentage}
              </Heading>
              <Text fontSize="md" color="gray.700">
                {correct} out of {total} questions answered correctly
              </Text>
            </Box>
          </VStack>
        </Box>

        <Divider />

        {/* Section 2: Weak Topics */}
        <Box>
          <Heading size="md" mb={4} color="orange.600">
            Weak Topics
          </Heading>
          <VStack spacing={3} align="stretch">
            {weakestTopics.length > 0 ? (
              weakestTopics.map((topic) => (
                <Box
                  key={topic.name}
                  p={4}
                  borderWidth="1px"
                  borderColor="orange.200"
                  borderRadius="md"
                  bg="orange.50"
                  _hover={{ bg: 'orange.100', transition: '0.2s' }}
                >
                  <Text fontWeight="semibold" color="orange.900">
                    {topic.name}
                  </Text>
                  <Text fontSize="sm" color="orange.700" mt={1}>
                    Accuracy: {(topic.accuracy * 100).toFixed(1)}%
                  </Text>
                </Box>
              ))
            ) : (
              <Box p={4} bg="green.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="green.500">
                <Text color="green.700" fontWeight="medium">
                  ✓ Great job! No weak topics identified.
                </Text>
              </Box>
            )}
          </VStack>
        </Box>

        <Divider />

        {/* Section 3: AI Feedback */}
        <Box>
          <Heading size="md" mb={4} color="purple.600">
            AI Feedback
          </Heading>
          {aiFeedback ? (
            <Box p={6} bg="purple.50" borderRadius="lg" borderLeft="4px solid" borderLeftColor="purple.500">
              <VStack align="start" spacing={3}>
                {feedbackLines.length > 0 ? (
                  feedbackLines.map((line, index) => (
                    <Text key={index} color="purple.900" fontSize="md" lineHeight="1.6">
                      {line}
                    </Text>
                  ))
                ) : (
                  <Text color="purple.700">No detailed feedback available.</Text>
                )}
              </VStack>
            </Box>
          ) : (
            <Box p={4} bg="gray.100" borderRadius="md">
              <Text color="gray.600" fontStyle="italic">
                No AI feedback available for this session.
              </Text>
            </Box>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default ReportPage;
