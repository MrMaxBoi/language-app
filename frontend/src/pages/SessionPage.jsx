import React, { useState } from 'react';
import { Badge, Box, Button, Container, Heading, HStack, Input, Progress, SimpleGrid, Text, VStack, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';

const SessionPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { sessionId, questions, currentIndex, activeRoadmap, getCurrentQuestion, startSession, submitAnswer, fetchCorrectAnswer, nextQuestion, completeSession } = useSessionStore();
  const [userAnswer, setUserAnswer] = useState('');
  const [isFillingAnswer, setIsFillingAnswer] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getQuestionOptions = (question) =>
    (question?.options || [])
      .map((option) => (typeof option === "string" ? option : option?.text))
      .filter(Boolean);

  const isChoiceQuestion = (question) =>
    ["multiple_choice", "meaning_match", "translation_choice"].includes(question?.questionType) &&
    getQuestionOptions(question).length > 0;

  const handleStart = async () => {
    setUserAnswer('');
    setFeedback(null);
    await startSession();
  };

  const handleSubmit = async () => {
    const question = getCurrentQuestion();
    if (!question) return;

    setIsSubmitting(true);
    const result = await submitAnswer(question._id, userAnswer);
    setIsSubmitting(false);

    if (!result.success) {
      console.error('Failed to submit answer', result.message);
      return;
    }

    setFeedback({
      isCorrect: result.isCorrect,
      correctAnswer: result.correctAnswer,
      userAnswer,
    });
  };

  const handleNext = async () => {
    const isLastQuestion = currentIndex >= questions.length - 1;
    if (!isLastQuestion) {
      setUserAnswer('');
      setFeedback(null);
      nextQuestion();
      return;
    }

    console.log('🧾 Final question submitted, completing session...');
    const completionResult = await completeSession();
    if (completionResult.success) {
      navigate('/result');
    } else {
      console.error('Session completion failed', completionResult.message);
    }
  };

  const handleFillCorrectAnswer = async () => {
    const question = getCurrentQuestion();
    if (!question) return;

    try {
      setIsFillingAnswer(true);
      const result = await fetchCorrectAnswer(question._id);
      if (!result.success) {
        toast({
          title: "Could not fetch answer",
          description: result.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      setUserAnswer(result.correctAnswer);
    } finally {
      setIsFillingAnswer(false);
    }
  };

  const question = getCurrentQuestion();
  const hasActiveQuestion = Boolean(sessionId && questions.length > 0 && question);
  const questionOptions = getQuestionOptions(question);
  const shouldRenderChoices = isChoiceQuestion(question);
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (!hasActiveQuestion) {
    return (
      <Container maxW="md" py={{ base: 6, md: 10 }}>
        <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="xl" p={6}>
          <VStack align="stretch" spacing={5}>
            <Badge colorScheme="blue" alignSelf="start" borderRadius="full" px={3} py={1}>
              Practice
            </Badge>
            <Box>
              <Heading size="lg">Ready for a short lesson?</Heading>
              <Text color="gray.600" mt={3}>
                Kokoro will choose a focused set of questions from your current path and review needs.
              </Text>
            </Box>
            <Button colorScheme="blue" size="lg" borderRadius="full" onClick={handleStart}>
              Start lesson
            </Button>
          </VStack>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="2xl" py={{ base: 4, md: 8 }} pb={24}>
      <VStack spacing={5} align="stretch">
        <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="xl" p={5}>
          <HStack justify="space-between" align="start" mb={4}>
            <Box>
              <Badge colorScheme={activeRoadmap?.mode === "roadmap_lesson" ? "purple" : activeRoadmap?.mode === "daily_review" ? "orange" : "blue"} mb={2}>
				{activeRoadmap?.mode === "roadmap_lesson"
				  ? "Roadmap lesson"
				  : activeRoadmap?.mode === "daily_review"
				    ? "Today's review"
				    : "Practice lesson"}
              </Badge>
              <Heading size="md">{activeRoadmap?.lessonTitle || "Adaptive practice"}</Heading>
              <Text color="gray.600" fontSize="sm" mt={1}>
                {activeRoadmap?.unitTitle || "Kokoro is choosing a focused practice mix for you."}
              </Text>
            </Box>
            <Badge colorScheme="blue">
              {currentIndex + 1} / {questions.length}
            </Badge>
          </HStack>
          <Progress value={progress} colorScheme="blue" borderRadius="full" />
        </Box>

        <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="xl" p={6}>
          <Badge colorScheme={shouldRenderChoices ? "green" : "blue"} mb={4}>
            {shouldRenderChoices ? "Choose the best answer" : "Type your answer"}
          </Badge>
          <Heading size="md" mb={5}>
            {question.questionText}
          </Heading>

          {shouldRenderChoices ? (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              {questionOptions.map((option) => {
                const isSelected = userAnswer === option;
                return (
                  <Button
                    key={option}
                    justifyContent="start"
                    whiteSpace="normal"
                    h="auto"
                    minH="54px"
                    py={3}
                    borderRadius="xl"
                    colorScheme={isSelected ? "blue" : "gray"}
                    variant={isSelected ? "solid" : "outline"}
                    isDisabled={Boolean(feedback)}
                    onClick={() => setUserAnswer(option)}
                  >
                    {option}
                  </Button>
                );
              })}
            </SimpleGrid>
          ) : (
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Your answer"
              isDisabled={Boolean(feedback)}
              borderRadius="xl"
            />
          )}
        </Box>

        {feedback ? (
          <Box
            bg={feedback.isCorrect ? "green.50" : "orange.50"}
            borderWidth="1px"
            borderColor={feedback.isCorrect ? "green.200" : "orange.200"}
            borderRadius="xl"
            p={5}
          >
            <Heading size="sm">{feedback.isCorrect ? "Nice, that is correct." : "Good try. Review this one."}</Heading>
            {!feedback.isCorrect ? (
              <Text color="gray.700" mt={2}>
                Correct answer: <Text as="span" fontWeight="bold">{feedback.correctAnswer}</Text>
              </Text>
            ) : null}
          </Box>
        ) : null}

        <HStack justify="space-between">
          <Button onClick={handleFillCorrectAnswer} variant="ghost" isLoading={isFillingAnswer} size="sm">
            Fill Correct Answer
          </Button>
          {feedback ? (
            <Button colorScheme="blue" borderRadius="full" onClick={handleNext}>
              {currentIndex >= questions.length - 1 ? "See result" : "Next"}
            </Button>
          ) : (
            <Button colorScheme="blue" borderRadius="full" onClick={handleSubmit} isDisabled={!userAnswer.trim()} isLoading={isSubmitting}>
              Check answer
            </Button>
          )}
        </HStack>
      </VStack>
    </Container>
  );
};

export default SessionPage;
