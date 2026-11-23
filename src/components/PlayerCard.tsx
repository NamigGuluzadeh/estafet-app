import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CLUBS, Player } from '../data/players';
import { TALENT_PER_TIER } from '../game/engine';
import { Strings } from '../i18n';
import { C, F } from '../theme';

interface Props {
  player: Player;
  t: Strings;
  selected?: boolean;
  dimmed?: boolean;
  onPress?: () => void;
}

/** Draft offer card. Elite and Legend tiers get a red band, the rest an ink one. */
export function PlayerCard({ player, t, selected, dimmed, onPress }: Props) {
  const high = player.tier >= 4;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={`${player.name}, ${CLUBS[player.club].name}, ${t.tiers[player.tier]}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: selected ? C.accent100 : C.surface, borderColor: selected || pressed ? C.accent : 'transparent' },
        dimmed && { opacity: 0.45 },
      ]}
    >
      <View style={[styles.band, { backgroundColor: high ? C.accent : C.text }]} />
      <Text style={[styles.tier, { color: high ? C.accent700 : C.n700 }]}>{t.tiers[player.tier]}</Text>
      <Text style={styles.name} numberOfLines={2}>
        {player.name}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {CLUBS[player.club].short} · {player.nat}
      </Text>
      <View style={styles.foot}>
        <Text style={styles.footText}>{t.pos[player.pos]}</Text>
        <Text style={styles.footText}>+{player.tier * TALENT_PER_TIER}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minHeight: 132, paddingVertical: 8, paddingHorizontal: 9, gap: 2, borderWidth: 2, overflow: 'hidden' },
  band: { position: 'absolute', left: 0, right: 0, top: 0, height: 5 },
  tier: { fontFamily: F.heavy, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 6 },
  name: { flex: 1, fontFamily: F.heavy, fontSize: 15, lineHeight: 16.5, color: C.text },
  meta: { fontFamily: F.body, fontSize: 11, color: C.n700 },
  foot: { flexDirection: 'row', justifyContent: 'space-between' },
  footText: { fontFamily: F.heavy, fontSize: 12, color: C.text },
});
