import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@stores/authStore';

export default function Profile() {
  const session = useAuthStore((s) => s.session);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <SafeAreaView className="flex-1 bg-warm" edges={['top', 'left', 'right']}>
      <View className="flex-1 items-center justify-center gap-2 px-6">
        <Text className="text-4xl">👤</Text>
        <Text className="font-nunito-extrabold text-2xl text-ink">Profile</Text>
        {session?.user.email ? (
          <Text className="font-nunito text-ink-tertiary">{session.user.email}</Text>
        ) : null}
        <Pressable
          onPress={signOut}
          className="mt-4 rounded-kid bg-primary-500 px-6 py-3 active:bg-primary-600"
        >
          <Text className="font-nunito-bold text-ink">Log out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
