import { useEffect, useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { Pitch } from '../components/Pitch';
import { Btn, Confetti, FlipIn, Kicker, ModeHeader, Stamp, TopBar } from '../components/ui';
import { Lineup, MAX_SCORE, Score, rankFor } from '../game/engine';
import { Strings, fill } from '../i18n';
import { C, F } from '../theme';

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

const REVEAL_MS = 1300;

/** 0 → 1 over REVEAL_MS with an ease-out cubic, for the score count-up. */
function useReveal(): number {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = Date.now();
    const step = () => {
      const k = Math.min(1, (Date.now() - t0) / REVEAL_MS);
      setP(1 - Math.pow(1 - k, 3));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);
  return p;
}

export function Result({ t, title, lineup, score, isBest, onHome, onAgain }: Props) {
  const rank = t.ranks[rankFor(score.total)];
  const p = useReveal();
  const done = p >= 1;

  async function share() {
    const message = fill(t.shareText, {
      tag: title,
      total: score.total,
      rank,
      talent: score.talent,
      chem: score.chem,
    });
    try {
      await Share.share({ message });
    } catch {
      // sharing unavailable or cancelled
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <TopBar backLabel={t.home} onBack={onHome} />
      <ModeHeader icon="shirt" title={title} n="05" />
      <View style={styles.body}>
        <View style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Kicker>{t.resultTitle}</Kicker>
            <Text style={styles.total}>
              {Math.round(score.total * p)}
              <Text style={styles.max}> / {MAX_SCORE}</Text>
            </Text>
            <Text style={styles.breakdown}>
              {t.talent} {Math.round(score.talent * p)} · {t.chem} {Math.round(score.chem * p)}
            </Text>
          </View>
          <View style={styles.rankCol}>
            {done && (
              <>
                <Stamp text={rank} />
                {isBest && (
                  <FlipIn delay={350}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{t.newBest}</Text>
                    </View>
                  </FlipIn>
                )}
              </>
            )}
          </View>
        </View>
        <View style={styles.bar}>
          <View style={{ width: `${(score.talent / MAX_SCORE) * 100 * p}%`, backgroundColor: C.text }} />
          <View style={{ width: `${(score.chem / MAX_SCORE) * 100 * p}%`, backgroundColor: C.accent }} />
        </View>

        <Pitch lineup={lineup} links={score.links} t={t} stagger maxHeight={340} />

        <Btn label={t.share} icon="share" onPress={share} minHeight={52} fontSize={15} />
        <View style={styles.actions}>
          <Btn label={t.again} variant="secondary" onPress={onAgain} minHeight={48} style={{ flex: 1 }} />
          <Btn label={t.home} variant="secondary" onPress={onHome} minHeight={48} style={{ flex: 1 }} />
        </View>
      </View>
      <Confetti active={done && isBest} />
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingTop: 12, paddingHorizontal: 16, paddingBottom: 14, gap: 10, maxWidth: 560, width: '100%', alignSelf: 'center' },
  hero: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, borderBottomWidth: 2, borderBottomColor: C.text, paddingBottom: 10 },
  total: { fontFamily: F.heavy, fontSize: 72, lineHeight: 70, letterSpacing: -2.88, color: C.text, fontVariant: ['tabular-nums'] },
  max: { fontFamily: F.semi, fontSize: 16, letterSpacing: 0, color: C.n700 },
  breakdown: { fontFamily: F.body, fontSize: 13, marginTop: 4, color: C.n700 },
  rankCol: { alignItems: 'flex-start', gap: 8, paddingBottom: 4, minWidth: 112 },
  tag: { backgroundColor: C.accent100, paddingVertical: 3, paddingHorizontal: 8 },
  tagText: { fontFamily: F.semi, fontSize: 12, color: C.accent800 },
  bar: { height: 8, flexDirection: 'row', backgroundColor: C.n300 },
  actions: { flexDirection: 'row', gap: 8 },
});
