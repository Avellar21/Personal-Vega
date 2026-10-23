import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Screen, Text, TextField } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';

const KINDS = ['Gasto', 'Tarefa', 'Refeição', 'Treino', 'Hábito', 'Nota'];

export default function Capturar() {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  return (
    <Screen>
      <Text variant="display" accessibilityRole="header">
        Capturar
      </Text>
      <TextField
        label="Escreva do seu jeito, a Vega organiza"
        value={text}
        onChangeText={setText}
        placeholder="45 almoço crédito"
        autoFocus
      />
      <View style={styles.grid}>
        {KINDS.map((k) => (
          <View key={k} style={[styles.kind, { borderColor: colors.line, backgroundColor: colors.surface }]}>
            <Text tone="muted">{k}</Text>
          </View>
        ))}
      </View>
      <Card>
        <Text variant="caption">
          A captura passa a salvar de verdade com os módulos: tarefas e hábitos na etapa 2, entendimento em linguagem natural na
          etapa 3, gastos na etapa 6.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  kind: {
    flexGrow: 1,
    flexBasis: '30%',
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
