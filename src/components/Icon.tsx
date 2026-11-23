import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';

// Lucide icon paths (ISC licence), drawn at 24×24.
export type IconName =
  | 'grid'
  | 'list'
  | 'target'
  | 'updown'
  | 'shirt'
  | 'repeat'
  | 'settings'
  | 'chevronDown'
  | 'chevronLeft'
  | 'check'
  | 'play'
  | 'youtube'
  | 'search'
  | 'share'
  | 'close'
  | 'image';

interface Props {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 20, color, strokeWidth = 2 }: Props) {
  const s = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  let body;
  switch (name) {
    case 'grid':
      body = (
        <>
          <Rect x={3} y={3} width={18} height={18} {...s} />
          <Path d="M3 9h18M3 15h18M9 3v18M15 3v18" {...s} />
        </>
      );
      break;
    case 'list':
      body = <Path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" {...s} />;
      break;
    case 'target':
      body = (
        <>
          <Circle cx={12} cy={12} r={10} {...s} />
          <Circle cx={12} cy={12} r={6} {...s} />
          <Circle cx={12} cy={12} r={2} {...s} />
        </>
      );
      break;
    case 'updown':
      body = <Path d="m21 16-4 4-4-4M17 20V4M3 8l4-4 4 4M7 4v16" {...s} />;
      break;
    case 'shirt':
      body = (
        <Path
          d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"
          {...s}
        />
      );
      break;
    case 'repeat':
      body = <Path d="m17 2 4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3" {...s} />;
      break;
    case 'settings':
      body = (
        <>
          <Path
            d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
            {...s}
          />
          <Circle cx={12} cy={12} r={3} {...s} />
        </>
      );
      break;
    case 'chevronDown':
      body = <Path d="m6 9 6 6 6-6" {...s} />;
      break;
    case 'chevronLeft':
      body = <Path d="m15 18-6-6 6-6" {...s} />;
      break;
    case 'check':
      body = <Path d="M20 6 9 17l-5-5" {...s} />;
      break;
    case 'play':
      body = <Polygon points="6 3 20 12 6 21 6 3" fill={color} />;
      break;
    case 'youtube':
      body = (
        <>
          <Path
            d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"
            {...s}
          />
          <Path d="m10 15 5-3-5-3z" {...s} />
        </>
      );
      break;
    case 'search':
      body = (
        <>
          <Circle cx={11} cy={11} r={8} {...s} />
          <Path d="m21 21-4.3-4.3" {...s} />
        </>
      );
      break;
    case 'share':
      body = <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" {...s} />;
      break;
    case 'close':
      body = <Path d="M18 6 6 18M6 6l12 12" {...s} />;
      break;
    case 'image':
      body = (
        <>
          <Rect x={3} y={3} width={18} height={18} {...s} />
          <Circle cx={9} cy={9} r={2} {...s} />
          <Path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21" {...s} />
        </>
      );
      break;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {body}
    </Svg>
  );
}
