import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, type } from '@/constants/kokoro-theme';
import { useSessionStore } from '@/store/session-store';

type Feedback = {
  isCorrect: boolean;
  correctAnswer: string;
};

const choiceTypes = new Set(['multiple_choice', 'meaning_match', 'translation_choice']);

export default function SessionScreen() {
  const router = useRouter();
  const { sessionId, questions, currentIndex, roadmap, submitAnswer, nextQuestion, completeSession } = useSessionStore();
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const question = questions[currentIndex];
  const options = useMemo(
    () => (question?.options || []).map((option) => typeof option === 'string' ? option : option.text).filter(Boolean),
    [question],
  );
  const isChoice = Boolean(question && choiceTypes.has(question.questionType) && options.length > 0);
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (!sessionId || !question) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.emptyState}>
          <Text style={styles.title}>No lesson is open</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.replace('/')}>
            <Text style={styles.primaryButtonText}>Return to map</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const checkAnswer = async () => {
    if (!answer.trim()) return;
    try {
      setSubmitting(true);
      const result = await submitAnswer(question._id || question.questionId, answer.trim());
      setFeedback({ isCorrect: result.isCorrect, correctAnswer: result.correctAnswer });
    } catch (error) {
      Alert.alert('Answer could not be checked', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const continueSession = async () => {
    if (currentIndex < questions.length - 1) {
      nextQuestion();
      setAnswer('');
      setFeedback(null);
      return;
    }

    setSubmitting(true);
    const completed = await completeSession();
    setSubmitting(false);
    if (completed) router.replace('/result');
    else Alert.alert('Session could not finish', 'Your answers are saved. Please try again.');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Leave session" onPress={() => router.replace('/')} hitSlop={10}>
          <Ionicons name="close" size={26} color={palette.muted} />
        </Pressable>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.counter}>{currentIndex + 1}/{questions.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>
          {roadmap?.mode === 'daily_review' ? 'REVIEW OF THE DAY' : roadmap?.lessonTitle?.toUpperCase() || 'PRACTICE'}
        </Text>
        <Text style={styles.prompt}>{question.questionText}</Text>
        <Text style={styles.instruction}>{isChoice ? 'Choose the best answer' : 'Type your answer'}</Text>

        {isChoice ? (
          <View style={styles.options}>
            {options.map((option) => {
              const selected = answer === option;
              return (
                <Pressable
                  key={option}
                  disabled={Boolean(feedback)}
                  onPress={() => setAnswer(option)}
                  style={[styles.option, selected && styles.selectedOption]}>
                  <Text style={[styles.optionText, selected && styles.selectedOptionText]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            editable={!feedback}
            onChangeText={setAnswer}
            placeholder="Your answer"
            placeholderTextColor="#A49D93"
            style={styles.input}
            value={answer}
          />
        )}

        {feedback ? (
          <View style={[styles.feedback, feedback.isCorrect ? styles.correctFeedback : styles.incorrectFeedback]}>
            <Ionicons
              name={feedback.isCorrect ? 'checkmark-circle' : 'information-circle'}
              size={25}
              color={feedback.isCorrect ? palette.success : palette.accent}
            />
            <View style={styles.feedbackCopy}>
              <Text style={styles.feedbackTitle}>{feedback.isCorrect ? 'That is correct' : 'Keep this one close'}</Text>
              {!feedback.isCorrect ? <Text style={styles.feedbackText}>Correct answer: {feedback.correctAnswer}</Text> : null}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.actionBar}>
        <Pressable
          disabled={submitting || (!feedback && !answer.trim())}
          onPress={feedback ? continueSession : checkAnswer}
          style={[styles.primaryButton, (submitting || (!feedback && !answer.trim())) && styles.disabledButton]}>
          {submitting ? <ActivityIndicator color={palette.white} /> : (
            <Text style={styles.primaryButtonText}>
              {feedback ? currentIndex === questions.length - 1 ? 'See your result' : 'Continue' : 'Check answer'}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.canvas },
  topBar: { minHeight: 64, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 13 },
  progressTrack: { flex: 1, height: 7, borderRadius: 4, backgroundColor: '#E0D9CF', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: palette.accent },
  counter: { color: palette.muted, fontSize: 12, fontWeight: '800' },
  content: { flexGrow: 1, width: '100%', maxWidth: 620, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 38, paddingBottom: 26 },
  eyebrow: { color: palette.accent, fontSize: 11, fontWeight: '900' },
  prompt: { color: palette.ink, fontFamily: type.display, fontSize: 29, lineHeight: 38, marginTop: 13 },
  instruction: { color: palette.muted, fontSize: 14, marginTop: 14, marginBottom: 22 },
  options: { gap: 12 },
  option: { minHeight: 56, borderRadius: 8, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, justifyContent: 'center', paddingHorizontal: 18 },
  selectedOption: { borderColor: palette.accent, backgroundColor: palette.accentSoft },
  optionText: { color: palette.ink, fontSize: 16, fontWeight: '700' },
  selectedOptionText: { color: palette.accent },
  input: { minHeight: 58, borderRadius: 8, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, color: palette.ink, fontSize: 17, paddingHorizontal: 17 },
  feedback: { marginTop: 24, borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  correctFeedback: { backgroundColor: palette.successSoft },
  incorrectFeedback: { backgroundColor: palette.accentSoft },
  feedbackCopy: { flex: 1 },
  feedbackTitle: { color: palette.ink, fontSize: 15, fontWeight: '800' },
  feedbackText: { color: palette.muted, fontSize: 14, marginTop: 4 },
  actionBar: { paddingHorizontal: 20, paddingVertical: 14, backgroundColor: palette.surface, borderTopWidth: 1, borderTopColor: palette.line },
  primaryButton: { minHeight: 54, borderRadius: 8, backgroundColor: palette.accent, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: palette.white, fontSize: 16, fontWeight: '800' },
  disabledButton: { opacity: 0.45 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  title: { color: palette.ink, fontFamily: type.display, fontSize: 25, marginBottom: 20 },
});
