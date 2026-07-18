import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { CoachTabParamList } from './types';
import { AppTabBar } from './AppTabBar';
import { HomeScreen as CoachHomeScreen } from '../screens/coach/HomeScreen';
import { SwimmersListScreen } from '../screens/coach/SwimmersListScreen';
import { SessionsScreen as CoachSessionsScreen } from '../screens/coach/SessionsScreen';
import { EvaluateListScreen } from '../screens/coach/EvaluateListScreen';
import { TournamentsScreen as CoachTournamentsScreen } from '../screens/coach/TournamentsScreen';
import { ReportsScreen } from '../screens/coach/ReportsScreen';

const Tab = createBottomTabNavigator<CoachTabParamList>();

const ICONS = { Inicio: 'home', Nadadores: 'users', Sesiones: 'calendar', Evaluar: 'clipboard', Torneos: 'trophy', Reportes: 'chart' } as const;

export function CoachTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <AppTabBar {...props} icons={ICONS} />}>
      <Tab.Screen name="Inicio" component={CoachHomeScreen} />
      <Tab.Screen name="Nadadores" component={SwimmersListScreen} />
      <Tab.Screen name="Sesiones" component={CoachSessionsScreen} />
      <Tab.Screen name="Evaluar" component={EvaluateListScreen} />
      <Tab.Screen name="Torneos" component={CoachTournamentsScreen} />
      <Tab.Screen name="Reportes" component={ReportsScreen} />
    </Tab.Navigator>
  );
}
