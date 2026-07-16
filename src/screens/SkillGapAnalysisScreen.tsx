import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, LayoutAnimation, UIManager, Platform, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList, SkillGapResult } from '../types';
import { Button } from '../components';
import { neo4jClient } from '../db/neo4jClient';
import { ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

type SkillGapRouteProp = RouteProp<RootStackParamList, 'SkillGapAnalysis'>;

export default function SkillGapAnalysisScreen() {
  const route = useRoute<SkillGapRouteProp>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { gig, missingSkills } = route.params;

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const pathAnims = useRef([0,1,2,3,4].map(() => new Animated.Value(0))).current;
  const [analysis, setAnalysis] = React.useState<SkillGapResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(true);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    if (analysis && !isAnalyzing) {
      Animated.stagger(200, pathAnims.map(anim => 
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        })
      )).start();
    }
  }, [analysis, isAnalyzing, pathAnims]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1500, useNativeDriver: true })
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    let isActive = true;
    const analyzeGraph = async () => {
      try {
        setIsAnalyzing(true);
        // Use authenticated user ID instead of 'u1'
        const result = await neo4jClient.getSkillGap(user?.id || 'u1', gig.id);
        if (isActive) {
          setAnalysis(result);
        }
      } catch (error) {
        console.warn('Neo4j Query failed, falling back to mock graph data:', error);
        if (isActive) {
          setAnalysis({
            gig,
            missingSkills: missingSkills && missingSkills.length > 0 ? missingSkills : [{ id: 's_mock', name: 'Smart Contracts', category: 'blockchain', level: 'intermediate', verified: false }],
            recommendedCourses: [],
            matchPercentage: 85
          });
        }
      } finally {
        if (isActive) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setIsAnalyzing(false);
        }
      }
    };

    analyzeGraph();
    return () => { isActive = false; };
  }, [gig, missingSkills]);

  const activeMissingSkill = analysis?.missingSkills[0];
  const activeCourse = analysis?.recommendedCourses[0] || {
    id: 'c1',
    title: `Intro to ${activeMissingSkill?.name || 'Skill'}`,
    description: 'Learn the fundamentals to bridge your knowledge gap.',
    skillTaught: activeMissingSkill,
    durationMinutes: 15,
    xpReward: 150,
    tokenReward: 500,
    completionRate: 0,
    content: []
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050B14', '#0A192F', '#050B14']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#00E5FF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Graph Analysis</Text>
          <View style={{ width: 24 }} />
        </View>

        {isAnalyzing || !analysis ? (
          <View style={[styles.graphContainer, { justifyContent: 'center' }]}>
            <ActivityIndicator size="large" color="#B794F4" />
            <Text style={{ color: '#B794F4', marginTop: 16, fontWeight: '600' }}>Traversing Graph Database...</Text>
          </View>
        ) : (
          <>
            <View style={styles.graphContainer}>
              {/* User Node */}
              <Animated.View style={[styles.nodeWrapper, { opacity: pathAnims[0], transform: [{ scale: pathAnims[0] }] }]}>
                <View style={[styles.node, styles.userNode]}>
                  <Text style={{ color: '#00E5FF', fontWeight: '800' }}>{analysis.matchPercentage}%</Text>
                </View>
                <Text style={styles.nodeLabel}>Match</Text>
              </Animated.View>

              {/* Dotted Line */}
              <Animated.View style={[styles.connectionLine, { opacity: pathAnims[1] }]} />

              {/* Missing Bridge Node (Purple Accent) */}
              <Animated.View style={[
                styles.nodeWrapper,
                { 
                  opacity: pathAnims[2],
                  transform: [
                    { scale: pathAnims[2] }, // initial pop
                    { scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) } // ongoing pulse
                  ] 
                }
              ]}>
                <View style={[styles.node, styles.missingNode]}>
                  <Feather name="zap" size={24} color="#B794F4" />
                </View>
                <Text style={[styles.nodeLabel, { color: '#B794F4' }]}>{activeMissingSkill?.name || 'Unknown'}</Text>
                <Text style={styles.bridgeLabel}>Bridge Node</Text>
              </Animated.View>

              {/* Dotted Line */}
              <Animated.View style={[styles.connectionLine, { opacity: pathAnims[3] }]} />

              {/* Gig Node */}
              <Animated.View style={[styles.nodeWrapper, { opacity: pathAnims[4], transform: [{ scale: pathAnims[4] }] }]}>
                <View style={[styles.node, styles.gigNode]}>
                  <Feather name="briefcase" size={24} color="#10B981" />
                </View>
                <Text style={styles.nodeLabel}>{gig.company}</Text>
              </Animated.View>
            </View>

            <Animated.View style={{ opacity: pathAnims[4] }}>
              <BlurView intensity={20} tint="dark" style={styles.actionCard}>
              <Text style={styles.actionTitle}>Skill Gap Detected</Text>
              <Text style={styles.actionDesc}>
                Our Neo4j graph indicates you are missing the <Text style={{ color: '#B794F4' }}>{activeMissingSkill?.name}</Text> node to complete the path to this bounty.
              </Text>

              <Button
                title={analysis.recommendedCourses.length > 0 ? "Take Recommended Course" : "Learn & Verify Node"}
                onPress={() => navigation.navigate('CoursePlayer', { course: activeCourse })}
              />
            </BlurView>
            </Animated.View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A192F' },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16 },
  headerTitle: { color: '#E2E8F0', fontSize: 18, fontWeight: '700' },
  graphContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  nodeWrapper: { alignItems: 'center' },
  node: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 2, shadowOpacity: 1, shadowRadius: 20 },
  userNode: { backgroundColor: 'rgba(0, 229, 255, 0.1)', borderColor: '#00E5FF', shadowColor: 'rgba(0, 229, 255, 0.5)' },
  missingNode: { backgroundColor: 'rgba(183, 148, 244, 0.1)', borderColor: '#B794F4', shadowColor: 'rgba(183, 148, 244, 0.5)', borderStyle: 'dashed' },
  gigNode: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10B981', shadowColor: 'rgba(16, 185, 129, 0.5)' },
  nodeLabel: { color: '#E2E8F0', fontSize: 14, fontWeight: '700', marginTop: 12 },
  bridgeLabel: { color: '#A0AEC0', fontSize: 10, textTransform: 'uppercase', marginTop: 4 },
  connectionLine: { width: 2, height: 60, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  actionCard: { margin: 24, padding: 24, borderRadius: 24, backgroundColor: 'rgba(10, 25, 47, 0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  actionTitle: { color: '#E2E8F0', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  actionDesc: { color: '#A0AEC0', fontSize: 14, lineHeight: 22, marginBottom: 24 }
});
