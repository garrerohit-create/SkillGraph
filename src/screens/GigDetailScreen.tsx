import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { Button, SkillBadge } from '../components';

type GigDetailRouteProp = RouteProp<RootStackParamList, 'GigDetail'>;

export default function GigDetailScreen() {
  const route = useRoute<GigDetailRouteProp>();
  const navigation = useNavigation<any>();
  const { gig, missingSkills } = route.params;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050B14', '#0A192F', '#050B14']} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#00E5FF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gig Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <BlurView intensity={20} tint="dark" style={styles.mainCard}>
              <View style={styles.companyRow}>
              <View style={styles.companyAvatar}><Text style={styles.companyInitial}>{gig.company.charAt(0)}</Text></View>
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>{gig.company}</Text>
                
                {/* Trust Score / Digital Economy UI */}
                <View style={styles.trustBadge}>
                  <Feather name="shield" size={12} color="#10B981" />
                  <Text style={styles.trustText}>Payment Verified • 98% Rating</Text>
                </View>

              </View>
            </View>

            <Text style={styles.title}>{gig.title}</Text>
            
            <View style={styles.bountyRow}>
              <Text style={styles.bountyValue}>${(gig.bountyAmount / 100).toLocaleString()}</Text>
              <Text style={styles.deadline}>Due {gig.deadline}</Text>
            </View>
            
            <Text style={styles.description}>{gig.description}</Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Required Nodes</Text>
            <View style={styles.skillsRow}>
              {gig.requiredSkills.map(skill => (
                <SkillBadge key={skill.id} skill={{...skill, verified: !missingSkills?.find(s => s.id === skill.id)}} />
              ))}
            </View>
            
            {missingSkills && missingSkills.length > 0 && (
              <View style={styles.warningBox}>
                <Feather name="alert-circle" size={18} color="#F56565" style={{ marginRight: 8 }} />
                <Text style={styles.warningText}>You are missing {missingSkills.length} required skill node(s).</Text>
              </View>
            )}

            <View style={{ marginTop: 24 }}>
              <Button 
                title={missingSkills && missingSkills.length > 0 ? "Identify Skill Gap" : "Submit Application"} 
                onPress={() => {
                  if (missingSkills && missingSkills.length > 0) {
                    navigation.navigate('SkillGapAnalysis', { gig, missingSkills });
                  } else {
                    alert('Application submitted successfully!');
                    navigation.goBack();
                  }
                }} 
              />
            </View>
          </BlurView>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A192F' },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16 },
  headerTitle: { color: '#E2E8F0', fontSize: 18, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40 },
  mainCard: { borderRadius: 24, padding: 24, backgroundColor: 'rgba(10, 25, 47, 0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  companyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  companyAvatar: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(0, 229, 255, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  companyInitial: { color: '#00E5FF', fontSize: 24, fontWeight: '800' },
  companyInfo: { flex: 1 },
  companyName: { color: '#A0AEC0', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  trustBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  trustText: { color: '#10B981', fontSize: 11, fontWeight: '700', marginLeft: 6 },
  title: { fontSize: 28, fontWeight: '800', color: '#E2E8F0', letterSpacing: -0.5, marginBottom: 16 },
  bountyRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 },
  bountyValue: { color: '#10B981', fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  deadline: { color: '#718096', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  description: { color: '#A0AEC0', fontSize: 16, lineHeight: 24, marginBottom: 24 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 24 },
  sectionTitle: { color: '#E2E8F0', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
  warningBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 101, 101, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(245, 101, 101, 0.2)' },
  warningText: { color: '#F56565', fontSize: 14, fontWeight: '600' }
});
