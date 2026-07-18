import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/tokens';
import { CoachTabs } from './CoachTabs';
import { SwimmerTabs } from './SwimmerTabs';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ChangePinScreen } from '../screens/auth/ChangePinScreen';
import { SwimmerDetailScreen } from '../screens/coach/SwimmerDetailScreen';
import { SessionDetailScreen } from '../screens/shared/SessionDetailScreen';
import { TournamentDetailScreen } from '../screens/shared/TournamentDetailScreen';
import { EvaluateDetailScreen } from '../screens/coach/EvaluateDetailScreen';
import { MarkDetailScreen } from '../screens/swimmer/MarkDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { token, user, hydrated } = useAuthStore();

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navy }}>
        <ActivityIndicator color={colors.white} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : user?.pinTemporal ? (
        <Stack.Screen name="ChangePin" component={ChangePinScreen} />
      ) : (
        <>
          {user?.rol === 'coach' ? (
            <Stack.Screen name="CoachTabs" component={CoachTabs} />
          ) : (
            <Stack.Screen name="SwimmerTabs" component={SwimmerTabs} />
          )}
          <Stack.Screen name="SwimmerDetail" component={SwimmerDetailScreen} />
          <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
          <Stack.Screen name="TournamentDetail" component={TournamentDetailScreen} />
          <Stack.Screen name="EvaluateDetail" component={EvaluateDetailScreen} />
          <Stack.Screen name="MarkDetail" component={MarkDetailScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
