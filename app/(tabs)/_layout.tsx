import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Text } from 'react-native';
import { useAuthStore } from '@stores/authStore';
import { SECONDARY, TEXT, TYPOGRAPHY } from '@lib/theme';

function tabIcon(emoji: string) {
  return ({ focused, size = 24 }: { focused: boolean; size?: number }) => (
    <Text style={{ fontSize: size, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function TabsLayout() {
  const session = useAuthStore((s) => s.session);
  const initializing = useAuthStore((s) => s.initializing);

  // Same session-based redirect app/index.tsx and login.tsx already use —
  // without this, signing out from the Profile tab clears the session but
  // leaves the tab navigator showing the same screen with nothing to load.
  if (!initializing && !session) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: SECONDARY[600],
        tabBarInactiveTintColor: TEXT.tertiary,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          height: 84,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarLabelStyle: { ...TYPOGRAPHY.CAPTION, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: tabIcon('🗺️'),
          tabBarAccessibilityLabel: 'Map tab',
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: tabIcon('🍎'),
          tabBarAccessibilityLabel: 'Recipes tab',
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: tabIcon('✅'),
          tabBarAccessibilityLabel: 'Habits tab',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: tabIcon('👤'),
          tabBarAccessibilityLabel: 'Profile tab',
        }}
      />
    </Tabs>
  );
}
