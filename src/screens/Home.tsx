import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DAILY_DRAFTS, rankFor } from '../game/engine';
import { Lang, Strings } from '../i18n';
import { Save } from '../storage';
import { C } from '../theme';

interface Props {
  t: Strings;
  save: Save;
  day: string;
  onLang: (l: Lang) => void;
  onDaily: (draftNo: number) => void;
  onPractice: () => void;
  onXO: (vsBot: boolean) => void;
  onList: () => void;
  onTarget: () => void;
  onHL: () => void;
}

export function Home({ t, save, day, onLang, onDaily, onPractice, onXO, onList, onTarget, onHL }: Props) {
  const today = save.days[day] ?? {};
  const todayScores = Object.values(today);
  const todayBest = todayScores.length ? Math.max(...todayScores) : null;
  const streak = save.streak;

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.top}>
        <View>
          <Text style={styles.logo}>
            ESTAFET <Text style={{ color: C.lime }}>ARENA</Text>
          </Text>
          <Text style={styles.tagline}>{t.tagline}</Text>
        </View>
        <View style={styles.langRow}>
          {(['az', 'en'] as Lang[]).map((l) => (
            <Pressable
              key={l}
              onPress={() => onLang(l)}
              accessibilityRole="button"
              style={[styles.lang, save.lang === l && styles.langOn]}
            >
              <Text style={[styles.langText, save.lang === l && { color: C.limeDark }]}>{l.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.stats}>
        <Stat label={t.streak} value={`${streak}`} unit={t.days} />
        <Stat label={t.todayBest} value={todayBest === null ? '–' : `${todayBest}`} />
        <Stat label={t.best} value={save.best ? `${save.best}` : '–'} />
      </View>

      <Text style={styles.section}>{t.modes}</Text>
      <View style={styles.mode}>
        <Text style={styles.rowTitle}>{t.xoTitle}</Text>
        <Text style={styles.rowSub}>{t.xoSub}</Text>
        <View style={styles.modeBtns}>
          <Pressable onPress={() => onXO(true)} accessibilityRole="button" style={[styles.playBtn, styles.modeBtn]}>
            <Text style={styles.playText}>{t.vsBot}</Text>
          </Pressable>
          <Pressable onPress={() => onXO(false)} accessibilityRole="button" style={[styles.ghostBtn, styles.modeBtn]}>
            <Text style={styles.ghostText}>{t.twoPlayers}</Text>
          </Pressable>
        </View>
      </View>
      <Pressable onPress={onList} accessibilityRole="button" style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>{t.listTitle}</Text>
          <Text style={styles.rowSub}>{t.listSub}</Text>
        </View>
        <View style={styles.playBtn}>
          <Text style={styles.playText}>{t.play}</Text>
        </View>
      </Pressable>
      {[
        { title: t.targetTitle, sub: t.targetSub, go: onTarget },
        { title: t.hlTitle, sub: t.hlSub, go: onHL },
      ].map((m) => (
        <Pressable key={m.title} onPress={m.go} accessibilityRole="button" style={styles.row}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.rowTitle}>{m.title}</Text>
            <Text style={styles.rowSub}>{m.sub}</Text>
          </View>
          <View style={styles.playBtn}>
            <Text style={styles.playText}>{t.play}</Text>
          </View>
        </Pressable>
      ))}

      <Text style={styles.section}>{t.dailyTitle}</Text>
      {Array.from({ length: DAILY_DRAFTS }, (_, i) => i + 1).map((n) => {
        const score = today[n];
        const done = score !== undefined;
        return (
          <Pressable
            key={n}
            disabled={done}
            onPress={() => onDaily(n)}
            accessibilityRole="button"
            style={[styles.row, done && styles.rowDone]}
          >
            <View>
              <Text style={styles.rowTitle}>{t.draft} #{n}</Text>
              <Text style={styles.rowSub}>{done ? `${t.played} · ${t.ranks[rankFor(score)]}` : `11 × 3`}</Text>
            </View>
            {done ? (
              <Text style={styles.rowScore}>{score}</Text>
            ) : (
              <View style={styles.playBtn}>
                <Text style={styles.playText}>{t.play}</Text>
              </View>
            )}
          </Pressable>
        );
      })}

      <Pressable onPress={onPractice} accessibilityRole="button" style={[styles.row, styles.practice]}>
        <View>
          <Text style={styles.rowTitle}>{t.practice}</Text>
          <Text style={styles.rowSub}>{t.practiceSub}</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </Pressable>

      <Text style={styles.section}>{t.howTitle}</Text>
      <View style={styles.how}>
        {[t.how1, t.how2, t.how3, t.how4, t.how5].map((line, i) => (
          <Text key={i} style={styles.howLine}>{line}</Text>
        ))}
      </View>
    </ScrollView>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>
        {value}
        {unit ? <Text style={styles.statUnit}> {unit}</Text> : null}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 10, maxWidth: 560, width: '100%', alignSelf: 'center' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  logo: { color: C.text, fontSize: 26, fontWeight: '900', letterSpacing: 0.5 },
  tagline: { color: C.dim, fontSize: 13, marginTop: 2 },
  langRow: { flexDirection: 'row', backgroundColor: C.panel, borderRadius: 10, padding: 3 },
  lang: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  langOn: { backgroundColor: C.lime },
  langText: { color: C.dim, fontWeight: '800', fontSize: 13 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: C.panel, borderRadius: 12, padding: 12 },
  statValue: { color: C.text, fontSize: 22, fontWeight: '900' },
  statUnit: { color: C.dim, fontSize: 12, fontWeight: '600' },
  statLabel: { color: C.dim, fontSize: 12, marginTop: 2 },
  section: { color: C.dim, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginTop: 12 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: C.panel, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.line, minHeight: 68,
  },
  rowDone: { opacity: 0.75 },
  practice: { borderStyle: 'dashed' },
  rowTitle: { color: C.text, fontSize: 17, fontWeight: '800' },
  rowSub: { color: C.dim, fontSize: 12, marginTop: 2 },
  rowScore: { color: C.lime, fontSize: 24, fontWeight: '900' },
  playBtn: { backgroundColor: C.lime, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 },
  playText: { color: C.limeDark, fontWeight: '900', fontSize: 15 },
  mode: { backgroundColor: C.panel, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.line },
  modeBtns: { flexDirection: 'row', gap: 8, marginTop: 12 },
  modeBtn: { flex: 1, alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  ghostBtn: { borderRadius: 10, borderWidth: 1, borderColor: C.lime, paddingHorizontal: 18, paddingVertical: 10 },
  ghostText: { color: C.lime, fontWeight: '900', fontSize: 15 },
  arrow: { color: C.dim, fontSize: 28, fontWeight: '300' },
  how: { backgroundColor: C.panel, borderRadius: 14, padding: 14, gap: 8 },
  howLine: { color: C.text, fontSize: 14, lineHeight: 20 },
});
