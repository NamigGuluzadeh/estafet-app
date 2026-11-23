import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DbPlayer, NATIONS } from '../data/db';
import { Duel, StatKey, newDuel, statValue, statsOf } from '../game/stats';
import { Strings, fill } from '../i18n';
import { C } from '../theme';

interface Props {
  t: Strings;
  onQuit: () => void;
}

const BEST_KEY = 'estafet-arena:hl-best';

export function HigherLower({ t, onQuit }: Props) {
  const [duel, setDuel] = useState<Duel>(() => newDuel());
  const [chosen, setChosen] = useState<DbPlayer | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(BEST_KEY)
      .then((v) => v && setBest(Number(v) || 0))
      .catch(() => {});
  }, []);

  const va = statValue(duel.a, duel.key)!;
  const vb = statValue(duel.b, duel.key)!;
  const winner = va > vb ? duel.a : duel.b;
  const answered = chosen !== null;
  const right = answered && chosen.id === winner.id;

  const question = { goals: t.qGoals, apps: t.qApps, caps: t.qCaps, age: t.qAge }[duel.key];

  function choose(p: DbPlayer) {
    if (answered) return;
    setChosen(p);
    if (p.id === winner.id) {
      const next = streak + 1;
      setStreak(next);
      if (next > best) {
        setBest(next);
        AsyncStorage.setItem(BEST_KEY, String(next)).catch(() => {});
      }
    }
  }

  function next() {
    if (!right) setStreak(0);
    setChosen(null);
    setDuel(newDuel(new Set([duel.a.id, duel.b.id])));
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable onPress={onQuit} accessibilityRole="button" hitSlop={10} style={styles.side}>
          <Text style={styles.quit}>‹ {t.quit}</Text>
        </Pressable>
        <Text style={styles.title}>{t.hlTitle}</Text>
        <View style={styles.side} />
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreValue}>{streak}</Text>
          <Text style={styles.scoreLabel}>{t.streakNow}</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreValue}>{best}</Text>
          <Text style={styles.scoreLabel}>{t.bestStreak}</Text>
        </View>
      </View>

      <Text style={styles.question}>{question}</Text>

      <View style={styles.cards}>
        {[duel.a, duel.b].map((p) => {
          const isWinner = p.id === winner.id;
          const picked = chosen?.id === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => choose(p)}
              disabled={answered}
              accessibilityRole="button"
              accessibilityLabel={p.name}
              style={[
                styles.card,
                answered && isWinner && styles.cardRight,
                answered && picked && !isWinner && styles.cardWrong,
              ]}
            >
              <Text style={styles.flag}>{NATIONS[p.nat]?.flag ?? ''}</Text>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.meta}>
                {p.nat}
                {p.pos ? ` · ${t.pos[p.pos]}` : ''}
              </Text>
              <Text style={[styles.value, answered && isWinner && { color: C.lime }]}>
                {answered ? valueText(p, duel.key, t) : '?'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.verdict, answered && !right && { color: C.mid }]}>
        {answered ? (right ? t.correct : t.gameOver) : ' '}
      </Text>

      {answered && (
        <Pressable onPress={next} accessibilityRole="button" style={styles.primary}>
          <Text style={styles.primaryText}>{right ? t.nextQ : t.newGame}</Text>
        </Pressable>
      )}
    </View>
  );
}

function valueText(p: DbPlayer, key: StatKey, t: Strings): string {
  if (key === 'age') return fill(t.born, { n: statsOf(p).born ?? '' });
  return String(statValue(p, key));
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 12, gap: 12, maxWidth: 560, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  side: { minWidth: 70, paddingVertical: 6 },
  quit: { color: C.dim, fontSize: 15, fontWeight: '700' },
  title: { color: C.text, fontSize: 16, fontWeight: '900' },
  scoreRow: { flexDirection: 'row', gap: 8 },
  scoreBox: { flex: 1, backgroundColor: C.panel, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  scoreValue: { color: C.text, fontSize: 22, fontWeight: '900' },
  scoreLabel: { color: C.dim, fontSize: 11, fontWeight: '700' },
  question: { color: C.text, fontSize: 19, fontWeight: '900', textAlign: 'center', paddingHorizontal: 8 },
  cards: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1, backgroundColor: C.panel, borderRadius: 14, borderWidth: 2, borderColor: C.line,
    alignItems: 'center', paddingVertical: 18, paddingHorizontal: 8, gap: 4, minHeight: 190,
  },
  cardRight: { borderColor: C.lime, backgroundColor: C.panelHi },
  cardWrong: { borderColor: C.mid },
  flag: { fontSize: 34 },
  name: { color: C.text, fontSize: 17, fontWeight: '900', textAlign: 'center' },
  meta: { color: C.dim, fontSize: 12, fontWeight: '700' },
  value: { color: C.text, fontSize: 26, fontWeight: '900', marginTop: 8, textAlign: 'center' },
  verdict: { color: C.lime, fontSize: 20, fontWeight: '900', textAlign: 'center', minHeight: 28 },
  primary: { minHeight: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: C.lime },
  primaryText: { color: C.limeDark, fontWeight: '900', fontSize: 16 },
});
