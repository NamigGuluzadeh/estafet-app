import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CLUBS, FLAGS } from '../data/players';
import { LINKS, Lineup, SLOTS } from '../game/engine';
import { Strings } from '../i18n';
import { C, TIER_COLOR, linkColor } from '../theme';

interface Props {
  lineup: Lineup;
  links: number[];
  t: Strings;
  /** slot indexes that can take the selected card */
  targets?: number[];
  onSlotPress?: (slot: number) => void;
}

const CHIP_W = 76;
const CHIP_H = 46;

export function Pitch({ lineup, links, t, targets = [], onSlotPress }: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const { w, h } = size;

  return (
    <View
      style={styles.pitch}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      <View style={styles.halfLine} />
      <View style={styles.circle} />
      <View style={styles.box} />

      {w > 0 &&
        LINKS.map(([a, b], i) => {
          const x1 = SLOTS[a].x * w, y1 = SLOTS[a].y * h;
          const x2 = SLOTS[b].x * w, y2 = SLOTS[b].y * h;
          const len = Math.hypot(x2 - x1, y2 - y1);
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const v = links[i];
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: (x1 + x2) / 2 - len / 2,
                top: (y1 + y2) / 2 - (v > 0 ? 2 : 1),
                width: len,
                height: v > 0 ? 4 : 2,
                borderRadius: 2,
                backgroundColor: v < 0 ? 'rgba(255,255,255,0.10)' : linkColor(v),
                transform: [{ rotate: `${angle}rad` }],
              }}
            />
          );
        })}

      {w > 0 &&
        SLOTS.map((slot, i) => {
          const p = lineup[i];
          const isTarget = targets.includes(i);
          return (
            <Pressable
              key={slot.id}
              disabled={!isTarget}
              onPress={() => onSlotPress?.(i)}
              accessibilityLabel={p ? p.name : `${t.pos[slot.pos]} ${slot.id}`}
              style={[
                styles.chip,
                { left: slot.x * w - CHIP_W / 2, top: slot.y * h - CHIP_H / 2 },
                p
                  ? { backgroundColor: C.bg, borderColor: TIER_COLOR[p.tier] }
                  : isTarget
                    ? styles.target
                    : styles.empty,
              ]}
            >
              {p ? (
                <>
                  <Text style={styles.chipName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                    {p.name}
                  </Text>
                  <Text style={styles.chipMeta} numberOfLines={1}>
                    {FLAGS[p.nat] ?? ''} {CLUBS[p.club].short}
                  </Text>
                </>
              ) : (
                <Text style={[styles.emptyText, isTarget && { color: C.limeDark }]}>{t.pos[slot.pos]}</Text>
              )}
            </Pressable>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  pitch: {
    flex: 1,
    backgroundColor: C.pitch,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.pitchLine,
    overflow: 'hidden',
  },
  halfLine: { position: 'absolute', left: 0, right: 0, top: '52%', height: 2, backgroundColor: C.pitchLine },
  circle: {
    position: 'absolute', alignSelf: 'center', top: '52%', marginTop: -40,
    width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: C.pitchLine,
  },
  box: {
    position: 'absolute', alignSelf: 'center', bottom: -2, width: '46%', height: '15%',
    borderWidth: 2, borderColor: C.pitchLine,
  },
  chip: {
    position: 'absolute', width: CHIP_W, height: CHIP_H, borderRadius: 10, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  empty: { backgroundColor: 'rgba(0,0,0,0.28)', borderColor: 'rgba(255,255,255,0.28)', borderStyle: 'dashed' },
  target: { backgroundColor: C.lime, borderColor: '#FFFFFF' },
  emptyText: { color: 'rgba(255,255,255,0.7)', fontWeight: '800', fontSize: 13 },
  chipName: { color: C.text, fontWeight: '800', fontSize: 10 },
  chipMeta: { color: C.dim, fontWeight: '700', fontSize: 10, marginTop: 1 },
});
