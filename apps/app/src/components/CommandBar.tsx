import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';
import { TABS } from './AppNavigation';
import { Icon, Text } from './ui';

const HREFS = { index: '/', vega: '/vega', capturar: '/capturar', modulos: '/modulos', perfil: '/perfil' } as const;

/**
 * Ctrl/Cmd+K on the web. For now it jumps between screens; from stage 3 on,
 * anything that is not a screen name goes to Vega as a request.
 */
export function CommandBar() {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setQuery('');
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const matches = TABS.filter((t) => t.label.toLowerCase().includes(query.trim().toLowerCase()));
  const pick = (name: keyof typeof HREFS) => {
    setOpen(false);
    router.navigate(HREFS[name]);
  };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <Pressable accessibilityLabel="Fechar" style={[styles.scrim, { backgroundColor: colors.scrim }]} onPress={() => setOpen(false)}>
        <Pressable style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.line }]} onPress={() => {}}>
          <View style={[styles.inputRow, { borderBottomColor: colors.line }]}>
            <Icon name="search" size={18} color={colors.muted} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar ou pedir à Vega"
              placeholderTextColor={colors.muted}
              accessibilityLabel="Buscar ou pedir à Vega"
              onSubmitEditing={() => matches[0] && pick(matches[0].name as keyof typeof HREFS)}
              style={[styles.input, { color: colors.ink }]}
            />
          </View>
          {matches.map((t) => (
            <Pressable key={t.name} onPress={() => pick(t.name as keyof typeof HREFS)} style={styles.item}>
              <Icon name={t.icon} size={18} color={colors.muted} />
              <Text>{t.label}</Text>
            </Pressable>
          ))}
          {matches.length === 0 && (
            <Text tone="muted" style={styles.item}>
              Pedidos para a Vega chegam na etapa 3.
            </Text>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, alignItems: 'center', paddingTop: 120, paddingHorizontal: space.lg },
  panel: { width: '100%', maxWidth: 560, borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, borderBottomWidth: 1 },
  input: { flex: 1, minHeight: 52, fontFamily: fonts.sans, fontSize: 16, outlineWidth: 0 },
  item: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md, minHeight: 44 },
});
