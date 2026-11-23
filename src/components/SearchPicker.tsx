import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { normalize } from '../game/xo';
import { C } from '../theme';

export interface Option {
  key: string;
  label: string;
}

interface Props {
  title: string;
  placeholder: string;
  closeLabel: string;
  emptyLabel: string;
  options: Option[];
  onPick: (key: string) => void;
  onClose: () => void;
}

/** Full-screen answer search. Sits at the top so the phone keyboard never covers it. */
export function SearchPicker({ title, placeholder, closeLabel, emptyLabel, options, onPick, onClose }: Props) {
  const [q, setQ] = useState('');
  const indexed = useMemo(() => options.map((o) => ({ ...o, n: normalize(o.label) })), [options]);
  const nq = normalize(q).trim();
  const results =
    nq.length < 2
      ? []
      : indexed
          .filter((o) => o.n.includes(nq))
          // stable sort: ties keep the caller's order (players arrive best-known first)
          .sort((a, b) => Number(b.n.startsWith(nq)) - Number(a.n.startsWith(nq)))
          .slice(0, 8);

  return (
    <View style={styles.overlay}>
      <View style={styles.head}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Pressable onPress={onClose} accessibilityRole="button" hitSlop={10} style={styles.close}>
          <Text style={styles.closeText}>{closeLabel}</Text>
        </Pressable>
      </View>
      <TextInput
        autoFocus
        value={q}
        onChangeText={setQ}
        placeholder={placeholder}
        placeholderTextColor={C.dim}
        autoCorrect={false}
        autoCapitalize="none"
        accessibilityLabel={placeholder}
        style={styles.input}
      />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 6 }}>
        {results.map((o) => (
          <Pressable key={o.key} onPress={() => onPick(o.key)} accessibilityRole="button" style={styles.item}>
            <Text style={styles.itemText}>{o.label}</Text>
          </Pressable>
        ))}
        {nq.length >= 2 && results.length === 0 && <Text style={styles.empty}>{emptyLabel}</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: C.bg, padding: 14, gap: 10,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  title: { color: C.text, fontSize: 16, fontWeight: '900', flex: 1 },
  close: { paddingVertical: 8, paddingHorizontal: 4 },
  closeText: { color: C.dim, fontSize: 15, fontWeight: '700' },
  input: {
    backgroundColor: C.panel, borderRadius: 12, borderWidth: 2, borderColor: C.lime,
    color: C.text, fontSize: 17, paddingHorizontal: 14, minHeight: 50,
  },
  item: {
    backgroundColor: C.panel, borderRadius: 10, borderWidth: 1, borderColor: C.line,
    paddingHorizontal: 14, minHeight: 48, justifyContent: 'center',
  },
  itemText: { color: C.text, fontSize: 16, fontWeight: '700' },
  empty: { color: C.dim, fontSize: 14, textAlign: 'center', marginTop: 12 },
});
