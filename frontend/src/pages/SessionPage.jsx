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

    await submitAnswer(question.id, userAnswer);
    setUserAnswer('');

    if (currentIndex < questions.length - 1) {
      nextQuestion();
    } else {
      const result = await completeSession();
      if (result.success) {
        navigate('/report');
      }
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
      <Text>{question.question}</Text>
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