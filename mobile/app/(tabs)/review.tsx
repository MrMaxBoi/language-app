import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, type } from '@/constants/kokoro-theme';

export default function ReviewScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Ionicons name="refresh-circle-outline" size={42} color={palette.accent} />
        <Text style={styles.eyebrow}>REVIEW</Text>
        <Text style={styles.title}>Keep your Japanese fresh</Text>
        <Text style={styles.copy}>Your guided daily review and focused topic repair will live here next.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.canvas },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 28, maxWidth: 520, alignSelf: 'center' },
  eyebrow: { color: palette.accent, fontSize: 11, fontWeight: '900', marginTop: 18 },
  title: { color: palette.ink, fontFamily: type.display, fontSize: 30, lineHeight: 37, marginTop: 6 },
  copy: { color: palette.muted, fontSize: 16, lineHeight: 24, marginTop: 12 },
});
