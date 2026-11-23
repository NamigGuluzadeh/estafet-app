import type { ImageSourcePropType } from 'react-native';
import type { Lang } from './i18n';

// Home screen media. Placeholders for now: swap these in one place when real assets exist.

/** Hero photo at the top of Home (stadium or the Estafet host). Shown in grayscale. null = grey placeholder. */
export const HERO_IMAGE: ImageSourcePropType | null = null;

export interface LatestVideo {
  title: Record<Lang, string>;
  /** e.g. "2 days ago" */
  meta: Record<Lang, string>;
  duration: string;
  /** opened by the play button */
  url: string;
  thumbnail: ImageSourcePropType | null;
}

// TODO: placeholder copy from the design mock. Replace with the real latest video.
// The URL is a YouTube search until the channel link is filled in.
export const LATEST_VIDEO: LatestVideo = {
  title: { az: 'Draft #2: 300 xal mümkündürmü?', en: 'Draft #2: is 300 points possible?' },
  meta: { az: '2 gün əvvəl', en: '2 days ago' },
  duration: '14:32',
  url: 'https://www.youtube.com/results?search_query=Estafet',
  thumbnail: null,
};
