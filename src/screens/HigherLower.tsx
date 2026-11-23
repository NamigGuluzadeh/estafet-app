import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Btn, Confetti, FlipIn, ModeHeader, NATIVE_DRIVER, Stamp, TopBar } from '../components/ui';
import { DbPlayer } from '../data/db';
import { Duel, StatKey, newDuel, statValue, statsOf } from '../game/stats';
import { Strings, fill } from '../i18n';
import { C, F } from '../theme';

interface Props {
  t: Strings;
  onQuit: () => void;
}

const BEST_KEY = 'estafet-arena:hl-best';

export function HigherLower({ t, onQuit }: Props) {
  const [duel, setDuel] = useState<Duel>(() => newDuel());
  const [round, setRound] = useState(0);
  const [chosen, setChosen] = useState<DbPlayer | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const bump = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    AsyncStorage.getItem(BEST_KEY)
      .then((v) => v && setBest(Number(v) || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (streak === 0) return;
    bump.setValue(0);
    Animated.timing(bump, { toValue: 1, duration: 450, useNativeDriver: NATIVE_DRIVER }).start();
  }, [streak]);

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
    setRound(round + 1);
    setDuel(newDuel(new Set([duel.a.id, duel.b.id])));
  }

  return (
    <View style={{ flex: 1 }}>
      <TopBar backLabel={t.quit} onBack={onQuit} right={<Text style={styles.best}>{t.bestStreak} {best}</Text>} />
      <ModeHeader icon="updown" title={t.hlTitle} n="04" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.streakRow}>
          <Animated.Text
            style={[
              styles.streak,
              {
                transformOrigin: 'left bottom',
                transform: [
                  { translateY: bump.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, -10, 0] }) },
                  { scale: bump.interpolate({ inputRange: [0, 0.35, 1], outputRange: [1, 1.2, 1] }) },
                ],
              },
            ]}
          >
            {streak}
          </Animated.Text>
          <Text style={styles.streakLabel}>{t.streakNow}</Text>
        </View>

        <Text style={styles.question}>{question}</Text>

        <View style={{ gap: 8 }}>
          {[duel.a, duel.b].map((p, i) => {
            const isWinner = p.id === winner.id;
            const picked = chosen?.id === p.id;
            const bg = answered && isWinner ? C.accent : answered && picked ? C.text : C.surface;
            const fg = answered && (isWinner || picked) ? C.bg : C.text;
            const born = statsOf(p).born;
            return (
              <FlipIn key={`${round}-${p.id}`} trigger={round} delay={i * 80}>
                <Pressable
                  onPress={() => choose(p)}
                  disabled={answered}
                  accessibilityRole="button"
                  accessibilityLabel={p.name}
                  style={({ pressed }) => [styles.card, { backgroundColor: bg, borderColor: pressed ? C.accent : answered && (isWinner || picked) ? bg : 'transparent' }]}
                >
                  <Text style={[styles.meta, { color: fg }]}>
                    {p.nat}
                    {born ? ` · ${fill(t.born, { n: born })}` : ''}
                  </Text>
                  <Text style={[styles.name, { color: fg }]}>{p.name}</Text>
                  <View style={{ flex: 1 }} />
                  {answered && (
                    <FlipIn>
                      <Text style={[styles.value, { color: fg }]}>{valueText(p, duel.key)}</Text>
                      <Text style={[styles.valueLabel, { color: fg }]}>{valueLabel(duel.key, t)}</Text>
                    </FlipIn>
                  )}
                </Pressable>
              </FlipIn>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />
        {answered && (
          <>
            <Stamp text={right ? t.correct : t.gameOver} color={right ? C.accent : C.text} />
            <Btn label={right ? t.nextQ : t.newGame} onPress={next} minHeight={52} fontSize={15} />
          </>
        )}
      </ScrollView>
      <Confetti active={right && streak > 0 && streak % 5 === 0} />
    </View>
  );
}

function valueText(p: DbPlayer, key: StatKey): string {
  if (key === 'age') return String(statsOf(p).born ?? '');
  return String(statValue(p, key));
}

function valueLabel(key: StatKey, t: Strings): string {
  if (key === 'age') return fill(t.born, { n: '' }).trim();
  return { goals: t.statGoals, apps: t.statApps, caps: t.statCaps }[key];
}

const styles = StyleSheet.create({
  best: { fontFamily: F.body, fontSize: 12, color: C.n700 },
  body: { flexGrow: 1, paddingTop: 14, paddingHorizontal: 16, paddingBottom: 16, gap: 12, maxWidth: 560, width: '100%', alignSelf: 'center' },
  streakRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, borderBottomWidth: 2, borderBottomColor: C.text, paddingBottom: 10 },
  streak: { fontFamily: F.heavy, fontSize: 64, lineHeight: 62, color: C.accent },
  streakLabel: { fontFamily: F.semi, fontSize: 13, color: C.n700 },
  question: { fontFamily: F.heavy, fontSize: 24, lineHeight: 28, letterSpacing: -0.24, color: C.text },
  card: { minHeight: 150, padding: 14, borderWidth: 2 },
  meta: { fontFamily: F.semi, fontSize: 12 },
  name: { fontFamily: F.heavy, fontSize: 28, lineHeight: 30, letterSpacing: -0.56, marginTop: 4 },
  value: { fontFamily: F.heavy, fontSize: 32, lineHeight: 34 },
  valueLabel: { fontFamily: F.body, fontSize: 12 },
});
