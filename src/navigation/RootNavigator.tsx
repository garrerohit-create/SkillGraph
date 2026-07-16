// ============================================================
// SkillGraph — Root Stack Navigator
// ============================================================

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import { RootStackParamList } from '../types';
import { GigDetailScreen, CoursePlayerScreen, SkillGapAnalysisScreen, AuthScreen, TransactionHistoryScreen } from '../screens';

import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A192F', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {!token ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="GigDetail" component={GigDetailScreen} />
          <Stack.Screen name="SkillGapAnalysis" component={SkillGapAnalysisScreen} />
          <Stack.Screen 
            name="CoursePlayer" 
            component={CoursePlayerScreen} 
            options={{ animation: 'slide_from_bottom' }} 
          />
          <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
