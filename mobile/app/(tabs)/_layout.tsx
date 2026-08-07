import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { palette, type } from '@/constants/kokoro-theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: palette.accent,
        tabBarInactiveTintColor: '#918A81',
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.line,
          height: 72,
          paddingTop: 7,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontFamily: type.body,
          fontSize: 10,
          fontWeight: '700',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? 'map' : 'map-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: 'Review',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? 'refresh-circle' : 'refresh-circle-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? 'git-network' : 'git-network-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? 'person' : 'person-outline'} color={color} />,
        }}
      />
    </Tabs>
  );
}
