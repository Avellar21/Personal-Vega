import { Tabs } from 'expo-router/tabs';
import { useWindowDimensions } from 'react-native';
import { AppNavigation } from '@/components/AppNavigation';
import { CommandBar } from '@/components/CommandBar';
import { useTheme } from '@/theme/ThemeProvider';
import { WIDE_BREAKPOINT } from '@/theme/tokens';

export default function AppLayout() {
  const { colors } = useTheme();
  const wide = useWindowDimensions().width >= WIDE_BREAKPOINT;
  return (
    <>
      <Tabs
        tabBar={(props) => <AppNavigation {...props} wide={wide} />}
        screenOptions={{
          headerShown: false,
          tabBarPosition: wide ? 'left' : 'bottom',
          sceneStyle: { backgroundColor: colors.bg },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Hoje' }} />
        <Tabs.Screen name="vega" options={{ title: 'Vega' }} />
        <Tabs.Screen name="capturar" options={{ title: 'Capturar' }} />
        <Tabs.Screen name="modulos" options={{ title: 'Módulos' }} />
        <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
      </Tabs>
      <CommandBar />
    </>
  );
}
