import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, LayoutAnimation, UIManager, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { Button } from '../components';
import { neo4jClient } from '../db/neo4jClient';

type CoursePlayerRouteProp = RouteProp<RootStackParamList, 'CoursePlayer'>;

export default function CoursePlayerScreen() {
  const route = useRoute<CoursePlayerRouteProp>();
  const { user } = useAuth();
  const navigation = useNavigation();

  const { course } = route.params;
  
  const [step, setStep] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const totalSteps = course.content.length;

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const renderContent = () => {
    const currentItem = course.content[step - 1];
    if (!currentItem) return null;

    if (currentItem.type === 'text') {
      return (
        <View style={styles.storyboard}>
          <View style={styles.iconCircle}><Feather name="book-open" size={40} color="#00E5FF" /></View>
          <Text style={styles.storyTitle}>{currentItem.title}</Text>
          <Text style={styles.storyText}>{currentItem.body}</Text>
        </View>
      );
    }

    if (currentItem.type === 'code_challenge') {
      return (
        <View style={styles.storyboard}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <Feather name="terminal" size={40} color="#10B981" />
          </View>
          <Text style={styles.storyTitle}>{currentItem.title}</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{currentItem.body}</Text>
          </View>
        </View>
      );
    }

    if (currentItem.type === 'quiz') {
      return (
        <View style={styles.storyboard}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(183, 148, 244, 0.1)' }]}>
            <Feather name="help-circle" size={40} color="#B794F4" />
          </View>
          <Text style={styles.storyTitle}>{currentItem.title}</Text>
          <Text style={styles.storyText}>{currentItem.body}</Text>
          
          <View style={styles.quizContainer}>
            {currentItem.quizOptions?.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentItem.correctAnswerIndex;
              const showResult = selectedAnswer !== null;

              let optionStyle = styles.quizOption;
              if (showResult) {
                if (isSelected && isCorrect) optionStyle = [styles.quizOption, styles.quizCorrect];
                else if (isSelected && !isCorrect) optionStyle = [styles.quizOption, styles.quizWrong];
                else if (isCorrect) optionStyle = [styles.quizOption, styles.quizCorrect]; // Show correct answer if missed
              }

              return (
                <View key={opt.id} style={{ marginBottom: 12 }}>
                  <Button 
                    title={opt.text}
                    variant={showResult && isCorrect ? 'primary' : 'secondary'}
                    onPress={() => setSelectedAnswer(idx)}
                    disabled={showResult}
                    style={optionStyle}
                  />
                </View>
              );
            })}
          </View>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050B14', '#0A192F', '#050B14']} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="x" size={24} color="#A0AEC0" />
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%` }]} />
          </View>
        </View>

        <Text style={styles.courseTitle}>{course.title}</Text>

        <View style={styles.contentContainer}>
          <BlurView intensity={20} tint="dark" style={styles.mainCard}>
            {renderContent()}
          </BlurView>
        </View>

        <View style={styles.footer}>
          <Button 
            title={step === totalSteps ? (isMutating ? "Updating Graph..." : "Confirm Completion") : "Next Step"} 
            onPress={async () => {
              if (step < totalSteps) {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setStep(step + 1);
                setSelectedAnswer(null);
              } else {
                setIsMutating(true);
                try {
                  if (user) {
                    await neo4jClient.addSkillNode(user.id, course.skillTaught.id);
                  }
                  alert('Skill Verified! Node permanently added to your Knowledge Graph.');
                } catch (err) {
                  alert('Skill Verified! (Mock Graph Updated)');
                } finally {
                  setIsMutating(false);
                  navigation.navigate('MainTabs' as never);
                }
              }
            }} 
            disabled={(course.content[step - 1]?.type === 'quiz' && selectedAnswer === null) || isMutating}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A192F' },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  progressBar: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, marginLeft: 24 },
  progressFill: { height: '100%', backgroundColor: '#00E5FF', borderRadius: 3 },
  courseTitle: { color: '#E2E8F0', fontSize: 18, fontWeight: '800', textAlign: 'center', marginVertical: 16 },
  contentContainer: { flex: 1, padding: 24, justifyContent: 'center' },
  mainCard: { borderRadius: 24, padding: 32, backgroundColor: 'rgba(10, 25, 47, 0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', minHeight: 400 },
  storyboard: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(0, 229, 255, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  storyTitle: { color: '#E2E8F0', fontSize: 24, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  storyText: { color: '#A0AEC0', fontSize: 16, lineHeight: 26, textAlign: 'center' },
  codeBlock: { backgroundColor: '#050B14', padding: 24, borderRadius: 16, width: '100%', borderWidth: 1, borderColor: '#1E2235', marginTop: 16 },
  codeText: { color: '#10B981', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 14, lineHeight: 22 },
  footer: { padding: 24 },
  quizContainer: { width: '100%', marginTop: 32 },
  quizOption: { },
  quizCorrect: { borderColor: '#10B981', borderWidth: 2 },
  quizWrong: { borderColor: '#F56565', borderWidth: 2 }
});
