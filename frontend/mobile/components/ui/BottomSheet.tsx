import { AppText as Text } from './AppText';
import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Pressable,
  Modal as RNModal,
  Dimensions
} from 'react-native';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { Radius, Spacing, FontSize, Elevation } from '@ashok-raj/ui';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: number;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  maxHeight = SCREEN_HEIGHT * 0.75,
}: BottomSheetProps) {
  const { colors, isDark } = useTheme();

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [visible]);

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            {
              maxHeight,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            Elevation.xl,
          ]}
        >
          {/* Drag Handle Indicator */}
          <View style={styles.handleContainer}>
            <View
              style={[
                styles.handle,
                { backgroundColor: colors.borderStrong },
              ]}
            />
          </View>

          {/* Header */}
          {title && (
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {title}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={[
                  styles.closeBtn,
                  { backgroundColor: colors.surfaceElevated },
                ]}
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  sheet: {
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
});
