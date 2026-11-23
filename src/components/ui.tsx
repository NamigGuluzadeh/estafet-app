import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  Modal,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import type { HostInstance } from 'react-native';
import { LANG_NAMES, Lang } from '../i18n';
import { C, F, SHADOW_MD } from '../theme';
import { Icon, IconName } from './Icon';

export const NATIVE_DRIVER = Platform.OS !== 'web';

// ---------- buttons ----------

type BtnVariant = 'primary' | 'secondary' | 'ghost';

interface BtnProps {
  label: string;
  onPress?: () => void;
  variant?: BtnVariant;
  icon?: IconName;
  disabled?: boolean;
  minHeight?: number;
  fontSize?: number;
  style?: StyleProp<ViewStyle>;
}

export function Btn({ label, onPress, variant = 'primary', icon, disabled, minHeight = 44, fontSize = 14, style }: BtnProps) {
  const fg = variant === 'primary' ? C.bg : variant === 'ghost' ? C.accent : C.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.btn,
        { minHeight },
        variant === 'primary' && { backgroundColor: pressed ? C.accent700 : C.accent },
        variant === 'secondary' && { borderColor: C.divider, backgroundColor: pressed ? 'rgba(32,30,29,0.14)' : 'transparent' },
        variant === 'ghost' && { paddingHorizontal: 4, backgroundColor: pressed ? 'rgba(236,48,19,0.18)' : 'transparent' },
        disabled && { opacity: 0.45 },
        style,
      ]}
    >
      {icon && <Icon name={icon} size={18} color={fg} />}
      <Text style={[styles.btnText, { color: fg, fontSize }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

// ---------- headers ----------

export function TopBar({ backLabel, onBack, right, title }: { backLabel: string; onBack: () => void; right?: ReactNode; title?: string }) {
  return (
    <View style={styles.topBar}>
      <Pressable onPress={onBack} accessibilityRole="button" style={styles.back} hitSlop={6}>
        {({ pressed }) => (
          <>
            <Icon name="chevronLeft" size={20} color={pressed ? C.accent : C.text} />
            <Text style={[styles.backText, pressed && { color: C.accent }]}>{backLabel}</Text>
          </>
        )}
      </Pressable>
      {title ? (
        <Text style={styles.topTitle} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <View style={{ flex: 1 }} />
      )}
      {right}
    </View>
  );
}

/** Red icon tile, the mode name and a big red numeral (01–05). */
export function ModeHeader({ icon, title, n }: { icon: IconName; title: string; n: string }) {
  return (
    <View style={styles.modeHeader}>
      <View style={styles.modeIcon}>
        <Icon name={icon} size={20} color={C.bg} />
      </View>
      <Text style={styles.modeTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.modeNum}>{n}</Text>
    </View>
  );
}

export function Kicker({ children, style }: { children: ReactNode; style?: StyleProp<any> }) {
  return <Text style={[styles.kicker, style]}>{children}</Text>;
}

// ---------- motion ----------

/** Rubber-stamp verdict: drops in large and rotated, lands at -4°. */
export function Stamp({ text, color = C.accent }: { text: string; color?: string }) {
  const v = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    v.setValue(0);
    Animated.timing(v, { toValue: 1, duration: 500, easing: Easing.bezier(0.2, 0.8, 0.3, 1.25), useNativeDriver: NATIVE_DRIVER }).start();
  }, [text]);
  return (
    <View style={{ flexDirection: 'row' }}>
      <Animated.View
        style={[
          styles.stamp,
          { borderColor: color },
          {
            opacity: v.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 1] }),
            transform: [
              { scale: v.interpolate({ inputRange: [0, 0.6, 1], outputRange: [2.6, 0.94, 1] }) },
              { rotate: v.interpolate({ inputRange: [0, 0.6, 1], outputRange: ['-14deg', '-3deg', '-4deg'] }) },
            ],
          },
        ]}
      >
        <Text style={[styles.stampText, { color }]}>{text.toUpperCase()}</Text>
      </Animated.View>
    </View>
  );
}

