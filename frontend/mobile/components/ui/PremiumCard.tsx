import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { Radius, Spacing, Elevation } from '@ashok-raj/ui';

export interface PremiumCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'elevated' | 'goldBorder' | 'subtle';
  activeOpacity?: number;
}

export function PremiumCard({
  children,
  style,
  onPress,
  variant = 'elevated',
  activeOpacity = 0.85,
}: PremiumCardProps) {
  const { colors, isDark } = useTheme();

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const isGold = variant === 'goldBorder';

  const cardContent = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isGold ? colors.accent : colors.border,
        },
        Elevation.sm,
        style,
      ]}
    >
      {isGold && (
        <LinearGradient
          colors={['rgba(204, 146, 0, 0.2)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={activeOpacity}
        style={styles.touchable}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  touchable: {
    borderRadius: Radius.lg,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    padding: Spacing.base,
    position: 'relative',
    zIndex: 1,
  },
});
