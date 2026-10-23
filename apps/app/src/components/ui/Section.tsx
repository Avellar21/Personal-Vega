import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';
import { Text } from './Text';

export function Section({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text variant="label" accessibilityRole="header">
          {title}
        </Text>
        {typeof aside === 'string' ? <Text variant="caption">{aside}</Text> : aside}
      </View>
      {children}
    </View>
  );
}

export function ListRow({ title, detail, last }: { title: string; detail?: string; last?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: colors.line }]}>
      <Text style={styles.rowTitle}>{title}</Text>
      {detail ? <Text variant="caption">{detail}</Text> : null}
    </View>
  );
}

export function EmptyState({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.empty, { borderColor: colors.line }]}>
      <Text variant="body" tone="muted">
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 44, paddingVertical: space.sm },
  rowTitle: { flex: 1 },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 14, padding: space.lg },
});
