import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { useSessionStore } from '../store/sessionStore';

const ReportPage = () => {
  const report = useSessionStore((state) => state.report);
  console.log("ReportPage report:", report);

  if (!report) {
    return (
      <Box p={8}>
        <VStack spacing={4} align="start">
          <Heading size="lg">Report</Heading>
          <Text>No report available</Text>
        </VStack>
      </Box>
    );
  }

  const score = report.score || {};
  const analysis = report.analysis || {};
  const weakestTopics = analysis.weakestTopics || [];
  const correct = score.correct ?? 0;
  const total = score.total ?? 0;
  const percentageValue = total > 0 ? Math.round((correct / total) * 100) : 0;
  const percentage = `${percentageValue}%`;

  return (
    <Box p={8}>
      <VStack spacing={8} align="start">
        <Heading size="lg">Report</Heading>

        <Box>
          <Heading size="2xl">{percentage}</Heading>
          <Text fontSize="md" color="gray.600">
            {correct} / {total} correct
          </Text>
        </Box>

        <Box>
          <Heading size="md" mb={3}>
            Weak Topics
          </Heading>
          <VStack spacing={3} align="stretch">
            {weakestTopics.length > 0 ? (
              weakestTopics.map((topic) => (
                <Box key={topic.name} p={4} borderWidth="1px" borderRadius="md">
                  <Text fontWeight="semibold">{topic.name}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {(topic.accuracy * 100).toFixed(1)}% accuracy
                  </Text>
                </Box>
              ))
            ) : (
              <Text>No weak topics identified.</Text>
            )}
          </VStack>
        </Box>

        <Box>
          <Heading size="md" mb={2}>
            Insight
          </Heading>
          <Text>Focus on improving your weakest topics</Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default ReportPage;
