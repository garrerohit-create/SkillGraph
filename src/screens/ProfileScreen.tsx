import React, { useRef, useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { base44Client } from '../services/base44Client';
import { Feather } from '@expo/vector-icons';
import { SkillBadge } from '../components';
import { Skill } from '../types';
import { useAuth } from '../context/AuthContext';
import { neo4jClient } from '../db/neo4jClient';

const INITIAL_WALLET_BALANCE = 125050; // $1,250.50

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  
  const bootupAnims = useRef([
    new Animated.Value(0), // Header
    new Animated.Value(0), // Row 1 (Wallet/Stats)
    new Animated.Value(0), // Row 2 (Graph)
    new Animated.Value(0), // Row 3 (Tasks)
  ]).current;
  
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  // Web3 & Skills State
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(INITIAL_WALLET_BALANCE);
  const [verifiedSkills, setVerifiedSkills] = useState<Skill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);

  // Pulse animation runs continuously
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.2, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  useFocusEffect(
    useCallback(() => {
      bootupAnims.forEach(anim => anim.setValue(0));
      
      const animations = bootupAnims.map(anim => 
        Animated.spring(anim, {
          toValue: 1,
          tension: 120, // Highly intense spring
          friction: 6, // Very bouncy
          useNativeDriver: true,
        })
      );

      Animated.stagger(100, animations).start();

      let isActive = true;
      const fetchSkills = async () => {
        try {
          setIsLoadingSkills(true);
          const userId = user?.id || 'u1';
          const skills = await neo4jClient.getUserSkills(userId);
          if (isActive) {
            setVerifiedSkills(skills);
          }
        } catch (error) {
          console.warn('[ProfileScreen] Failed to fetch user skills from Neo4j:', error);
          if (isActive) {
            setVerifiedSkills([
              { id: 's_react', name: 'React', category: 'frontend', level: 'advanced', verified: true },
              { id: 's_typescript', name: 'TypeScript', category: 'frontend', level: 'intermediate', verified: true },
              { id: 's_nodejs', name: 'Node.js', category: 'backend', level: 'advanced', verified: true },
              { id: 's_neo4j', name: 'Neo4j', category: 'data', level: 'beginner', verified: true },
              { id: 's_graphql', name: 'GraphQL', category: 'backend', level: 'intermediate', verified: true },
            ]);
          }
        } finally {
          if (isActive) setIsLoadingSkills(false);
        }
      };

      fetchSkills();

      return () => {
        isActive = false;
        bootupAnims.forEach(anim => anim.setValue(0));
      };
    }, [bootupAnims, user])
  );

  const getAnimStyle = (index: number) => {
    const translateY = bootupAnims[index].interpolate({
      inputRange: [0, 1],
      outputRange: [100, 0] // Intense 100px slide up
    });
    const scale = bootupAnims[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1] // Intense 80% to 100% scale pop
    });
    return {
      opacity: bootupAnims[index],
      transform: [{ translateY }, { scale }]
    };
  };

  const connectWallet = async () => {
    setIsWalletConnected(true);
    // Simulate Web3 Provider connection
    setTimeout(() => {
      setWalletAddress('0x71C...3A9F');
    }, 800);
  };

  const withdrawFunds = async () => {
    if (!isWalletConnected) return alert('Connect wallet first');
    setIsWithdrawing(true);
    try {
      // Call backend to withdraw full balance
      const newBalance = await base44Client.withdrawFunds(walletBalance);
      setWalletBalance(newBalance);
      alert('Transaction Confirmed!\n\nTxHash: 0x8f2d...9a1b\nFunds transferred to your wallet via Base Sepolia.');
    } catch (err) {
      alert('Withdrawal failed.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050B14', '#0A192F', '#050B14']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll}>
          
          <Animated.View style={[styles.header, getAnimStyle(0)]}>
            <Text style={styles.title}>System Architect</Text>
            <Text style={styles.subtitle}>garrett_dev</Text>
          </Animated.View>

          <View style={styles.bentoGrid}>
            
            <Animated.View style={[styles.row, getAnimStyle(1)]}>
              <BlurView intensity={20} tint="dark" style={[styles.bentoCard, styles.walletCard]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={styles.cardTitle}>Available Balance</Text>
                    <Animated.View style={[styles.liveIndicator, { opacity: pulseAnim, transform: [{ scale: pulseAnim }] }]} />
                  </View>
                  <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
                    <Feather name="list" size={16} color="#A0AEC0" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.walletBalance}>
                  ${(walletBalance / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
                <Text style={styles.totalEarningsText}>
                  Total Earnings: ${(INITIAL_WALLET_BALANCE / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>

                {isWalletConnected ? (
                  <View style={styles.walletActions}>
                    <Text style={styles.walletAddressText}>{walletAddress}</Text>
                    <TouchableOpacity style={styles.withdrawBtn} onPress={withdrawFunds} disabled={isWithdrawing}>
                      {isWithdrawing ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.withdrawBtnText}>Withdraw</Text>}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.connectBtn} onPress={connectWallet}>
                    <Feather name="link" size={14} color="#00E5FF" />
                    <Text style={styles.connectBtnText}>Connect Web3 Wallet</Text>
                  </TouchableOpacity>
                )}
              </BlurView>

              <BlurView intensity={20} tint="dark" style={[styles.bentoCard, styles.statsCard]}>
                <Text style={styles.cardTitle}>Global Rank</Text>
                <Text style={styles.statValue}>#1,042</Text>
                <View style={styles.progressBar}>
                  <View style={styles.progressFill} />
                </View>
                <Text style={styles.statSub}>Top 5%</Text>
              </BlurView>
            </Animated.View>

            <Animated.View style={getAnimStyle(2)}>
              <BlurView intensity={20} tint="dark" style={[styles.bentoCard, styles.graphCard]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Knowledge Graph</Text>
                  <Text style={styles.cardSub}>{verifiedSkills.length} Verified Nodes</Text>
                </View>
                <View style={styles.graphContainer}>
                  <View style={styles.graphConnection} />
                  <View style={[styles.graphConnection, { transform: [{ rotate: '45deg' }] }]} />
                  {isLoadingSkills ? (
                    <ActivityIndicator size="small" color="#00E5FF" />
                  ) : (
                    verifiedSkills.map(skill => (
                      <SkillBadge key={skill.id} skill={skill} />
                    ))
                  )}
                </View>
              </BlurView>
            </Animated.View>

            <Animated.View style={getAnimStyle(3)}>
              <BlurView intensity={20} tint="dark" style={[styles.bentoCard, styles.taskCard]}>
                <Text style={styles.cardTitle}>Active Stream</Text>
                <View style={styles.taskItem}>
                  <View style={styles.taskIcon}><Text style={styles.taskIconText}>Gig</Text></View>
                  <View style={styles.taskTextContainer}>
                    <Text style={styles.taskTitle}>Build Smart Contract</Text>
                    <Text style={styles.taskSub}>NeoBank • In Progress</Text>
                  </View>
                </View>
                <View style={styles.taskItem}>
                  <View style={styles.taskIcon}><Text style={styles.taskIconText}>Lrn</Text></View>
                  <View style={styles.taskTextContainer}>
                    <Text style={styles.taskTitle}>Intro to Solidity</Text>
                    <Text style={styles.taskSub}>45% Complete</Text>
                  </View>
                </View>
              </BlurView>
            </Animated.View>

          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A192F' },
  safeArea: { flex: 1 },
  scroll: { paddingBottom: 100 },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#E2E8F0', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#00E5FF', marginTop: 4, fontWeight: '600' },
  bentoGrid: { paddingHorizontal: 16, gap: 16 },
  row: { flexDirection: 'row', gap: 16 },
  bentoCard: { borderRadius: 24, padding: 20, backgroundColor: 'rgba(10, 25, 47, 0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { color: '#718096', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginRight: 8 },
  cardSub: { color: '#00E5FF', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  walletCard: { flex: 3 },
  statsCard: { flex: 2 },
  liveIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', shadowColor: '#10B981', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4 },
  walletBalance: { color: '#10B981', fontSize: 32, fontWeight: '800', marginBottom: 4, letterSpacing: -1 },
  totalEarningsText: { color: '#A0AEC0', fontSize: 11, marginBottom: 16, fontWeight: '600' },
  walletActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletAddressText: { color: '#A0AEC0', fontFamily: 'monospace', fontSize: 11, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  connectBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 229, 255, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.2)' },
  connectBtnText: { color: '#00E5FF', fontSize: 12, fontWeight: '700', marginLeft: 6 },
  withdrawBtn: { backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  withdrawBtnText: { color: '#000', fontSize: 12, fontWeight: '800' },
  statValue: { color: '#E2E8F0', fontSize: 28, fontWeight: '800', marginBottom: 12 },
  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 8 },
  progressFill: { height: '100%', width: '95%', backgroundColor: '#00E5FF', borderRadius: 2 },
  statSub: { color: '#A0AEC0', fontSize: 11, fontWeight: '500' },
  graphCard: { width: '100%' },
  graphContainer: { position: 'relative', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingVertical: 16 },
  graphConnection: { position: 'absolute', top: '30%', left: '10%', right: '10%', bottom: '30%', borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.1)', borderStyle: 'dashed', zIndex: -1, borderRadius: 100 },
  taskCard: { width: '100%' },
  taskItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  taskIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0, 229, 255, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  taskIconText: { color: '#00E5FF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  taskTextContainer: { flex: 1 },
  taskTitle: { color: '#E2E8F0', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  taskSub: { color: '#A0AEC0', fontSize: 12 }
});
