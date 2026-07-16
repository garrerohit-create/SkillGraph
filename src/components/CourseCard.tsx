import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { MicroCourse } from '../types';
import Button from './Button';
import SkillBadge from './SkillBadge';

const { width } = Dimensions.get('window');

interface Props {
  course: MicroCourse;
  onStart: () => void;
}

export default function CourseCard({ course, onStart }: Props) {
  return (
    <View style={styles.cardContainer}>
      <BlurView intensity={20} tint="dark" style={styles.card}>
        <View style={styles.imagePlaceholder}>
          {course.id === 'c1' ? (
             <Image source={require('../../assets/images/solidity.png')} style={styles.image} />
          ) : course.id === 'c2' ? (
             <Image source={require('../../assets/images/react_native.png')} style={styles.image} />
          ) : course.id === 'c3' ? (
             <Image source={require('../../assets/images/neo4j.png')} style={styles.image} />
          ) : course.id === 'c4' ? (
             <Image source={require('../../assets/images/ai_core.png')} style={styles.image} />
          ) : course.id === 'c5' ? (
             <Image source={require('../../assets/images/zk_proofs.png')} style={styles.image} />
          ) : course.thumbnailUrl ? (
             <Image source={{ uri: course.thumbnailUrl }} style={styles.image} />
          ) : (
             <View style={styles.noImageIcon} />
          )}
        </View>
        
        <View style={styles.content}>
          <View style={styles.skillRow}>
            <SkillBadge skill={course.skillTaught} />
            <Text style={styles.duration}>{course.durationMinutes} min read</Text>
          </View>

          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.description}>{course.description}</Text>
          
          <View style={styles.rewards}>
            <View style={styles.rewardPill}>
              <Text style={styles.rewardText}>+{course.xpReward} XP</Text>
            </View>
            <View style={[styles.rewardPill, styles.tokenPill]}>
              <Text style={styles.tokenText}>+${(course.tokenReward / 100).toFixed(2)}</Text>
            </View>
          </View>

          <Button title="Start Mission" onPress={onStart} />
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: width - 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  card: {
    backgroundColor: 'rgba(10, 25, 47, 0.5)',
  },
  imagePlaceholder: {
    height: 180,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImageIcon: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 32,
  },
  content: {
    padding: 24,
  },
  skillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  duration: {
    color: '#A0AEC0',
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#A0AEC0',
    lineHeight: 22,
    marginBottom: 24,
  },
  rewards: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  rewardPill: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  rewardText: {
    color: '#00E5FF',
    fontWeight: '700',
    fontSize: 13,
  },
  tokenPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  tokenText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 13,
  }
});
