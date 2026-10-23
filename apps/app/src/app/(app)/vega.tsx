import { StyleSheet, View } from 'react-native';
import { Card, Icon, Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';

export default function Vega() {
  const { colors } = useTheme();
  return (
    <Screen>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}>
          <Icon name="vega" size={20} color={colors.accent} />
        </View>
        <View>
          <Text variant="title">Vega</Text>
          <Text variant="caption">Vê e age em todos os módulos</Text>
        </View>
      </View>
      <Card>
        <Text>
          A conversa com a Vega chega na etapa 3. Ela vai registrar, consultar e organizar qualquer coisa do app por texto ou
          voz, sempre mostrando o que fez e com opção de desfazer.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
