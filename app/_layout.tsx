import '../global.css';
import { Stack } from 'expo-router';
import { useFonts, Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { View } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <View className="flex-1 bg-warm" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
