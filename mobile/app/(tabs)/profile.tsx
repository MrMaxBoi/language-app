import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, type } from '@/constants/kokoro-theme';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Ionicons name="person-circle-outline" size={44} color={palette.muted} />
        <Text style={styles.eyebrow}>PROFILE</Text>
        <Text style={styles.title}>Your Kokoro profile</Text>
        <Text style={styles.copy}>Accounts, settings, learning goals, and streaks will be added after the core learner experience is validated.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.canvas },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 28, maxWidth: 520, alignSelf: 'center' },
  eyebrow: { color: palette.muted, fontSize: 11, fontWeight: '900', marginTop: 18 },
  title: { color: palette.ink, fontFamily: type.display, fontSize: 30, lineHeight: 37, marginTop: 6 },
  copy: { color: palette.muted, fontSize: 16, lineHeight: 24, marginTop: 12 },
});
