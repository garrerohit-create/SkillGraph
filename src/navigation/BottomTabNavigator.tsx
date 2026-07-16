import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Platform, View, Image } from 'react-native';
import { MarketplaceScreen, LearningScreen, ProfileScreen } from '../screens';
import { RootTabParamList } from '../types';

const Tab = createBottomTabNavigator<RootTabParamList>();

const TabIcon = ({ focused, routeName }: { focused: boolean, routeName: string }) => {
  let source;
  if (routeName === 'Marketplace') {
    source = require('../../assets/images/tab_gigs.png');
  } else if (routeName === 'Learning') {
    source = require('../../assets/images/tab_nodes.png');
  } else {
    source = require('../../assets/images/tab_system.png');
  }

  return (
    <View style={[
      styles.iconContainer, 
      focused && styles.iconContainerFocused
    ]}>
      <Image source={source} style={styles.imageIcon} />
    </View>
  );
};

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#00E5FF',
        tabBarInactiveTintColor: '#4A5568',
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => <TabIcon focused={focused} routeName={route.name} />,
      })}
    >
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} options={{ tabBarLabel: 'Gigs' }} />
      <Tab.Screen name="Learning" component={LearningScreen} options={{ tabBarLabel: 'Nodes' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'System' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#050B14',
    borderTopColor: 'rgba(0, 229, 255, 0.15)',
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 95 : 85,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: 16,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    opacity: 0.5,
  },
  iconContainerFocused: {
    opacity: 1,
    borderColor: 'rgba(0, 229, 255, 0.8)',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  imageIcon: {
    width: '100%',
    height: '100%',
  }
});
