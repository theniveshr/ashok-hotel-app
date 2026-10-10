import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Radius } from '@ashok-raj/ui';

export interface SkeletonProps {
  width?: number | `${number}%` | 'auto';
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = Radius.md,
  style,
}: SkeletonProps) {
  const { isDark } = useTheme();
  const shimmer = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 0.85,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  return (
    <View
      style={[
        styles.skeletonContainer,
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
            borderRadius,
            opacity: shimmer,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
});
