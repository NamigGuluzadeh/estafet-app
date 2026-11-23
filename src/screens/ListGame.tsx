import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Option, SearchPicker } from '../components/SearchPicker';
import { LISTS } from '../data/lists';
import { Lang, Strings, fill } from '../i18n';
import { C } from '../theme';

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
  const [note, setNote] = useState('');
  const [picking, setPicking] = useState(false);

  const list = LISTS[index];
  const answers = useMemo(() => new Set(list.rows.map((r) => r.answer)), [list]);
  const found = list.rows.filter((r) => guessed.includes(r.answer)).length;
  const complete = found === list.rows.length;
  const over = complete || lives === 0;

  const options: Option[] = useMemo(
    () =>
      Object.entries(list.options)
        .filter(([key]) => !guessed.includes(key))
        .map(([key, label]) => ({ key, label: label[lang] })),
    [list, guessed, lang],
  );

  function guess(key: string) {
    setPicking(false);
    setGuessed([...guessed, key]);
    if (answers.has(key)) {
      setNote('');
    } else {
      setLives(lives - 1);
      setNote(fill(t.wrongGuess, { name: list.options[key][lang] }));
    }
  }

  function next() {
    setIndex((index + 1) % LISTS.length);
    setGuessed([]);
    setLives(LIVES);
    setNote('');
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable onPress={onQuit} accessibilityRole="button" hitSlop={10} style={styles.side}>
          <Text style={styles.quit}>‹ {t.quit}</Text>
        </Pressable>
        <Text style={styles.title}>{t.listTitle}</Text>
        <View style={styles.side} />
      </View>

      <View style={styles.question}>
        <Text style={styles.questionText}>{list.title[lang]}</Text>
      </View>

      <View style={styles.meta}>
        <Text style={styles.metaText}>
          {t.found}: <Text style={{ color: C.lime }}>{found}/{list.rows.length}</Text>
        </Text>
        <Text style={styles.metaText} accessibilityLabel={`${t.lives}: ${lives}`}>
          {t.lives}: {'♥'.repeat(lives)}
          <Text style={{ color: C.line }}>{'♥'.repeat(LIVES - lives)}</Text>
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ gap: 6 }} style={{ flex: 1 }}>
        {list.rows.map((row, i) => {
          const hit = guessed.includes(row.answer);
          const show = hit || over;
          return (
            <View key={i} style={[styles.row, hit && styles.rowHit, !hit && over && styles.rowMissed]}>
              <Text style={[styles.rowLabel, hit && { color: C.limeDark }]}>{row.label}</Text>
              <Text style={[styles.rowAnswer, hit && { color: C.limeDark }]}>
                {show ? list.options[row.answer][lang] : '? ? ?'}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <Text style={[styles.note, over && { color: C.lime, fontSize: 18, fontWeight: '900' }]}>
        {over ? (complete ? t.listDone : t.listOver) : note}
      </Text>

      <Pressable
        onPress={over ? next : () => setPicking(true)}
        accessibilityRole="button"
        style={styles.primary}
      >
        <Text style={styles.primaryText}>{over ? t.nextList : t.guess}</Text>
      </Pressable>

      {picking && (
        <SearchPicker
          title={list.title[lang]}
          placeholder={t.searchAnswer}
          closeLabel={t.close}
          emptyLabel={t.noMatch}
          options={options}
          onPick={guess}
          onClose={() => setPicking(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 12, gap: 10, maxWidth: 560, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  side: { minWidth: 70, paddingVertical: 6 },
  quit: { color: C.dim, fontSize: 15, fontWeight: '700' },
  title: { color: C.text, fontSize: 16, fontWeight: '900' },
  question: { backgroundColor: C.panel, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.line },
  questionText: { color: C.text, fontSize: 18, fontWeight: '900', textAlign: 'center' },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { color: C.text, fontSize: 15, fontWeight: '800' },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: C.panel, borderRadius: 10, paddingHorizontal: 14, minHeight: 44,
  },
  rowHit: { backgroundColor: C.lime },
  rowMissed: { borderWidth: 1, borderColor: C.mid },
  rowLabel: { color: C.dim, fontSize: 15, fontWeight: '800' },
  rowAnswer: { color: C.text, fontSize: 15, fontWeight: '800' },
  note: { color: C.mid, fontSize: 14, fontWeight: '700', textAlign: 'center', minHeight: 22 },
  primary: { minHeight: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: C.lime },
  primaryText: { color: C.limeDark, fontWeight: '900', fontSize: 16 },
});
