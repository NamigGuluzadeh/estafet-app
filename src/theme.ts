export const C = {
  bg: '#0B1626',
  panel: '#13233A',
  panelHi: '#1B3050',
  line: '#27405F',
  text: '#F2F5F9',
  dim: '#8FA3BC',
  lime: '#C8D645',
  limeDark: '#1C2408',
  pitch: '#14573A',
  pitchLine: 'rgba(255,255,255,0.16)',
  good: '#C8D645',
  mid: '#F2A93B',
  bad: 'rgba(255,255,255,0.22)',
};

export const TIER_COLOR: Record<number, string> = {
  1: '#B98356',
  2: '#B4BDCA',
  3: '#E8BC47',
  4: '#57C7F2',
  5: '#C8D645',
};

export function linkColor(v: number): string {
  if (v >= 3) return C.good;
  if (v >= 1) return C.mid;
  return C.bad;
}
