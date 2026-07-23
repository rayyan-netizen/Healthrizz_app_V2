import { View, Text, Pressable, Image } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@stores/authStore';

export default function Index() {
  const session = useAuthStore((s) => s.session);
  const initializing = useAuthStore((s) => s.initializing);
  const signOut = useAuthStore((s) => s.signOut);

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-warm">
        <Text className="font-nunito text-ink-tertiary">Loading…</Text>
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-warm px-6">
      <Image
        source={require('../assets/brand/mascot.png')}
        className="h-32 w-32"
        resizeMode="contain"
      />
      <Text className="font-nunito-extrabold text-2xl text-ink">You're in!</Text>
      <Text className="font-nunito text-ink-secondary">{session.user.email}</Text>
      <Pressable
        onPress={signOut}
        className="mt-2 rounded-kid bg-primary-500 px-6 py-3 active:bg-primary-600"
      >
        <Text className="font-nunito-bold text-ink">Log out</Text>
      </Pressable>
    </View>
  );
}
