import { AppText as Text } from './AppText';
import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Pressable,
  Platform,
  Modal as RNModal,
} from 'react-native';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { Radius, Spacing, FontSize } from '@ashok-raj/ui';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
}: ModalProps) {
  const { colors } = useTheme();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.dialog,
            {
              backgroundColor: '#FFFFFF',
              borderColor: '#E2E8F0',
            },
          ]}
        >
          {(title || showCloseButton) && (
            <View style={styles.header}>
              {title ? (
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
              ) : (
                <View />
              )}
              {showCloseButton && (
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onClose();
                  }}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={styles.closeBtn}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Close modal"
                >
                  <X size={18} color="#475569" />
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.body}>{children}</View>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.60)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(6px)',
      },
    }),
  },
  dialog: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '92%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 12,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 10,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#FFFFFF',
  },
});
