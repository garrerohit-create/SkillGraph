import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CourseCard, CommandPalette } from '../components';
import { MicroCourse } from '../types';
import { base44Client } from '../services/base44Client';

const { width } = Dimensions.get('window');

const MOCK_COURSES: MicroCourse[] = [
  {
    id: 'c1',
    title: 'Intro to Solidity Smart Contracts',
    description: 'Learn the fundamentals of writing secure smart contracts on Ethereum.',
    skillTaught: { id: 's_solidity', name: 'Solidity', category: 'blockchain', level: 'beginner', verified: false },
    durationMinutes: 15,
    xpReward: 150,
    tokenReward: 500,
    completionRate: 0,
    content: [
      { id: '1', type: 'text', title: 'What is a Smart Contract?', body: 'A smart contract is a self-executing program stored on a blockchain that runs when predetermined conditions are met.' },
      { id: '2', type: 'code_challenge', title: 'Your First Contract', body: 'contract HelloWorld {\n  string public greeting = "Hello";\n}' },
      { id: '3', type: 'quiz', title: 'Knowledge Check', body: 'Where are smart contracts executed?', quizOptions: [{id:'a', text:'On a centralized server'}, {id:'b', text:'On the blockchain'}, {id:'c', text:'In your browser'}], correctAnswerIndex: 1 }
    ]
  },
  {
    id: 'c2',
    title: 'React Native Reanimated Basics',
    description: 'Master 60fps animations in React Native using Reanimated 3.',
    skillTaught: { id: 's_reanimated', name: 'Reanimated', category: 'mobile', level: 'intermediate', verified: false },
    durationMinutes: 25,
    xpReward: 200,
    tokenReward: 750,
    completionRate: 0,
    content: [
      { id: '1', type: 'text', title: 'The UI Thread vs JS Thread', body: 'Reanimated runs your animations entirely on the UI thread to guarantee silky smooth 60fps performance.' },
      { id: '2', type: 'code_challenge', title: 'Shared Values', body: 'const offset = useSharedValue(0);\n\noffset.value = withSpring(100);' },
      { id: '3', type: 'quiz', title: 'Knowledge Check', body: 'Why do we use useSharedValue?', quizOptions: [{id:'a', text:'To store global state'}, {id:'b', text:'To animate values on the UI thread'}, {id:'c', text:'To fetch API data'}], correctAnswerIndex: 1 }
    ]
  },
  {
    id: 'c3',
    title: 'Graph Databases with Neo4j',
    description: 'Understand how to map relationships and query nodes using Cypher.',
    skillTaught: { id: 's_neo4j', name: 'Neo4j', category: 'data', level: 'advanced', verified: false },
    durationMinutes: 40,
    xpReward: 300,
    tokenReward: 1000,
    completionRate: 0,
    content: [
      { id: '1', type: 'text', title: 'Nodes and Edges', body: 'In Neo4j, data is stored as Nodes (entities) connected by Edges (relationships), making it perfect for complex networks.' },
      { id: '2', type: 'code_challenge', title: 'Cypher Query', body: 'MATCH (u:User)-[:HAS_SKILL]->(s:Skill)\nRETURN u.name, s.name' },
      { id: '3', type: 'quiz', title: 'Knowledge Check', body: 'What language is used to query Neo4j?', quizOptions: [{id:'a', text:'SQL'}, {id:'b', text:'Cypher'}, {id:'c', text:'GraphQL'}], correctAnswerIndex: 1 }
    ]
  },
  {
    id: 'c4',
    title: 'Advanced AI Prompt Engineering',
    description: 'Learn how to construct highly deterministic LLM prompts for production apps.',
    skillTaught: { id: 's_ai_prompts', name: 'AI Prompts', category: 'ai', level: 'intermediate', verified: false },
    durationMinutes: 20,
    xpReward: 250,
    tokenReward: 800,
    completionRate: 0,
    content: [
      { id: '1', type: 'text', title: 'Zero-Shot vs Few-Shot', body: 'Zero-shot prompting gives no examples. Few-shot prompting provides examples to drastically increase the model accuracy.' },
      { id: '2', type: 'code_challenge', title: 'System Instructions', body: 'System: You are an expert code reviewer. Always output in JSON format.' },
      { id: '3', type: 'quiz', title: 'Knowledge Check', body: 'What does Few-Shot prompting mean?', quizOptions: [{id:'a', text:'Providing zero context'}, {id:'b', text:'Providing multiple examples'}, {id:'c', text:'Using an older model'}], correctAnswerIndex: 1 }
    ]
  },
  {
    id: 'c5',
    title: 'Zero-Knowledge Proofs in Web3',
    description: 'Implement ZK-SNARKs to verify transactions without revealing data.',
    skillTaught: { id: 's_zk_proofs', name: 'ZK Proofs', category: 'blockchain', level: 'advanced', verified: false },
    durationMinutes: 60,
    xpReward: 500,
    tokenReward: 2000,
    completionRate: 0,
    content: [
      { id: '1', type: 'text', title: 'The Concept of ZK', body: 'A Zero-Knowledge Proof allows one party to prove they know a value without actually revealing what the value is.' },
      { id: '2', type: 'text', title: 'SNARKs vs STARKs', body: 'SNARKs require a trusted setup, whereas STARKs are transparent but have larger proof sizes.' },
      { id: '3', type: 'quiz', title: 'Knowledge Check', body: 'What is the primary benefit of a ZK Proof?', quizOptions: [{id:'a', text:'Faster block times'}, {id:'b', text:'Privacy and scalability'}, {id:'c', text:'Lower gas fees'}], correctAnswerIndex: 1 }
    ]
  }
];

