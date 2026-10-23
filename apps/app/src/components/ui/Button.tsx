import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
  block?: boolean;
}

export function Button({ label, variant = 'primary', icon, loading, block, disabled, style, ...rest }: ButtonProps) {
  const { colors } = useTheme();
  const look = {
    primary: { bg: colors.ink, fg: colors.bg, border: colors.ink },
    accent: { bg: colors.accent, fg: colors.onAccent, border: colors.accent },
    secondary: { bg: 'transparent', fg: colors.ink, border: colors.line },
    ghost: { bg: 'transparent', fg: colors.accent, border: 'transparent' },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      disabled={disabled || loading}
      style={(state) => [
        styles.base,
        { backgroundColor: look.bg, borderColor: look.border, opacity: disabled ? 0.45 : state.pressed ? 0.8 : 1 },
        block && styles.block,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={look.fg} />
      ) : (
        <View style={styles.row}>
          {icon && <Icon name={icon} size={18} color={look.fg} />}
          <Text variant="bodyStrong" style={{ color: look.fg, fontSize: 14 }}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  block: { alignSelf: 'stretch', minHeight: 50, borderRadius: radius.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
