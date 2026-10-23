import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { typeScale, type Palette, type TypeVariant } from '@/theme/tokens';

type Tone = 'ink' | 'muted' | 'accent' | 'good' | 'warn' | 'critical' | 'onAccent';

export interface TextProps extends RNTextProps {
  variant?: TypeVariant;
  tone?: Tone;
}

export function Text({ variant = 'body', tone, style, ...rest }: TextProps) {
  const { colors } = useTheme();
  const color = colors[(tone ?? (variant === 'label' || variant === 'caption' ? 'muted' : 'ink')) as keyof Palette];
  return <RNText {...rest} style={[typeScale[variant], { color }, style]} />;
}
