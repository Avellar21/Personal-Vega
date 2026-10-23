import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';
import { Icon, Text, type IconName } from './ui';

export const TABS: readonly { name: string; label: string; icon: IconName }[] = [
  { name: 'index', label: 'Hoje', icon: 'home' },
  { name: 'vega', label: 'Vega', icon: 'vega' },
  { name: 'capturar', label: 'Capturar', icon: 'plus' },
  { name: 'modulos', label: 'Módulos', icon: 'grid' },
  { name: 'perfil', label: 'Perfil', icon: 'user' },
];

// Shown in the sidebar on wide screens; each becomes a route as its stage lands.
const UPCOMING_MODULES = ['Agenda', 'Hábitos e Tarefas', 'Diário', 'Finanças', 'Empresa', 'Saúde e Dieta', 'Musculação e Esportes', 'Estudos', 'Hobbies'];

export function AppNavigation({ wide, ...props }: BottomTabBarProps & { wide: boolean }) {
  const { state, navigateToTab } = props;
  const active = state.routes[state.index]?.name;
  const go = (name: string) => {
    const route = state.routes.find((r) => r.name === name);
    if (route) navigateToTab(route.key);
  };
  return wide ? <Sidebar active={active} go={go} /> : <BottomBar active={active} go={go} />;
}

interface NavProps {
  active: string | undefined;
  go: (name: string) => void;
}

function BottomBar({ active, go }: NavProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="tablist"
      style={[styles.bottom, { backgroundColor: colors.surface, borderTopColor: colors.line, paddingBottom: insets.bottom }]}
    >
      {TABS.map((tab) => {
        const selected = tab.name === active;
        if (tab.name === 'capturar') {
          return (
            <Pressable
              key={tab.name}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              onPress={() => go(tab.name)}
              style={[styles.capture, { backgroundColor: colors.accent }]}
            >
              <Icon name="plus" size={24} color={colors.onAccent} strokeWidth={2} />
            </Pressable>
          );
        }
        const color = selected ? colors.ink : colors.muted;
        return (
          <Pressable
            key={tab.name}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={tab.label}
            onPress={() => go(tab.name)}
            style={styles.tab}
          >
            <Icon name={tab.icon} color={color} />
            <Text variant="caption" style={{ color, fontSize: 11, fontFamily: selected ? 'Inter_600SemiBold' : 'Inter_400Regular' }}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Sidebar({ active, go }: NavProps) {
  const { colors } = useTheme();
  const item = (name: string, label: string) => {
    const selected = name === active;
    return (
      <Pressable
        key={name}
        accessibilityRole="tab"
        accessibilityState={{ selected }}
        onPress={() => go(name)}
        style={[styles.sideItem, selected && { backgroundColor: colors.sunken }]}
      >
        <Text variant={selected ? 'bodyStrong' : 'body'} style={{ fontSize: 14 }}>
          {label}
        </Text>
      </Pressable>
    );
  };
  return (
    <View accessibilityRole="tablist" style={[styles.side, { borderRightColor: colors.line, backgroundColor: colors.bg }]}>
      <View style={styles.brand}>
        <Icon name="vega" size={18} color={colors.accent} />
        <Text variant="title" style={{ fontSize: 20 }}>
          Vega
        </Text>
      </View>
      {TABS.filter((t) => t.name !== 'modulos').map((t) => item(t.name, t.label))}
      <Text variant="label" style={styles.sideLabel}>
        Módulos
      </Text>
      {UPCOMING_MODULES.map((m) => (
        <View key={m} style={styles.sideItem}>
          <Text variant="body" tone="muted" style={{ fontSize: 14 }}>
            {m}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    minHeight: 72,
  },
  tab: { alignItems: 'center', gap: 3, minWidth: 56, minHeight: 48, justifyContent: 'center' },
  capture: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  side: { width: 240, borderRightWidth: 1, paddingHorizontal: space.md + 2, paddingVertical: space.xl, gap: 2 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.sm + 2, paddingBottom: space.xl },
  sideItem: { paddingHorizontal: space.sm + 2, paddingVertical: 9, borderRadius: radius.sm, minHeight: 40, justifyContent: 'center' },
  sideLabel: { paddingHorizontal: space.sm + 2, paddingTop: space.lg, paddingBottom: space.xs + 2 },
});
