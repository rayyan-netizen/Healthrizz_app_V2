import { View, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@stores/authStore';
import { useOnboardingCompleteStore } from '@stores/onboardingCompleteStore';

export default function Index() {
  const session = useAuthStore((s) => s.session);
  const initializing = useAuthStore((s) => s.initializing);
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

  return <Redirect href="/map" />;
}
