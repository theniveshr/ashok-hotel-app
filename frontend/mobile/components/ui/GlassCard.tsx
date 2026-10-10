import React from 'react';
import { StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { Radius, Spacing, Elevation } from '@ashok-raj/ui';

export interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  intensity?: number;
  bordered?: boolean;
  padding?: number;
  blueTint?: boolean;
}

/**
 * GlassCard — white glass surface for premium content panels.
 * Always light mode. Background: rgba(255,255,255,0.82) with subtle blur.
 */
export function GlassCard({
  children,
  style,
  contentStyle,
  intensity = 25,
  bordered = true,
  padding = Spacing.base,
  blueTint = false,
}: GlassCardProps) {
  return (
    <View
      style={[
        styles.container,
        {
          borderColor: bordered ? 'rgba(226, 232, 240, 0.95)' : 'transparent',
          backgroundColor: blueTint
            ? 'rgba(239, 246, 255, 0.96)'
            : 'rgba(255, 255, 255, 0.96)',
        },
        Elevation.sm,
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint="light"
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.content, { padding }, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