/** Scale pop used when something is claimed or placed. Re-runs when `trigger` changes. */
export function PopIn({ children, trigger, delay = 0, style }: { children: ReactNode; trigger?: unknown; delay?: number; style?: StyleProp<ViewStyle> }) {
  const v = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    v.setValue(0);
    Animated.timing(v, { toValue: 1, duration: 350, delay, easing: Easing.out(Easing.quad), useNativeDriver: NATIVE_DRIVER }).start();
  }, [trigger]);
  return (
    <Animated.View
      style={[style, { opacity: v.interpolate({ inputRange: [0, 0.01, 1], outputRange: [0, 1, 1] }), transform: [{ scale: v.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.55, 1.08, 1] }) }] }]}
    >
      {children}
    </Animated.View>
  );
}

/** Card flip-in around the vertical axis. Re-runs when `trigger` changes. */
export function FlipIn({ children, trigger, delay = 0, style }: { children: ReactNode; trigger?: unknown; delay?: number; style?: StyleProp<ViewStyle> }) {
  const v = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    v.setValue(0);
    Animated.timing(v, { toValue: 1, duration: 380, delay, easing: Easing.out(Easing.quad), useNativeDriver: NATIVE_DRIVER }).start();
  }, [trigger]);
  return (
    <Animated.View style={[style, { transform: [{ perspective: 500 }, { rotateY: v.interpolate({ inputRange: [0, 1], outputRange: ['80deg', '0deg'] }) }] }]}>
      {children}
    </Animated.View>
  );
}

const CONFETTI = Array.from({ length: 36 }, (_, i) => ({
  left: `${Math.random() * 100}%` as const,
  w: 6 + Math.random() * 8,
  h: 8 + Math.random() * 14,
  color: i % 3 === 2 ? C.text : C.accent,
  dur: 1400 + Math.random() * 1200,
  delay: Math.random() * 600,
  spin: 360 + Math.random() * 400,
}));

