import React, { useRef } from 'react';
import { TouchableWithoutFeedback, Text, StyleSheet, ViewStyle, ActivityIndicator, Animated } from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: any;
}

export default function Button({ title, onPress, variant = 'primary', disabled, loading, icon, style }: Props) {
  const isPrimary = variant === 'primary';
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    
    // Extremely intense spring for "very very intense" request
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 0.75, // Massive shrink
        friction: 2,   // High bounce (jelly effect)
        tension: 140,  // Fast snap
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 0.5,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
  };

  return (
    <TouchableWithoutFeedback 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      <Animated.View 
        style={[
          styles.button, 
          isPrimary ? styles.primary : styles.secondary,
          disabled && styles.disabled,
          style,
          { transform: [{ scale: scaleValue }], opacity: opacityValue }
        ]}
      >
        {loading ? (
          <ActivityIndicator color={isPrimary ? '#0A192F' : '#00E5FF'} />
        ) : (
          <Text style={[
            styles.text, 
            isPrimary ? styles.textPrimary : styles.textSecondary,
            disabled && styles.textDisabled
          ]}>
            {icon ? `${icon} ` : ''}{title}
          </Text>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: '#00E5FF',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  secondary: {
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  disabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textPrimary: {
    color: '#0A192F',
  },
  textSecondary: {
    color: '#00E5FF',
  },
  textDisabled: {
    color: '#718096',
  }
});
