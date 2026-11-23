import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Pitch } from '../components/Pitch';
import { Lineup, MAX_SCORE, Score, rankFor } from '../game/engine';
import { Strings, fill } from '../i18n';
import { C } from '../theme';

interface Props {
  t: Strings;
  title: string;
  lineup: Lineup;
  score: Score;
  isBest: boolean;
  practice: boolean;
  onHome: () => void;
  onAgain: () => void;
}

export function Result({ t, title, lineup, score, isBest, practice, onHome, onAgain }: Props) {
  const rank = t.ranks[rankFor(score.total)];

  async function share() {
    const message = fill(t.shareText, {
      tag: title, total: score.total, rank, talent: score.talent, chem: score.chem,
    });
    try {
      await Share.share({ message });
    } catch {
      // sharing unavailable or cancelled
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>{t.resultTitle} · {title}</Text>
      <View style={styles.hero}>
        <View>
          <Text style={styles.total}>
            {score.total}
            <Text style={styles.max}> / {MAX_SCORE}</Text>
          </Text>
          <Text style={styles.breakdown}>
            {t.talent} {score.talent} · {t.chem} {score.chem}
          </Text>
        </View>
        <View style={styles.rankBox}>
          <Text style={styles.rank}>{rank}</Text>
          {isBest && <Text style={styles.best}>{t.newBest}</Text>}
        </View>
      </View>

      <Pitch lineup={lineup} links={score.links} t={t} />

      <View style={styles.actions}>
        <Pressable onPress={share} accessibilityRole="button" style={[styles.btn, styles.primary]}>
          <Text style={[styles.btnText, { color: C.limeDark }]}>{t.share}</Text>
        </Pressable>
        <Pressable onPress={practice ? onAgain : onHome} accessibilityRole="button" style={styles.btn}>
          <Text style={styles.btnText}>{practice ? t.again : t.home}</Text>
        </Pressable>
        {practice && (
          <Pressable onPress={onHome} accessibilityRole="button" style={styles.btn}>
            <Text style={styles.btnText}>{t.home}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 12, gap: 10, maxWidth: 560, width: '100%', alignSelf: 'center' },
  kicker: { color: C.dim, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  hero: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: C.panel, borderRadius: 14, padding: 14,
  },
  total: { color: C.text, fontSize: 40, fontWeight: '900' },
  max: { color: C.dim, fontSize: 16, fontWeight: '700' },
  breakdown: { color: C.dim, fontSize: 13, fontWeight: '600' },
  rankBox: { alignItems: 'flex-end' },
  rank: { color: C.lime, fontSize: 22, fontWeight: '900' },
  best: { color: C.text, fontSize: 12, fontWeight: '800', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: {
    flex: 1, minHeight: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, paddingHorizontal: 8,
  },
  primary: { backgroundColor: C.lime, borderColor: C.lime },
  btnText: { color: C.text, fontWeight: '900', fontSize: 14, textAlign: 'center' },
});
