import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Animated, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GigCard, CommandPalette } from '../components';
import { Gig, Skill } from '../types';
import { base44Client } from '../services/base44Client';
import { useAuth } from '../context/AuthContext';
import { neo4jClient } from '../db/neo4jClient';

const MOCK_GIGS: { gig: Gig, missing: Skill[] }[] = [
  {
    gig: {
      id: 'g1',
      title: 'Build Smart Contract for DeFi App',
      company: 'NeoBank',
      bountyAmount: 150000,
      requiredSkills: [
        { id: 's_solidity', name: 'Solidity', category: 'blockchain', level: 'intermediate', verified: true },
        { id: 's_react', name: 'React', category: 'frontend', level: 'advanced', verified: true }
      ],
      difficulty: 'advanced',
      estimatedHours: 40,
      deadline: '2026-06-01',
      status: 'open',
      applicantCount: 12,
      description: 'We need an experienced blockchain developer to build and audit a new staking smart contract for our DeFi protocol.'
    },
    missing: [
      { id: 's_solidity', name: 'Solidity', category: 'blockchain', level: 'intermediate', verified: false }
    ]
  },
  {
    gig: {
      id: 'g2',
      title: 'Optimize React Native Animations',
      company: 'FitnessPro',
      bountyAmount: 50000,
      requiredSkills: [
        { id: 's_reanimated', name: 'Reanimated', category: 'mobile', level: 'intermediate', verified: true }
      ],
      difficulty: 'advanced',
      estimatedHours: 15,
      deadline: '2026-05-20',
      status: 'open',
      applicantCount: 3,
      description: 'Looking for a React Native expert to profile and fix frame drops in our workout tracking app.'
    },
    missing: [
      { id: 's_reanimated', name: 'Reanimated', category: 'mobile', level: 'intermediate', verified: false }
    ]
  }
];

const AnimatedGigCard = ({ item, animValue }: any) => {
  const navigation = useNavigation<any>();
  
  // Guard against undefined animation values during state updates
  if (!animValue) return null;

  // INTENSE ANIMATIONS
  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [150, 0] // Huge 150px slide up
  });
  const scale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1] // Dramatic scale up
  });

  return (
    <Animated.View style={{ opacity: animValue, transform: [{ translateY }, { scale }] }}>
      <GigCard 
        gig={item.gig} 
        missingSkills={item.missing}
        onApply={() => navigation.navigate('GigDetail', { gig: item.gig, missingSkills: item.missing })}
        onSuggestCourse={(skill: Skill) => navigation.navigate('SkillGapAnalysis', { gig: item.gig, missingSkills: item.missing })}
      />
    </Animated.View>
  );
};

export default function MarketplaceScreen() {
  const { user } = useAuth();
  const [gigsData, setGigsData] = React.useState<{ gig: Gig, missing: Skill[] }[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [animValues, setAnimValues] = React.useState<Animated.Value[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchGigs = async () => {
        try {
          setIsLoading(true);
          const userId = user?.id || 'u1';
          const neo4jGigs = await neo4jClient.getAllGigsWithGap(userId);
          
          if (isActive) {
            setGigsData(neo4jGigs.length > 0 ? neo4jGigs : MOCK_GIGS);
          }
        } catch (error) {
          console.warn('[MarketplaceScreen] Neo4j fetch failed, using fallback mocks:', error);
          if (isActive) {
             setGigsData(MOCK_GIGS);
          }
        } finally {
          if (isActive) setIsLoading(false);
        }
      };

      fetchGigs();

      return () => { isActive = false; };
    }, [user])
  );

  React.useEffect(() => {
    if (gigsData.length > 0 && !isLoading) {
      const newAnims = gigsData.map(() => new Animated.Value(0));
      setAnimValues(newAnims);
      
      const animations = newAnims.map(anim => 
        Animated.spring(anim, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        })
      );

      Animated.stagger(120, animations).start();
    }
  }, [gigsData, isLoading]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050B14', '#0A192F', '#050B14']} style={StyleSheet.absoluteFill} />
      
      <CommandPalette placeholder="Search gigs, bounties, or /commands" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Marketplace</Text>
          <Text style={styles.subtitle}>Discover live bounties</Text>
        </View>
        
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#00E5FF" />
          </View>
        ) : (
          <FlatList
            data={gigsData}
            keyExtractor={item => item.gig.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <AnimatedGigCard item={item} animValue={animValues[index]} />
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A192F' },
  safeArea: { 
    flex: 1, 
    paddingTop: 120 // Increased padding to prevent overlap with Command Palette
  },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#E2E8F0', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#A0AEC0', marginTop: 4 },
  list: { paddingHorizontal: 24, paddingBottom: 120 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
