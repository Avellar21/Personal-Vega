import { forwardRef, useState, type ComponentRef } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';
import { Text } from './Text';

export interface TextFieldProps extends TextInputProps {
  label: string;
  hint?: string;
  error?: string | null;
}

export const TextField = forwardRef<ComponentRef<typeof TextInput>, TextFieldProps>(function TextField({ label, hint, error, style, onFocus, onBlur, ...rest }, ref) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      <Text variant="caption">{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.critical : focused ? colors.accent : colors.line,
            color: colors.ink,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text variant="caption" tone="critical">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption">{hint}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: space.xs + 2 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: space.md + 2,
    fontFamily: fonts.sans,
    fontSize: 16,
    outlineWidth: 0,
  },
});
