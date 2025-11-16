import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Screens
import ProfileScreen from '../screens/ProfileScreen';
import AnimesScreen from '../screens/AnimesScreen';
import SeriesScreen from '../screens/SeriesScreen';
import MangasScreen from '../screens/MangasScreen';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2563eb',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Animes"
        component={AnimesScreen}
        options={{
          title: 'Animes',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📺</Text>,
        }}
      />
      <Tab.Screen
        name="Series"
        component={SeriesScreen}
        options={{
          title: 'Séries',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🎬</Text>,
        }}
      />
      <Tab.Screen
        name="Mangas"
        component={MangasScreen}
        options={{
          title: 'Mangás',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📚</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}
