import { Card, Screen, Text } from '@/components/ui';

export default function Configurar() {
  return (
    <Screen>
      <Text variant="display">Falta conectar o banco.</Text>
      <Card>
        <Text>
          Crie o arquivo apps/app/.env a partir do .env.example com o endereço do projeto no Supabase e a chave publicável, e
          reinicie o app.
        </Text>
        <Text variant="caption">A chave secreta nunca vai no app.</Text>
      </Card>
    </Screen>
  );
}
