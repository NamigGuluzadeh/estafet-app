import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CLUBS, FLAGS, Player } from '../data/players';
import { Strings } from '../i18n';
import { C, TIER_COLOR } from '../theme';

interface Props {
  player: Player;
  t: Strings;
  selected?: boolean;
  dimmed?: boolean;
  onPress?: () => void;
}

export function PlayerCard({ player, t, selected, dimmed, onPress }: Props) {
  const color = TIER_COLOR[player.tier];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${player.name}, ${CLUBS[player.club].name}`}
      style={[styles.card, { borderColor: selected ? C.lime : C.line }, dimmed && styles.dimmed, selected && styles.selected]}
    >
      <View style={[styles.band, { backgroundColor: color }]}>
        <Text style={styles.bandText}>{t.tiers[player.tier].toUpperCase()}</Text>
        <Text style={styles.bandText}>{t.pos[player.pos]}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.flag}>{FLAGS[player.nat] ?? player.nat}</Text>
        <Text style={styles.name} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7}>
          {player.name}
        </Text>
        <Text style={styles.club} numberOfLines={1}>{CLUBS[player.club].name}</Text>
        <Text style={styles.nat}>{player.nat}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: C.panel,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  selected: { backgroundColor: C.panelHi, transform: [{ translateY: -6 }] },
  dimmed: { opacity: 0.45 },
  band: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 4 },
  bandText: { color: '#10161F', fontWeight: '800', fontSize: 11, letterSpacing: 0.5 },
  body: { alignItems: 'center', paddingHorizontal: 6, paddingVertical: 8, gap: 2 },
  flag: { fontSize: 24 },
  name: { color: C.text, fontWeight: '800', fontSize: 14, textAlign: 'center', minHeight: 38 },
  club: { color: C.lime, fontWeight: '600', fontSize: 12 },
  nat: { color: C.dim, fontSize: 11, fontWeight: '600' },
});
