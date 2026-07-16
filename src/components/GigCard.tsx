import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Gig, Skill } from '../types';
import SkillBadge from './SkillBadge';
import Button from './Button';

interface Props {
  gig: Gig;
  missingSkills?: Skill[];
  onApply: () => void;
  onSuggestCourse: (skill: Skill) => void;
}

export default function GigCard({ gig, missingSkills = [], onApply, onSuggestCourse }: Props) {
  const isLocked = missingSkills.length > 0;
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.cardContainer}>
      <BlurView intensity={15} tint="dark" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{gig.title}</Text>
            <Text style={styles.company}>{gig.company}</Text>
          </View>
          <View style={styles.bountyContainer}>
            <Animated.View style={[styles.liveIndicator, { opacity: pulseAnim, transform: [{ scale: pulseAnim }] }]} />
            <Text style={styles.bounty}>${(gig.bountyAmount / 100).toFixed(2)}</Text>
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>{gig.description}</Text>
        
        <Text style={styles.sectionTitle}>REQUIRED SKILLS</Text>
        <View style={styles.skillsContainer}>
          {gig.requiredSkills.map(skill => (
            <SkillBadge key={skill.id} skill={skill} />
          ))}
        </View>

        <View style={styles.footer}>
          {isLocked ? (
            <View style={styles.lockedContainer}>
              <Image source={require('../../assets/images/lock.png')} style={styles.lockIcon} />
              <Text style={styles.lockedText}>Missing {missingSkills.length} skill(s)</Text>
              <Button 
                title="Suggest Course" 
                variant="secondary"
                onPress={() => onSuggestCourse(missingSkills[0])} 
                style={styles.actionButton}
              />
            </View>
          ) : (
            <Button 
              title="Apply Now" 
              onPress={onApply} 
              style={styles.fullButton}
            />
          )}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  card: {
    padding: 24,
    backgroundColor: 'rgba(10, 25, 47, 0.6)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  company: {
    fontSize: 14,
    color: '#A0AEC0',
    fontWeight: '500',
  },
  bountyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  bounty: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 15,
  },
  description: {
    color: '#A0AEC0',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#718096',
    letterSpacing: 1,
    marginBottom: 10,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  footer: {
    marginTop: 4,
  },
  lockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 12,
    borderRadius: 12,
  },
  lockIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: '#F56565',
  },
  lockedText: {
    color: '#F56565',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  fullButton: {
    width: '100%',
  }
});
