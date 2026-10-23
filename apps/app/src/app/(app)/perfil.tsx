import { coreServices, type Area } from '@vega/core';
import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { Button, Screen, Section, Text } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { run, useServiceQuery } from '@/lib/services';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';

export default function Perfil() {
  const { colors } = useTheme();
  const { session } = useAuth();
  const areas = useServiceQuery(coreServices.listAreas, {});
  const [saving, setSaving] = useState<string | null>(null);

  async function toggle(area: Area, enabled: boolean) {
    setSaving(area.id);
    try {
      await run(coreServices.updateArea, { id: area.id, gamification_enabled: enabled });
      areas.reload();
    } finally {
      setSaving(null);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="display" accessibilityRole="header">
          Perfil
        </Text>
        <Text variant="caption">{session?.user.email}</Text>
      </View>

      <Section title="Áreas da vida" aside="Gamificação">
        {areas.error ? (
          <Text tone="critical">Não consegui ler as áreas: {areas.error.message}</Text>
        ) : (
          areas.data?.map((area, i) => (
            <View
              key={area.id}
              style={[styles.area, i < areas.data!.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.line }]}
            >
              <View style={styles.areaText}>
                <Text variant="bodyStrong">{area.name}</Text>
                <Text variant="caption">{area.description}</Text>
              </View>
              <Switch
                accessibilityLabel={`Gamificação em ${area.name}`}
                value={area.gamification_enabled}
                disabled={saving === area.id}
                onValueChange={(v) => toggle(area, v)}
                trackColor={{ true: colors.accent, false: colors.line }}
                thumbColor={colors.surface}
                {...{ activeThumbColor: colors.surface }}
              />
            </View>
          ))
        )}
      </Section>

      <Button variant="secondary" icon="logout" label="Sair" onPress={() => supabase?.auth.signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.xs },
  area: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  areaText: { flex: 1, gap: 2 },
});
