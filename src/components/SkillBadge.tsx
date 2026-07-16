import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Skill } from '../types';

interface Props {
  skill: Skill;
}

export default function SkillBadge({ skill }: Props) {
  const getColors = () => {
    switch(skill.level) {
      case 'beginner': 
        return { bg: 'rgba(255,255,255,0.05)', text: '#A0AEC0', border: 'rgba(255,255,255,0.1)' };
      case 'intermediate': 
        return { bg: 'rgba(0, 229, 255, 0.1)', text: '#00E5FF', border: 'rgba(0, 229, 255, 0.2)' };
      case 'advanced': 
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', border: 'rgba(16, 185, 129, 0.2)' };
      default: 
        return { bg: 'rgba(255,255,255,0.05)', text: '#A0AEC0', border: 'rgba(255,255,255,0.1)' };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[styles.text, { color: colors.text }]}>{skill.name}</Text>
      {skill.verified && <View style={[styles.verifiedDot, { backgroundColor: colors.text, shadowColor: colors.text }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  verifiedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  }
});
