import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { normalize } from '../game/xo';
import { C, F, SHADOW_LG } from '../theme';
import { Icon } from './Icon';

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
  /**
   * Characters needed before results show. Keep 2 for the 11,000-player database;
   * short lists (10-luq) pass 0 to show every option straight away.
   */
  minChars?: number;
  maxResults?: number;
}

/** Bottom sheet with a search box. Lifts above the keyboard. */
export function SearchPicker({ title, placeholder, closeLabel, emptyLabel, options, onPick, onClose, minChars = 2, maxResults = 8 }: Props) {
  const [q, setQ] = useState('');
  const indexed = useMemo(() => options.map((o) => ({ ...o, n: normalize(o.label) })), [options]);
  const nq = normalize(q).trim();
  const ready = nq.length >= minChars;
  const results = !ready
    ? []
    : indexed
        .filter((o) => o.n.includes(nq))
        // stable sort: ties keep the caller's order (players arrive best-known first)
        .sort((a, b) => Number(b.n.startsWith(nq)) - Number(a.n.startsWith(nq)))
        .slice(0, minChars === 0 ? undefined : maxResults);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
      <Pressable style={styles.scrimTap} onPress={onClose} accessibilityLabel={closeLabel} />
      <View style={styles.sheet}>
        <View style={styles.head}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={closeLabel} style={styles.close}>
            <Icon name="close" size={20} color={C.text} />
          </Pressable>
        </View>
        <TextInput
          autoFocus
          value={q}
          onChangeText={setQ}
          placeholder={placeholder}
          placeholderTextColor={C.n600}
          autoCorrect={false}
          autoCapitalize="none"
          accessibilityLabel={placeholder}
          style={styles.input}
        />
        <ScrollView keyboardShouldPersistTaps="handled" style={styles.list}>
          {results.map((o) => (
            <Pressable
              key={o.key}
              onPress={() => onPick(o.key)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.item, pressed && { backgroundColor: C.n200 }]}
            >
              {({ pressed }) => <Text style={[styles.itemText, pressed && { color: C.accent700 }]}>{o.label}</Text>}
            </Pressable>
          ))}
          {ready && results.length === 0 && <Text style={styles.empty}>{emptyLabel}</Text>}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 20, backgroundColor: C.scrim },
  scrimTap: { flex: 1, minHeight: 60 },
  sheet: {
    backgroundColor: C.bg,
    borderTopWidth: 2,
    borderTopColor: C.text,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
    boxShadow: SHADOW_LG,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontFamily: F.heavy, fontSize: 17, color: C.text },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: -10 },
  input: {
    minHeight: 46,
    fontSize: 16,
    fontFamily: F.body,
    color: C.text,
    backgroundColor: C.bg,
    borderWidth: 2,
    borderColor: C.accent,
    paddingHorizontal: 12,
  },
  list: { height: 336, flexGrow: 0 },
  item: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: C.divider },
  itemText: { fontFamily: F.semi, fontSize: 15, color: C.text },
  empty: { paddingVertical: 14, paddingHorizontal: 4, fontFamily: F.body, fontSize: 14, color: C.n700 },
});
