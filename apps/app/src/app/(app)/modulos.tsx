import { StyleSheet, View } from 'react-native';
import { Card, Screen, Text } from '@/components/ui';
import { space } from '@/theme/tokens';

const MODULES: readonly { name: string; stage: number }[] = [
  { name: 'Agenda', stage: 2 },
  { name: 'Hábitos e Tarefas', stage: 2 },
  { name: 'Diário', stage: 2 },
  { name: 'Musculação e Esportes', stage: 5 },
  { name: 'Saúde e Dieta', stage: 5 },
  { name: 'Finanças', stage: 6 },
  { name: 'Empresa', stage: 6 },
  { name: 'Estudos', stage: 7 },
  { name: 'Hobbies', stage: 7 },
];

export default function Modulos() {
  return (
    <Screen>
      <Text variant="display" accessibilityRole="header">
        Módulos
      </Text>
      <View style={styles.grid}>
        {MODULES.map((m) => (
          <Card key={m.name} style={styles.card}>
            <Text variant="heading">{m.name}</Text>
            <Text variant="caption">Chega na etapa {m.stage}</Text>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  card: { flexGrow: 1, flexBasis: 220, gap: space.xs },
});
