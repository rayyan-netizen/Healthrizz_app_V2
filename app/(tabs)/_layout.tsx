import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { SECONDARY, TEXT, TYPOGRAPHY } from '@lib/theme';

function tabIcon(emoji: string) {
  return ({ focused, size = 24 }: { focused: boolean; size?: number }) => (
    <Text style={{ fontSize: size, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function TabsLayout() {
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
