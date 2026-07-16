import React, { useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface Props {
  placeholder?: string;
}

export default function CommandPalette({ placeholder = "Search gigs, skills, or commands..." }: Props) {
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    Animated.spring(focusAnim, {
      toValue: 1,
      friction: 4,
      tension: 60,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    Animated.spring(focusAnim, {
      toValue: 0,
      friction: 4,
      tension: 60,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0, 229, 255, 0.2)', 'rgba(0, 229, 255, 1)']
  });
  
  // Subtle scale on focus
  const scale = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02]
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
      <BlurView intensity={30} style={styles.blurContainer} tint="dark">
        <Animated.View style={[styles.borderWrapper, { borderColor: borderColor as any }]}>
          <Text style={styles.icon}>{'>_'}</Text>
          <TextInput 
            style={[styles.input, Platform.OS === 'web' && { outlineStyle: 'none' } as any]} 
            placeholder={placeholder}
            placeholderTextColor="#4A5568"
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </Animated.View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 50, // Moved upwards to avoid overlap!
    left: 20,
    right: 20,
    zIndex: 100,
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(10, 25, 47, 0.6)',
  },
  borderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50, // Reverted to 50
  },
  icon: {
    color: '#00E5FF',
    fontSize: 18, // Reverted to 18
    marginRight: 10,
    fontWeight: '800',
  },
  input: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 15, // Reverted to 15
    fontWeight: '600'
  }
});
