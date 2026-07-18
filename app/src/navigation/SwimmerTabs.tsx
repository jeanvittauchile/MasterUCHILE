import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { SwimmerTabParamList } from './types';
import { AppTabBar } from './AppTabBar';
import { HomeScreen as SwimmerHomeScreen } from '../screens/swimmer/HomeScreen';
import { SessionsScreen as SwimmerSessionsScreen } from '../screens/swimmer/SessionsScreen';
import { ProgressScreen } from '../screens/swimmer/ProgressScreen';
import { TournamentsScreen as SwimmerTournamentsScreen } from '../screens/swimmer/TournamentsScreen';
import { ProfileScreen } from '../screens/swimmer/ProfileScreen';

const Tab = createBottomTabNavigator<SwimmerTabParamList>();

const ICONS = { Inicio: 'home', Sesiones: 'calendar', Progreso: 'chart', Torneos: 'trophy', Perfil: 'user' } as const;

export function SwimmerTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <AppTabBar {...props} icons={ICONS} />}>
      <Tab.Screen name="Inicio" component={SwimmerHomeScreen} />
      <Tab.Screen name="Sesiones" component={SwimmerSessionsScreen} />
      <Tab.Screen name="Progreso" component={ProgressScreen} />
      <Tab.Screen name="Torneos" component={SwimmerTournamentsScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
