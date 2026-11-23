import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Kicker, LangDropdown, TopBar } from '../components/ui';
import { Lang, Strings } from '../i18n';
import { C, F } from '../theme';

interface Props {
  t: Strings;
  lang: Lang;
  onLang: (l: Lang) => void;
  onBack: () => void;
}

export function Settings({ t, lang, onLang, onBack }: Props) {
  const how = [t.how1, t.how2, t.how3, t.how4, t.how5];
  return (
    <View style={{ flex: 1 }}>
      <TopBar backLabel={t.home} onBack={onBack} title={t.settings} />
      <ScrollView contentContainerStyle={styles.wrap}>
        <Kicker style={{ marginTop: 16, marginBottom: 8 }}>{t.language}</Kicker>
        <LangDropdown lang={lang} onChange={onLang} variant="full" />

        <Kicker style={styles.section}>{t.howTitle}</Kicker>
        {how.map((line, i) => (
          <View key={i} style={styles.howRow}>
            <Text style={styles.howN}>{i + 1}</Text>
            <Text style={styles.howText}>{line}</Text>
          </View>
        ))}

        <Kicker style={styles.section}>{t.data}</Kicker>
        <Text style={styles.note}>{t.dataNote}</Text>

        <Text style={styles.footer}>Estafet Arena 1.0 · iOS · Android · Web</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 8, paddingHorizontal: 16, paddingBottom: 24, maxWidth: 560, width: '100%', alignSelf: 'center' },
  section: { marginTop: 28, marginBottom: 8 },
  howRow: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.divider },
  howN: { fontFamily: F.heavy, fontSize: 14, lineHeight: 20, color: C.accent700 },
  howText: { flex: 1, fontFamily: F.body, fontSize: 14, lineHeight: 20, color: C.text },
  note: { fontFamily: F.body, fontSize: 14, lineHeight: 21, color: C.text },
  footer: { marginTop: 28, paddingTop: 12, borderTopWidth: 2, borderTopColor: C.divider, fontFamily: F.body, fontSize: 12, color: C.n700 },
});
