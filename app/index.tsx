import { View, Text, Pressable } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@stores/authStore';
import { useOnboardingCompleteStore } from '@stores/onboardingCompleteStore';

export default function Index() {
  const session = useAuthStore((s) => s.session);
  const initializing = useAuthStore((s) => s.initializing);
  const signOut = useAuthStore((s) => s.signOut);
  const onboardingComplete = useOnboardingCompleteStore((s) => s.completed);
  const onboardingHydrated = useOnboardingCompleteStore((s) => s.hydrated);

  if (initializing || !onboardingHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-warm">
        <Text className="font-nunito text-ink-tertiary">Loading…</Text>
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (!onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-warm px-6">
      <Text className="font-nunito-extrabold text-2xl text-ink">home</Text>
      <Pressable
        onPress={signOut}
        className="mt-2 rounded-kid bg-primary-500 px-6 py-3 active:bg-primary-600"
      >
        <Text className="font-nunito-bold text-ink">Log out</Text>
      </Pressable>
    </View>
  );
}
