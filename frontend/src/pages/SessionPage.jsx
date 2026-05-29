import React, { useState } from 'react';
import { Box, Button, Input, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';

const SessionPage = () => {
  const navigate = useNavigate();
  const { sessionId, questions, currentIndex, getCurrentQuestion, startSession, submitAnswer, nextQuestion, completeSession } = useSessionStore();
  const [userAnswer, setUserAnswer] = useState('');

  const handleStart = async () => {
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

  if (!sessionId) {
    return (
      <VStack spacing={4}>
        <Text>Ready to start your session?</Text>
        <Button onClick={handleStart}>Start Session</Button>
      </VStack>
    );
  }

  const question = getCurrentQuestion();
  if (!question) {
    return <Text>Loading...</Text>;
  }

  return (
    <VStack spacing={4}>
      <Text>{question.questionText}</Text>
      <Input
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        placeholder="Your answer"
      />
      <Button onClick={handleSubmit}>Submit</Button>
    </VStack>
  );
};

export default SessionPage;