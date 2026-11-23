import { ReactNode } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from '../components/Icon';
import { Btn, Kicker, LangDropdown, MediaBox } from '../components/ui';
import { HERO_IMAGE, LATEST_VIDEO } from '../config';
import { DAILY_DRAFTS, rankFor } from '../game/engine';
import { Lang, Strings } from '../i18n';
import { Save } from '../storage';
import { C, F } from '../theme';

interface Props {
  t: Strings;
  save: Save;
  day: string;
  onLang: (l: Lang) => void;
  onSettings: () => void;
  onDaily: (draftNo: number) => void;
  onPractice: () => void;
  onXO: (vsBot: boolean) => void;
  onList: () => void;
  onTarget: () => void;
  onHL: () => void;
}

// Home direction 1a from the design handoff: ruled list.
export function Home({ t, save, day, onLang, onSettings, onDaily, onPractice, onXO, onList, onTarget, onHL }: Props) {
  const today = save.days[day] ?? {};
  const todayScores = Object.values(today);
  const todayBest = todayScores.length ? Math.max(...todayScores) : null;
  const lang = save.lang;

  const modes: { n: string; icon: IconName; title: string; sub: string; go: () => void }[] = [
    { n: '02', icon: 'list', title: t.listTitle, sub: t.listSub, go: onList },
    { n: '03', icon: 'target', title: t.targetTitle, sub: t.targetSub, go: onTarget },
    { n: '04', icon: 'updown', title: t.hlTitle, sub: t.hlSub, go: onHL },
  ];

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Text style={styles.logo}>
            ESTAFET <Text style={{ color: C.accent }}>ARENA</Text>
          </Text>
          <Text style={styles.tagline}>{t.tagline}</Text>
        </View>
        <View style={styles.topRight}>
          <LangDropdown lang={lang} onChange={onLang} />
          <Pressable onPress={onSettings} accessibilityRole="button" accessibilityLabel={t.settings} style={styles.gear}>
            {({ pressed }) => <Icon name="settings" size={20} color={pressed ? C.accent : C.text} />}
          </Pressable>
        </View>
      </View>

      <MediaBox source={HERO_IMAGE} height={184} style={styles.hero}>
        <View style={styles.heroKicker} pointerEvents="none">
          <Text style={styles.heroKickerText}>{t.heroKicker}</Text>
        </View>
      </MediaBox>

      <View style={styles.stats}>
        <Stat label={t.streak} value={`${save.streak}`} unit={` ${t.days}`} />
        <Stat label={t.todayBest} value={todayBest === null ? '–' : `${todayBest}`} ruled />
        <Stat label={t.best} value={save.best ? `${save.best}` : '–'} ruled />
      </View>

      <Kicker style={styles.section}>{t.modes}</Kicker>
      <View style={styles.xoRow}>
        <View style={styles.modeLine}>
          <Text style={styles.num}>01</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>{t.xoTitle}</Text>
            <Text style={styles.rowSub}>{t.xoSub}</Text>
          </View>
          <IconBox icon="grid" />
        </View>
        <View style={styles.xoBtns}>
          <Btn label={t.vsBot} onPress={() => onXO(true)} style={{ flex: 1 }} />
          <Btn label={t.twoPlayers} variant="secondary" onPress={() => onXO(false)} style={{ flex: 1 }} />
        </View>
      </View>
      {modes.map((m) => (
        <Row key={m.n} onPress={m.go} label={m.title}>
          <Text style={[styles.num, { alignSelf: 'flex-start' }]}>{m.n}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>{m.title}</Text>
            <Text style={styles.rowSub}>{m.sub}</Text>
          </View>
          <IconBox icon={m.icon} />
        </Row>
      ))}

      <Kicker style={styles.section}>{t.dailyTitle}</Kicker>
      {Array.from({ length: DAILY_DRAFTS }, (_, i) => i + 1).map((n) => {
        const score = today[n];
        const done = score !== undefined;
        return (
          <Row key={n} onPress={() => onDaily(n)} disabled={done} label={`${t.draft} #${n}`}>
            <View style={{ flex: 1 }}>
              <Text style={styles.dailyTitle}>
                {t.draft} #{n}
              </Text>
              <Text style={styles.rowSub}>{done ? `${t.played} · ${t.ranks[rankFor(score)]}` : '11 × 3'}</Text>
            </View>
            {done ? (
              <Text style={styles.score}>{score}</Text>
            ) : (
              <View style={styles.playTag}>
                <Text style={styles.playTagText}>{t.play}</Text>
              </View>
            )}
          </Row>
        );
      })}
      <Row onPress={onPractice} label={t.practice} last>
        <View style={{ flex: 1 }}>
          <Text style={styles.dailyTitle}>{t.practice}</Text>
          <Text style={styles.rowSub}>{t.practiceSub}</Text>
        </View>
        <IconBox icon="repeat" />
      </Row>

      <View style={styles.video}>
        <View style={styles.videoKicker}>
          <Icon name="youtube" size={18} color={C.accent} />
          <Kicker>{t.latestVideo}</Kicker>
        </View>
        <MediaBox source={LATEST_VIDEO.thumbnail} height={196}>
          <View style={styles.duration} pointerEvents="none">
            <Text style={styles.durationText}>{LATEST_VIDEO.duration}</Text>
          </View>
        </MediaBox>
        <View style={styles.videoInfo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.videoTitle}>{LATEST_VIDEO.title[lang]}</Text>
            <Text style={styles.rowSub}>Estafet · {LATEST_VIDEO.meta[lang]}</Text>
          </View>
          <Pressable
            onPress={() => Linking.openURL(LATEST_VIDEO.url).catch(() => {})}
            accessibilityRole="link"
            accessibilityLabel={t.watch}
            style={({ pressed }) => [styles.watch, pressed && { backgroundColor: C.accent600 }]}
          >
            <Icon name="play" size={22} color={C.bg} />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function Row({ children, onPress, disabled, label, last }: { children: ReactNode; onPress: () => void; disabled?: boolean; label: string; last?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.row, last && styles.rowLast, pressed && { backgroundColor: C.n200 }]}
    >
      {children}
    </Pressable>
  );
}

