import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Animated, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { Button } from '../components';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true })
    ]).start();
  }, []);

  const { login, register } = useAuth();

  const handleAuthenticate = async () => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err) {
      alert('Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <LinearGradient colors={['#050B14', '#0A192F', '#050B14']} style={StyleSheet.absoluteFill} />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.logoContainer}>
          <Feather name="hexagon" size={64} color="#00E5FF" />
          <Text style={styles.title}>SKILLGRAPH</Text>
          <Text style={styles.subtitle}>Decentralized Talent Network</Text>
        </View>

        <BlurView intensity={20} tint="dark" style={styles.card}>
          <Text style={styles.cardTitle}>{isLogin ? 'Access Node' : 'Create Node'}</Text>
          
          <View style={styles.inputContainer}>
            <Feather name="mail" size={20} color="#A0AEC0" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#718096"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color="#A0AEC0" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#718096"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Button 
            title={isLoading ? "Authenticating..." : (isLogin ? "Initialize Session" : "Register")} 
            onPress={handleAuthenticate}
            disabled={isLoading}
            style={{ marginTop: 12 }}
          />

          <TouchableOpacity style={styles.switchButton} onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Text style={{ color: '#00E5FF', fontWeight: 'bold' }}>{isLogin ? "Sign Up" : "Login"}</Text>
            </Text>
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A192F', justifyContent: 'center' },
  content: { padding: 24, alignItems: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 48 },
  title: { fontSize: 32, fontWeight: '900', color: '#E2E8F0', letterSpacing: 2, marginTop: 16 },
  subtitle: { fontSize: 14, color: '#00E5FF', fontWeight: '600', letterSpacing: 1, marginTop: 4, textTransform: 'uppercase' },
  card: { width: '100%', borderRadius: 24, padding: 32, backgroundColor: 'rgba(10, 25, 47, 0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#E2E8F0', marginBottom: 24, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 50, color: '#E2E8F0', fontSize: 16 },
  switchButton: { marginTop: 24, alignItems: 'center' },
  switchText: { color: '#A0AEC0', fontSize: 14 }
});
