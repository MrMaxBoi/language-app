import React, { useState } from 'react';
import { Button, HStack, Input, Text, VStack, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';

const SessionPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { sessionId, questions, currentIndex, getCurrentQuestion, startSession, submitAnswer, fetchCorrectAnswer, nextQuestion, completeSession } = useSessionStore();
  const [userAnswer, setUserAnswer] = useState('');
  const [isFillingAnswer, setIsFillingAnswer] = useState(false);

  const handleStart = async () => {
    setUserAnswer('');
    await startSession();
  };

  const handleSubmit = async () => {
    const question = getCurrentQuestion();
    if (!question) return;

    const result = await submitAnswer(question._id, userAnswer);
    setUserAnswer('');

    if (!result.success) {
      console.error('Failed to submit answer', result.message);
      return;
    }

    const isLastQuestion = currentIndex >= questions.length - 1;
    if (!isLastQuestion) {
      nextQuestion();
      return;
    }

    console.log('🧾 Final question submitted, completing session...');
    const completionResult = await completeSession();
    if (completionResult.success) {
      navigate('/report');
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

  if (!hasActiveQuestion) {
    return (
      <VStack spacing={4}>
        <Text>Ready to start your session?</Text>
        <Button onClick={handleStart}>Start Session</Button>
      </VStack>
    );
  }

  return (
    <VStack spacing={4}>
      <Text>{question.questionText}</Text>
      <Input
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        placeholder="Your answer"
      />
      <HStack>
        <Button onClick={handleFillCorrectAnswer} variant="outline" isLoading={isFillingAnswer}>
          Fill Correct Answer
        </Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </HStack>
    </VStack>
  );
};

export default SessionPage;