function IconBox({ icon }: { icon: IconName }) {
  return (
    <View style={styles.iconBox}>
      <Icon name={icon} size={20} color={C.text} />
    </View>
  );
}

function Stat({ label, value, unit, ruled }: { label: string; value: string; unit?: string; ruled?: boolean }) {
  return (
    <View style={[styles.stat, ruled && styles.statRuled]}>
      <Text style={styles.statValue}>
        {value}
        {unit ? <Text style={styles.statUnit}>{unit}</Text> : null}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 8, paddingHorizontal: 16, paddingBottom: 24, maxWidth: 560, width: '100%', alignSelf: 'center' },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, paddingBottom: 12 },
  logo: { fontFamily: F.heavy, fontSize: 26, lineHeight: 28, letterSpacing: -0.52, color: C.text },
  tagline: { fontFamily: F.body, fontSize: 13, marginTop: 4, color: C.n700 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  gear: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  hero: { marginHorizontal: -16, marginBottom: 16 },
  heroKicker: { position: 'absolute', left: 0, bottom: 0, backgroundColor: C.accent, paddingVertical: 8, paddingHorizontal: 16 },
  heroKickerText: { fontFamily: F.heavy, fontSize: 12, letterSpacing: 0.96, textTransform: 'uppercase', color: C.bg },
  stats: { flexDirection: 'row', borderTopWidth: 2, borderBottomWidth: 2, borderColor: C.divider },
  stat: { flex: 1, paddingVertical: 12, paddingHorizontal: 10 },
  statRuled: { borderLeftWidth: 2, borderLeftColor: C.divider },
  statValue: { fontFamily: F.heavy, fontSize: 26, lineHeight: 28, color: C.text },
  statUnit: { fontFamily: F.semi, fontSize: 12, color: C.n700 },
  statLabel: { fontFamily: F.body, fontSize: 12, marginTop: 4, color: C.n700 },
  section: { marginTop: 24, marginBottom: 4 },
  xoRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.divider },
  modeLine: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  xoBtns: { flexDirection: 'row', gap: 8, marginTop: 12, marginLeft: 60 },
  num: { width: 48, fontFamily: F.heavy, fontSize: 34, lineHeight: 34, letterSpacing: -1.36, color: C.accent },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, minHeight: 68, borderBottomWidth: 1, borderBottomColor: C.divider },
  rowLast: { borderBottomWidth: 2, minHeight: 64, paddingVertical: 10 },
  rowTitle: { fontFamily: F.heavy, fontSize: 18, color: C.text },
  rowSub: { fontFamily: F.body, fontSize: 13, color: C.n700, marginTop: 1 },
  dailyTitle: { fontFamily: F.heavy, fontSize: 17, color: C.text },
  iconBox: { width: 40, height: 40, borderWidth: 2, borderColor: C.text, alignItems: 'center', justifyContent: 'center' },
  score: { fontFamily: F.heavy, fontSize: 24, color: C.text },
  playTag: { minWidth: 76, minHeight: 40, paddingHorizontal: 16, justifyContent: 'center', backgroundColor: C.accent },
  playTagText: { fontFamily: F.semi, fontSize: 14, color: C.bg },
  video: { gap: 8, marginTop: 24 },
  videoKicker: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  duration: { position: 'absolute', right: 0, bottom: 0, backgroundColor: C.text, paddingVertical: 3, paddingHorizontal: 7 },
  durationText: { fontFamily: F.semi, fontSize: 12, color: C.bg },
  videoInfo: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  videoTitle: { fontFamily: F.heavy, fontSize: 17, lineHeight: 20, color: C.text },
  watch: { width: 48, height: 48, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
});
