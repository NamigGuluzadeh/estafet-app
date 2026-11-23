import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Pitch } from '../components/Pitch';
import { PlayerCard } from '../components/PlayerCard';
import { Player } from '../data/players';
import { Lineup, ROUNDS, Score, SLOTS, generateOffers, openSlotsFor, scoreLineup } from '../game/engine';
import { Strings } from '../i18n';
import { C } from '../theme';

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
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable onPress={onQuit} accessibilityRole="button" hitSlop={10} style={styles.quit}>
          <Text style={styles.quitText}>‹ {t.quit}</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.round}>
          {t.round} {round + 1}/{ROUNDS}
        </Text>
      </View>

      <View style={styles.scoreRow}>
        <ScoreBox label={t.talent} value={score.talent} />
        <ScoreBox label={t.chem} value={score.chem} />
        <ScoreBox label={t.total} value={score.total} strong />
      </View>

      <Pitch
        lineup={lineup}
        links={score.links}
        t={t}
        targets={targets}
        onSlotPress={(slot) => selected && place(selected, slot)}
      />

      <Text style={styles.prompt}>{selected ? t.pickSlot : t.pickCard}</Text>
      <View style={styles.offers}>
        {offers.map((p) => (
          <PlayerCard
            key={p.id}
            player={p}
            t={t}
            selected={selected?.id === p.id}
            dimmed={!!selected && selected.id !== p.id}
            onPress={() => pick(p)}
          />
        ))}
      </View>
    </View>
  );
}

function ScoreBox({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <View style={[styles.scoreBox, strong && { backgroundColor: C.lime }]}>
      <Text style={[styles.scoreValue, strong && { color: C.limeDark }]}>{value}</Text>
      <Text style={[styles.scoreLabel, strong && { color: C.limeDark }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 12, gap: 10, maxWidth: 560, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quit: { minWidth: 70, paddingVertical: 6 },
  quitText: { color: C.dim, fontSize: 15, fontWeight: '700' },
  title: { color: C.text, fontSize: 16, fontWeight: '900' },
  round: { color: C.lime, fontSize: 14, fontWeight: '800', minWidth: 70, textAlign: 'right' },
  scoreRow: { flexDirection: 'row', gap: 8 },
  scoreBox: { flex: 1, backgroundColor: C.panel, borderRadius: 10, paddingVertical: 6, alignItems: 'center' },
  scoreValue: { color: C.text, fontSize: 20, fontWeight: '900' },
  scoreLabel: { color: C.dim, fontSize: 11, fontWeight: '700' },
  prompt: { color: C.dim, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center' },
  offers: { flexDirection: 'row', gap: 8, paddingTop: 6 },
});
