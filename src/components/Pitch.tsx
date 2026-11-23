import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { CLUBS } from '../data/players';
import { LINKS, Lineup, SLOTS } from '../game/engine';
import { Strings } from '../i18n';
import { C, F } from '../theme';
import { NATIVE_DRIVER, PopIn } from './ui';

interface Props {
  lineup: Lineup;
  links: number[];
  t: Strings;
  /** slot indexes that can take the selected card */
  targets?: number[];
  onSlotPress?: (slot: number) => void;
  /** stagger the chips popping in (result screen) */
  stagger?: boolean;
  maxHeight?: number;
}

const CHIP_W = 72;
const CHIP_H = 44;
const STRIPE = 31;

function linkColor(v: number): string {
  if (v >= 3) return C.accent;
  if (v >= 1) return C.text;
  if (v === 0) return C.n400;
  return C.n300;
}

export function Pitch({ lineup, links, t, targets = [], onSlotPress, stagger, maxHeight = 372 }: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const { w, h } = size;

  return (
    <View style={[styles.pitch, { maxHeight }]} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {h > 0 &&
        Array.from({ length: Math.ceil(h / (STRIPE * 2)) }, (_, i) => (
          <View key={i} style={[styles.stripe, { top: i * STRIPE * 2 + STRIPE }]} />
        ))}
      <View style={styles.halfLine} />
      <View style={styles.circle} />
      <View style={styles.spot} />
      <View style={[styles.box, { top: -2 }]} />
      <View style={[styles.sixYard, { top: -2 }]} />
      <View style={[styles.penSpot, { top: '11%' }]} />
      <View style={[styles.box, { bottom: -2 }]} />
      <View style={[styles.sixYard, { bottom: -2 }]} />
      <View style={[styles.penSpot, { bottom: '11%' }]} />

      {w > 0 &&
        LINKS.map(([a, b], i) => {
          const x1 = SLOTS[a].x * w, y1 = SLOTS[a].y * h;
          const x2 = SLOTS[b].x * w, y2 = SLOTS[b].y * h;
          const len = Math.hypot(x2 - x1, y2 - y1);
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const v = links[i];
          const th = v > 0 ? 4 : 2;
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: (x1 + x2) / 2 - len / 2,
                top: (y1 + y2) / 2 - th / 2,
                width: len,
                height: th,
                backgroundColor: linkColor(v),
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
              accessibilityRole="button"
              accessibilityLabel={p ? p.name : `${t.pos[slot.pos]} ${slot.id}`}
              style={[styles.slot, { left: slot.x * w - CHIP_W / 2, top: slot.y * h - CHIP_H / 2 }]}
            >
              {p ? (
                <PopIn trigger={p.id} delay={stagger ? i * 60 : 0} style={styles.chip}>
                  <View style={[styles.band, { backgroundColor: p.tier >= 4 ? C.accent : C.text }]} />
                  <Text style={styles.chipName} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={styles.chipMeta} numberOfLines={1}>
                    {CLUBS[p.club].short} · {p.nat}
                  </Text>
                </PopIn>
              ) : (
                <View style={styles.empty}>
                  <Dot target={isTarget} />
                  <Text style={[styles.emptyText, { color: isTarget ? C.accent700 : C.n700 }]}>{t.pos[slot.pos]}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
    </View>
  );
}

/** Empty position marker. Positions the selected card can go to grow, turn red and pulse. */
function Dot({ target }: { target: boolean }) {
  const pulse = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    if (!target) return;
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: NATIVE_DRIVER }));
    pulse.setValue(0);
    loop.start();
    return () => loop.stop();
  }, [target]);
  const size = target ? 22 : 14;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {target && (
        <Animated.View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size,
            backgroundColor: C.accent,
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.1] }) }],
          }}
        />
      )}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size,
          borderWidth: 2,
          backgroundColor: target ? C.accent : C.bg,
          borderColor: target ? C.accent : C.n600,
        }}
      />
    </View>
  );
}

const line = C.n400;

const styles = StyleSheet.create({
  pitch: { flex: 1, minHeight: 300, backgroundColor: C.surface, borderWidth: 2, borderColor: C.text, overflow: 'hidden' },
  stripe: { position: 'absolute', left: 0, right: 0, height: STRIPE, backgroundColor: C.n200 },
  halfLine: { position: 'absolute', left: 0, right: 0, top: '50%', height: 2, marginTop: -1, backgroundColor: line },
  circle: { position: 'absolute', left: '50%', top: '50%', width: 84, height: 84, marginLeft: -42, marginTop: -42, borderRadius: 42, borderWidth: 2, borderColor: line },
  spot: { position: 'absolute', left: '50%', top: '50%', width: 8, height: 8, marginLeft: -4, marginTop: -4, borderRadius: 4, backgroundColor: line },
  box: { position: 'absolute', left: '22%', right: '22%', height: '16%', borderWidth: 2, borderColor: line },
  sixYard: { position: 'absolute', left: '37%', right: '37%', height: '6%', borderWidth: 2, borderColor: line },
  penSpot: { position: 'absolute', left: '50%', width: 6, height: 6, marginLeft: -3, borderRadius: 3, backgroundColor: line },
  slot: { position: 'absolute', width: CHIP_W, height: CHIP_H },
  chip: {
    flex: 1,
    paddingTop: 5,
    paddingHorizontal: 5,
    paddingBottom: 3,
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: C.n100,
    borderWidth: 2,
    borderColor: C.text,
  },
  band: { position: 'absolute', left: 0, right: 0, top: 0, height: 4 },
  chipName: { fontFamily: F.heavy, fontSize: 10.5, lineHeight: 12, color: C.text },
  chipMeta: { fontFamily: F.semi, fontSize: 9.5, lineHeight: 11.5, color: C.text, opacity: 0.8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  emptyText: { fontFamily: F.heavy, fontSize: 10, lineHeight: 11, letterSpacing: 0.4 },
});
