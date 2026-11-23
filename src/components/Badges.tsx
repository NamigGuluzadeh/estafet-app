import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { NATIONS } from '../data/db';
import { C, F } from '../theme';

/** Nation flag in a 34×22 outlined box, desaturated where the platform supports CSS filters (web, Android). */
export function Flag({ code }: { code: string }) {
  const emoji = NATIONS[code]?.flag;
  return (
    <View style={styles.flag}>
      {emoji ? <Text style={styles.flagEmoji}>{emoji}</Text> : <Text style={styles.flagCode}>{code}</Text>}
    </View>
  );
}

/** Up to three letters for a club: initials of a multi-word name, otherwise its first three letters. */
export function clubInitials(name: string): string {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, ' ').split(/\s+/).filter((w) => w.length > 0 && !/^(fc|cf|ac|sc|afc|club|de|del|la)$/i.test(w));
  if (words.length === 0) return name.slice(0, 3).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.slice(0, 3).map((w) => w[0]).join('').toUpperCase();
}

/** Ink shield with club initials, standing in for real crests. */
export function Crest({ name }: { name: string }) {
  return (
    <View style={styles.crest}>
      <Svg width={28} height={32} viewBox="0 0 28 32" style={StyleSheet.absoluteFill}>
        <Path d="M0 0H28V19.84L14 32L0 19.84Z" fill={C.text} />
      </Svg>
      <Text style={styles.crestText}>{clubInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flag: {
    width: 34,
    height: 22,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: C.text,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bg,
    filter: 'grayscale(1) contrast(1.08)',
  },
  flagEmoji: { fontSize: 26, lineHeight: 30 },
  flagCode: { fontFamily: F.heavy, fontSize: 9, color: C.text },
  crest: { width: 28, height: 32, alignItems: 'center', paddingTop: 7 },
  crestText: { fontFamily: F.heavy, fontSize: 9, letterSpacing: 0.2, color: C.bg },
});
