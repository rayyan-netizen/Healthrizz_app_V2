import 'react-native-gesture-handler';
import '../global.css';
import { Stack } from 'expo-router';
import { useFonts, Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <View className="flex-1 bg-warm" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}
