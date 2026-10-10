import { AppText as Text } from '../components/ui/AppText';
import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from '../i18n';
import { BUSINESS } from '@ashok-raj/config';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';

export interface SplashScreenProps {
  onFinish?: () => void;
}

/**
 * SplashScreen — Premium light mode brand entry.
 * White/blue gradient with cobalt monogram.
 */
export function SplashScreen({ onFinish }: SplashScreenProps) {
  const { isTamil } = useTranslation();

  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    const timer = setTimeout(() => {
      onFinish?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Light blue-to-white gradient background */}
      <LinearGradient
        colors={[Palette.blue50, '#FFFFFF', Palette.blue50]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        {/* Blue monogram ring */}
        <View style={styles.logoRing}>
          <View style={styles.logoGradient}>
            <Text style={styles.logoMonogram}>AR</Text>
          </View>
        </View>

        <Text style={styles.title}>{BUSINESS.name}</Text>
        <Text style={styles.subtitle}>{BUSINESS.nameTa}</Text>

        <View style={styles.taglineBox}>
          <Text style={styles.tagline}>
            {isTamil
              ? 'தங்கி, சாப்பிட்டு, இளைப்பாறுங்கள்'
              : 'Lodge, Dine & Unwind'}
          </Text>
        </View>

        <Text style={styles.location}>
          Kalaiyarkoil, Tamil Nadu
        </Text>

        {/* Loading indicator */}
        <View style={styles.dotsRow}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === 0 ? Palette.blue700 : Palette.blue300 },
              ]}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoRing: {
    width: 104,
    height: 104,
    borderRadius: Radius.full,
    padding: 4,
    backgroundColor: Palette.blue200,
    marginBottom: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Palette.blue700,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoMonogram: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 2,
  },
  title: {
    color: Palette.slate900,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: Palette.blue700,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  taglineBox: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Palette.blue100,
    borderWidth: 1,
    borderColor: Palette.blue200,
    marginBottom: Spacing.xl,
  },
  tagline: {
    color: Palette.blue700,
    fontSize: FontSize.xs + 1,
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  location: {
    color: '#64748B',
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginBottom: Spacing['2xl'],
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
});
