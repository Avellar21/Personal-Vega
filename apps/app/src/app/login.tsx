import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Screen, Text, TextField } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';

export default function Login() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<'entrar' | 'criar'>('entrar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit() {
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const credentials = { email: email.trim(), password };
    const { error: authError, data } =
      mode === 'entrar' ? await supabase.auth.signInWithPassword(credentials) : await supabase.auth.signUp(credentials);
    setBusy(false);
    if (authError) setError(authError.message);
    else if (mode === 'criar' && !data.session) setNotice('Conta criada. Confirme pelo link enviado ao seu e-mail e depois entre.');
  }

  return (
    <Screen>
      <View style={styles.wrap}>
        <View style={styles.brand}>
          <Icon name="vega" size={28} color={colors.accent} />
          <Text variant="display">Vega</Text>
        </View>
        <Text tone="muted">Sua central pessoal.</Text>
        <View style={styles.form}>
          <TextField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <TextField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={mode === 'entrar' ? 'current-password' : 'new-password'}
            onSubmitEditing={submit}
            error={error}
          />
          {notice && <Text tone="good">{notice}</Text>}
          <Button
            block
            label={mode === 'entrar' ? 'Entrar' : 'Criar conta'}
            loading={busy}
            disabled={!email || password.length < 8}
            onPress={submit}
          />
          <Button
            variant="ghost"
            label={mode === 'entrar' ? 'Primeiro acesso? Criar conta' : 'Já tenho conta'}
            onPress={() => setMode(mode === 'entrar' ? 'criar' : 'entrar')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', gap: space.sm, maxWidth: 420, width: '100%', alignSelf: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  form: { gap: space.lg, marginTop: space.xxl },
});
