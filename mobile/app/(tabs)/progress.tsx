import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, type } from '@/constants/kokoro-theme';

export default function ProgressScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Ionicons name="git-network-outline" size={42} color={palette.gold} />
        <Text style={styles.eyebrow}>LEARNING MAP</Text>
        <Text style={styles.title}>See how your knowledge connects</Text>
        <Text style={styles.copy}>The interactive skill constellation will turn Kokoro&apos;s mastery, memory, and prerequisite data into an understandable learner profile.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.canvas },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 28, maxWidth: 520, alignSelf: 'center' },
  eyebrow: { color: palette.gold, fontSize: 11, fontWeight: '900', marginTop: 18 },
  title: { color: palette.ink, fontFamily: type.display, fontSize: 30, lineHeight: 37, marginTop: 6 },
  copy: { color: palette.muted, fontSize: 16, lineHeight: 24, marginTop: 12 },
});
