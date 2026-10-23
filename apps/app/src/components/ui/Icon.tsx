import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'vega'
  | 'plus'
  | 'grid'
  | 'user'
  | 'mic'
  | 'send'
  | 'camera'
  | 'back'
  | 'search'
  | 'check'
  | 'logout';

interface IconProps {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
}

/** Stroke icons drawn on a 24px grid, matching the prototypes. */
export function Icon({ name, size = 22, color, strokeWidth = 1.7 }: IconProps) {
  const stroke = { stroke: color, strokeWidth, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      {name === 'home' && <Path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" {...stroke} />}
      {name === 'vega' && <Path d="M12 3c.6 4.6 3.4 7.4 9 9-5.6 1.6-8.4 4.4-9 9-.6-4.6-3.4-7.4-9-9 5.6-1.6 8.4-4.4 9-9z" {...stroke} />}
      {name === 'plus' && <Path d="M12 5v14M5 12h14" {...stroke} />}
      {name === 'grid' && (
        <>
          <Rect x="4" y="4" width="7" height="7" rx="1.5" {...stroke} />
          <Rect x="13" y="4" width="7" height="7" rx="1.5" {...stroke} />
          <Rect x="4" y="13" width="7" height="7" rx="1.5" {...stroke} />
          <Rect x="13" y="13" width="7" height="7" rx="1.5" {...stroke} />
        </>
      )}
      {name === 'user' && (
        <>
          <Circle cx="12" cy="8" r="4" {...stroke} />
          <Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" {...stroke} />
        </>
      )}
      {name === 'mic' && (
        <>
          <Rect x="9" y="3" width="6" height="11" rx="3" {...stroke} />
          <Path d="M5 11a7 7 0 0 0 14 0M12 18v3" {...stroke} />
        </>
      )}
      {name === 'send' && <Path d="M12 19V5M5 12l7-7 7 7" {...stroke} />}
      {name === 'camera' && (
        <>
          <Path d="M4 8h3l2-3h6l2 3h3v11H4z" {...stroke} />
          <Circle cx="12" cy="13" r="3.5" {...stroke} />
        </>
      )}
      {name === 'back' && <Path d="M15 5l-7 7 7 7" {...stroke} />}
      {name === 'search' && (
        <>
          <Circle cx="11" cy="11" r="6.5" {...stroke} />
          <Path d="M16 16l4.5 4.5" {...stroke} />
        </>
      )}
      {name === 'check' && <Path d="M5 12.5l4.5 4.5L19 7" {...stroke} />}
      {name === 'logout' && <Path d="M14 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5M10 8l-4 4 4 4M6 12h10" {...stroke} />}
    </Svg>
  );
}
