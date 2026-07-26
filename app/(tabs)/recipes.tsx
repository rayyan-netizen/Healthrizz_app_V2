import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Recipes() {
  return (
    <SafeAreaView className="flex-1 bg-warm" edges={['top', 'left', 'right']}>
      <View className="flex-1 items-center justify-center gap-2 px-6">
        <Text className="text-4xl">🍎</Text>
        <Text className="font-nunito-extrabold text-2xl text-ink">Recipes</Text>
        <Text className="text-center font-nunito text-ink-tertiary">Coming soon!</Text>
      </View>
    </SafeAreaView>
  );
}
