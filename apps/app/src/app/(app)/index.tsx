import { coreServices } from '@vega/core';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Card, EmptyState, Icon, ListRow, Screen, Section, Text } from '@/components/ui';
import { useServiceQuery } from '@/lib/services';
import { useTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';

function greeting(hour: number) {
  if (hour < 5) return 'Boa noite';
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function Hoje() {
  const { colors } = useTheme();
  const now = new Date();
  const longDate = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const date = longDate.charAt(0).toUpperCase() + longDate.slice(1);
  const activity = useServiceQuery(coreServices.recentActivity, { limit: 5 });

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="caption" style={styles.date}>
          {date}
        </Text>
        <Text variant="display" accessibilityRole="header">
          {greeting(now.getHours())}, Gabriel.
        </Text>
      </View>

      <Card>
        <View style={styles.vegaLabel}>
          <Icon name="vega" size={16} color={colors.accent} />
          <Text variant="bodyStrong" tone="accent" style={{ fontSize: 13 }}>
            Vega
          </Text>
        </View>
        <Text>Ainda estou chegando. A partir da etapa 3, este espaço traz o resumo do seu dia e o que vale fazer agora.</Text>
        <View style={styles.actions}>
          <Button label="Capturar algo" onPress={() => router.navigate('/capturar')} />
        </View>
      </Card>

      <Section title="Agenda">
        <EmptyState text="Seus compromissos aparecem aqui a partir da etapa 2." />
      </Section>

      <Section title="Tarefas">
        <EmptyState text="Tarefas e hábitos do dia aparecem aqui a partir da etapa 2." />
      </Section>

      <Section title="Atividade recente">
        {activity.loading ? (
          <Text tone="muted">Carregando…</Text>
        ) : activity.error ? (
          <Text tone="critical">Não consegui ler a atividade: {activity.error.message}</Text>
        ) : activity.data?.length ? (
          <View>
            {activity.data.map((entry, i) => (
              <ListRow
                key={entry.id}
                title={entry.summary}
                detail={entry.actor === 'vega' ? 'Vega' : new Date(entry.occurred_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                last={i === activity.data!.length - 1}
              />
            ))}
          </View>
        ) : (
          <EmptyState text="Tudo que você ou a Vega fizerem no app fica registrado aqui." />
        )}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.xs },
  date: { fontSize: 13 },
  vegaLabel: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  actions: { flexDirection: 'row', gap: space.sm },
});
