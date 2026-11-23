import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Pitch } from '../components/Pitch';
import { PlayerCard } from '../components/PlayerCard';
import { FlipIn, Kicker, ModeHeader, TopBar } from '../components/ui';
import { Player } from '../data/players';
import { Lineup, ROUNDS, Score, SLOTS, generateOffers, openSlotsFor, scoreLineup } from '../game/engine';
import { Strings } from '../i18n';
import { C, F } from '../theme';

interface Props {
  t: Strings;
  seed: string;
  title: string;
  onDone: (lineup: Lineup, score: Score) => void;
  onQuit: () => void;
}

export function Draft({ t, seed, title, onDone, onQuit }: Props) {
  const [lineup, setLineup] = useState<Lineup>(() => SLOTS.map(() => null));
  const [round, setRound] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(() => new Set());
  const [selected, setSelected] = useState<Player | null>(null);

  const offers = useMemo(() => generateOffers(seed, round, lineup, seen), [seed, round]);
  const score = useMemo(() => scoreLineup(lineup), [lineup]);
  const targets = selected ? openSlotsFor(lineup, selected) : [];

  function place(player: Player, slot: number) {
    const next = lineup.slice();
    next[slot] = player;
    if (round + 1 >= ROUNDS) {
      onDone(next, scoreLineup(next));
      return;
    }
    const nextSeen = new Set(seen);
    offers.forEach((o) => nextSeen.add(o.id));
    setSeen(nextSeen);
    setLineup(next);
    setSelected(null);
    setRound(round + 1);
  }

  function pick(player: Player) {
    if (selected?.id === player.id) {
      setSelected(null);
      return;
    }
    const slots = openSlotsFor(lineup, player);
    // Only one place it can go: no second tap needed.
    if (slots.length === 1) place(player, slots[0]);
    else setSelected(player);
  }

  return (
    <View style={{ flex: 1 }}>
      <TopBar
        backLabel={t.quit}
        onBack={onQuit}
        right={
          <Text style={styles.round}>
            {t.round} {round + 1}/{ROUNDS}
          </Text>
        }
      />
      <ModeHeader icon="shirt" title={title} n="05" />
      <View style={styles.body}>
        <View style={styles.scores}>
          <ScoreBox label={t.talent} value={score.talent} />
          <ScoreBox label={t.chem} value={score.chem} ruled />
          <ScoreBox label={t.total} value={score.total} strong />
        </View>

        <Pitch lineup={lineup} links={score.links} t={t} targets={targets} onSlotPress={(slot) => selected && place(selected, slot)} />

        <Kicker>{selected ? t.pickSlot : t.pickCard}</Kicker>
        <View style={styles.offers}>
          {offers.map((p, i) => (
            <FlipIn key={`${round}-${p.id}`} trigger={round} delay={i * 70} style={{ flex: 1 }}>
              <PlayerCard
                player={p}
                t={t}
                selected={selected?.id === p.id}
                dimmed={!!selected && selected.id !== p.id}
                onPress={() => pick(p)}
              />
            </FlipIn>
          ))}
        </View>
      </View>
    </View>
  );
}

function ScoreBox({ label, value, strong, ruled }: { label: string; value: number; strong?: boolean; ruled?: boolean }) {
  return (
    <View style={[styles.scoreBox, ruled && { borderLeftWidth: 2, borderLeftColor: C.text }, strong && { backgroundColor: C.accent }]}>
      <Text style={[styles.scoreValue, strong && { color: C.bg }]}>{value}</Text>
      <Text style={[styles.scoreLabel, strong && { color: C.bg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  round: { fontFamily: F.heavy, fontSize: 14, color: C.accent700 },
  body: { flex: 1, paddingTop: 12, paddingHorizontal: 16, paddingBottom: 14, gap: 10, maxWidth: 560, width: '100%', alignSelf: 'center' },
  scores: { flexDirection: 'row', borderWidth: 2, borderColor: C.text },
  scoreBox: { flex: 1, paddingVertical: 6, paddingHorizontal: 10 },
  scoreValue: { fontFamily: F.heavy, fontSize: 20, color: C.text },
  scoreLabel: { fontFamily: F.body, fontSize: 11, color: C.n700 },
  offers: { flexDirection: 'row', gap: 8 },
});
