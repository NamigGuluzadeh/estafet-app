import { useEffect, useMemo, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Option, SearchPicker } from '../components/SearchPicker';
import { Btn, Confetti, FlipIn, ModeHeader, NATIVE_DRIVER, Stamp, TopBar, useToast } from '../components/ui';
import { LISTS } from '../data/lists';
import { Lang, Strings, fill } from '../i18n';
import { C, F } from '../theme';

interface Props {
  t: Strings;
  lang: Lang;
  onQuit: () => void;
}

const LIVES = 3;

export function ListGame({ t, lang, onQuit }: Props) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * LISTS.length));
  const [guessed, setGuessed] = useState<string[]>([]);
  const [lives, setLives] = useState(LIVES);
  const [picking, setPicking] = useState(false);
  const [toast, showToast] = useToast();

  const list = LISTS[index];
  const answers = useMemo(() => new Set(list.rows.map((r) => r.answer)), [list]);
  const found = list.rows.filter((r) => guessed.includes(r.answer)).length;
  const complete = found === list.rows.length;
  const over = complete || lives === 0;
  const misses = guessed.filter((k) => !answers.has(k));

  const options: Option[] = useMemo(
    () =>
      Object.entries(list.options)
        .filter(([key]) => !guessed.includes(key))
        .map(([key, label]) => ({ key, label: label[lang] }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [list, guessed, lang],
  );

  function guess(key: string) {
    setPicking(false);
    setGuessed([...guessed, key]);
    if (!answers.has(key)) {
      setLives(lives - 1);
      showToast(fill(t.wrongGuess, { name: list.options[key][lang] }));
    }
  }

  function next() {
    setIndex((index + 1) % LISTS.length);
    setGuessed([]);
    setLives(LIVES);
  }

  return (
    <View style={{ flex: 1 }}>
      <TopBar
        backLabel={t.quit}
        onBack={onQuit}
        right={
          <View style={styles.lives} accessibilityLabel={`${t.lives}: ${lives}`}>
            {Array.from({ length: LIVES }, (_, i) => (
              <Life key={i} alive={i < lives} />
            ))}
          </View>
        }
      />
      <ModeHeader icon="list" title={t.listTitle} n="02" />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.question}>{list.title[lang]}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>
            {t.found} {found}/{list.rows.length}
          </Text>
          <Text style={[styles.metaText, { flexShrink: 1, textAlign: 'right' }]}>
            {misses.length ? `${t.misses}: ${misses.map((k) => list.options[k][lang]).join(', ')}` : ''}
          </Text>
        </View>

        <View style={styles.rows}>
          {list.rows.map((row, i) => {
            const hit = guessed.includes(row.answer);
            const show = hit || over;
            return (
              <View key={`${index}-${i}`} style={styles.row}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                {show ? (
                  <FlipIn style={{ flex: 1 }}>
                    <Text style={[styles.rowAnswer, { color: hit ? C.text : C.n500 }]} numberOfLines={1}>
                      {list.options[row.answer][lang]}
                    </Text>
                  </FlipIn>
                ) : (
                  <View style={styles.bar} />
                )}
              </View>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />
        {over && <Stamp text={complete ? t.listDone : t.listOver} color={complete ? C.accent : C.text} />}
        <Btn
          label={over ? t.nextList : t.guess}
          icon="search"
          onPress={over ? next : () => setPicking(true)}
          minHeight={52}
          fontSize={15}
        />
      </ScrollView>

      {picking && (
        <SearchPicker
          title={list.title[lang]}
          placeholder={t.searchAnswer}
          closeLabel={t.close}
          emptyLabel={t.noMatch}
          options={options}
          onPick={guess}
          onClose={() => setPicking(false)}
          minChars={0}
        />
      )}
      <Confetti active={complete} />
      {toast}
    </View>
  );
}

/** Red square per life; a lost one swells, then shrinks and turns 45°. */
function Life({ alive }: { alive: boolean }) {
  const v = useState(() => new Animated.Value(alive ? 0 : 1))[0];
  useEffect(() => {
    Animated.timing(v, { toValue: alive ? 0 : 1, duration: alive ? 0 : 500, useNativeDriver: NATIVE_DRIVER }).start();
  }, [alive]);
  return (
    <Animated.View
      style={[
        styles.life,
        { backgroundColor: alive ? C.accent : 'transparent' },
        {
          transform: [
            { scale: v.interpolate({ inputRange: [0, 0.4, 1], outputRange: [1, 1.7, 0.8] }) },
            { rotate: v.interpolate({ inputRange: [0, 0.4, 1], outputRange: ['0deg', '0deg', '45deg'] }) },
          ],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  lives: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  life: { width: 14, height: 14, borderWidth: 2, borderColor: C.accent },
  body: { flexGrow: 1, paddingTop: 14, paddingHorizontal: 16, paddingBottom: 16, gap: 10, maxWidth: 560, width: '100%', alignSelf: 'center' },
  question: { fontFamily: F.heavy, fontSize: 24, lineHeight: 27, letterSpacing: -0.24, color: C.text },
  meta: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  metaText: { fontFamily: F.body, fontSize: 13, color: C.n700 },
  rows: { borderTopWidth: 2, borderTopColor: C.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, height: 42, borderBottomWidth: 1, borderBottomColor: C.divider },
  rowLabel: { width: 44, fontFamily: F.semi, fontSize: 13, color: C.n700 },
  rowAnswer: { fontFamily: F.heavy, fontSize: 16 },
  bar: { flex: 1, height: 14, backgroundColor: C.n300 },
});