/** Red and black confetti falling over the screen while `active`. */
export function Confetti({ active }: { active: boolean }) {
  const [pieces] = useState(() => CONFETTI.map((p) => ({ ...p, v: new Animated.Value(0) })));
  useEffect(() => {
    if (!active) return;
    pieces.forEach((p) => p.v.setValue(0));
    const anim = Animated.parallel(
      pieces.map((p) => Animated.timing(p.v, { toValue: 1, duration: p.dur, delay: p.delay, easing: Easing.in(Easing.quad), useNativeDriver: NATIVE_DRIVER })),
    );
    anim.start();
    return () => anim.stop();
  }, [active]);
  if (!active) return null;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden', zIndex: 25 }]}>
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            top: -24,
            left: p.left,
            width: p.w,
            height: p.h,
            backgroundColor: p.color,
            opacity: p.v.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] }),
            transform: [
              { translateY: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, 900] }) },
              { rotate: p.v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin}deg`] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

/** Dark bar at the bottom of the screen. Clears itself after 1.8s. */
export function useToast(): [ReactNode, (msg: string) => void] {
  const [msg, setMsg] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  function show(m: string) {
    if (timer.current) clearTimeout(timer.current);
    setMsg(m);
    timer.current = setTimeout(() => setMsg(''), 1800);
  }
  const node = msg ? (
    <View pointerEvents="none" style={styles.toast}>
      <Text style={styles.toastText}>{msg}</Text>
    </View>
  ) : null;
  return [node, show];
}

// ---------- language dropdown ----------

interface LangProps {
  lang: Lang;
  onChange: (l: Lang) => void;
  /** compact: "AZ ⌄" header button. full: full-width field (Settings). */
  variant?: 'compact' | 'full';
}

export function LangDropdown({ lang, onChange, variant = 'compact' }: LangProps) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const ref = useRef<HostInstance>(null);

  function toggle() {
    if (open) return setOpen(false);
    ref.current?.measureInWindow((x: number, y: number, w: number, h: number) => {
      setAnchor({ x, y, w, h });
      setOpen(true);
    });
  }

  const full = variant === 'full';
  const menuStyle: ViewStyle = full
    ? { top: anchor.y + anchor.h + 4, left: anchor.x, width: anchor.w }
    : { top: anchor.y + anchor.h + 4, left: Math.max(8, anchor.x + anchor.w - 210), width: 210 };

  return (
    <>
      <Pressable
        ref={ref}
        onPress={toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={LANG_NAMES[lang]}
        style={({ pressed }) => [full ? styles.langFull : styles.langBtn, pressed && { backgroundColor: 'rgba(32,30,29,0.1)' }]}
      >
        {full && <Text style={styles.langFullLabel}>{LANG_NAMES[lang]}</Text>}
        <Text style={full ? styles.langCodeDim : styles.langCode}>{lang.toUpperCase()}</Text>
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <Icon name="chevronDown" size={14} color={C.text} strokeWidth={2.5} />
        </View>
      </Pressable>
      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} accessibilityLabel="Close" />
        <View style={[styles.menu, menuStyle]} accessibilityRole="menu">
          {(['az', 'en'] as Lang[]).map((l) => (
            <Pressable
              key={l}
              onPress={() => {
                onChange(l);
                setOpen(false);
              }}
              accessibilityRole="menuitem"
              accessibilityState={{ selected: l === lang }}
              style={({ pressed }) => [styles.menuRow, { backgroundColor: pressed ? C.accent100 : l === lang ? C.n200 : 'transparent' }]}
            >
              <Text style={styles.menuCode}>{l.toUpperCase()}</Text>
              <Text style={styles.menuLabel}>{LANG_NAMES[l]}</Text>
              <View style={{ width: 18 }}>{l === lang && <Icon name="check" size={18} color={C.accent} strokeWidth={2.5} />}</View>
            </Pressable>
          ))}
        </View>
      </Modal>
    </>
  );
}

// ---------- media ----------

/** Photo block that falls back to a grey placeholder. Photos render in grayscale where the platform supports it. */
export function MediaBox({ source, height, children, style }: { source: ImageSourcePropType | null; height: number; children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ height, backgroundColor: C.surface, overflow: 'hidden' }, style]}>
      {source ? (
        <Image source={source} resizeMode="cover" style={[StyleSheet.absoluteFill, { width: '100%', height: '100%', filter: 'grayscale(1) contrast(1.08)' }]} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
          <Icon name="image" size={32} color={C.n400} />
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  btnText: { fontFamily: F.semi, lineHeight: 18 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 4, paddingRight: 16, minHeight: 52, borderBottomWidth: 2, borderBottomColor: C.divider },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 44, paddingHorizontal: 8 },
  topTitle: { flex: 1, fontFamily: F.heavy, fontSize: 16, color: C.text },
  backText: { fontFamily: F.semi, fontSize: 14, color: C.text },
  modeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: C.divider },
  modeIcon: { width: 44, height: 44, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  modeTitle: { flex: 1, fontFamily: F.heavy, fontSize: 24, lineHeight: 26, letterSpacing: -0.48, color: C.text },
  modeNum: { fontFamily: F.heavy, fontSize: 56, lineHeight: 50, letterSpacing: -2.8, color: C.accent },
  kicker: { fontFamily: F.heavy, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: C.n700 },
  stamp: { borderWidth: 3, paddingVertical: 6, paddingHorizontal: 12, transformOrigin: 'left center' },
  stampText: { fontFamily: F.heavy, fontSize: 20, lineHeight: 22, letterSpacing: 0.8 },
  toast: { position: 'absolute', left: 16, right: 16, bottom: 16, zIndex: 30, backgroundColor: C.text, paddingVertical: 12, paddingHorizontal: 14, boxShadow: SHADOW_MD },
  toastText: { fontFamily: F.semi, fontSize: 14, color: C.bg },
  langBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: 10, borderWidth: 2, borderColor: C.divider },
  langCode: { fontFamily: F.heavy, fontSize: 13, color: C.text },
  langFull: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingHorizontal: 14, backgroundColor: C.surface, borderWidth: 2, borderColor: C.text },
  langFullLabel: { flex: 1, fontFamily: F.semi, fontSize: 16, color: C.text },
  langCodeDim: { fontFamily: F.heavy, fontSize: 12, color: C.n700 },
  menu: { position: 'absolute', backgroundColor: C.bg, borderWidth: 2, borderColor: C.text, boxShadow: SHADOW_MD },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: C.divider },
  menuCode: { width: 28, fontFamily: F.heavy, fontSize: 12, color: C.n700 },
  menuLabel: { flex: 1, fontFamily: F.semi, fontSize: 15, color: C.text },
});