export default function LearningScreen() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<any>();
  const [coursesData, setCoursesData] = React.useState<MicroCourse[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const fetchCourses = async () => {
        try {
          setIsLoading(true);
          const fetchedCourses = await base44Client.getMicroCourses();
          
          if (isActive) {
            setCoursesData(fetchedCourses.length > 0 ? fetchedCourses : MOCK_COURSES);
          }
        } catch (error) {
          console.warn('API Fetch failed, falling back to mock courses', error);
          if (isActive) {
             setCoursesData(MOCK_COURSES);
          }
        } finally {
          if (isActive) setIsLoading(false);
        }
      };

      fetchCourses();

      return () => { isActive = false; };
    }, [])
  );

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={['#050B14', '#0A192F', '#050B14']} 
        style={StyleSheet.absoluteFill} 
      />

      <CommandPalette placeholder="Find courses, skills, or mentors" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Knowledge Base</Text>
          <Text style={styles.subtitle}>Swipe to explore active nodes</Text>
        </View>
        
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <Text style={{ color: '#00E5FF', marginTop: 20 }}>Syncing node data...</Text>
          </View>
        ) : (
          <Animated.ScrollView 
            horizontal 
            pagingEnabled 
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.deckContainer}
            decelerationRate="fast"
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16} 
          >
            {coursesData.map((course, index) => {
              const itemWidth = width;
              const inputRange = [
                (index - 1) * itemWidth,
                index * itemWidth,
                (index + 1) * itemWidth
              ];
              
              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.8, 1, 0.8],
                extrapolate: 'clamp'
              });

              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp'
              });

              return (
                <Animated.View key={course.id} style={{ width, justifyContent: 'center', alignItems: 'center', transform: [{ scale }], opacity }}>
                  <CourseCard 
                    course={course} 
                    onStart={() => navigation.navigate('CoursePlayer', { course })} 
                  />
                </Animated.View>
              );
            })}
          </Animated.ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A192F' },
  safeArea: { flex: 1, paddingTop: 100 },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#E2E8F0', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#A0AEC0', marginTop: 4 },
  deckContainer: { paddingBottom: 40, alignItems: 'center' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
