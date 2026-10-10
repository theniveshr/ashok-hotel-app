import { AppText as Text } from './AppText';
import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { Tag, Copy, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from '../../i18n';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';

export interface OfferCardProps {
  code: string;
  discountText: string;
  discountTextTa?: string;
  description: string;
  descriptionTa?: string;
  validUntil?: string;
  onApply?: (code: string) => void;
  style?: StyleProp<ViewStyle>;
}

export function OfferCard({
  code,
  discountText,
  discountTextTa,
  description,
  descriptionTa,
  validUntil,
  onApply,
  style,
}: OfferCardProps) {
  const { colors } = useTheme();
  const { isTamil } = useTranslation();
  const [copied, setCopied] = React.useState(false);

  const handleApply = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    onApply?.(code);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayDiscount = isTamil && discountTextTa ? discountTextTa : discountText;
  const displayDesc = isTamil && descriptionTa ? descriptionTa : description;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.accent,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={['rgba(37, 99, 235, 0.08)', 'rgba(37, 99, 235, 0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View style={styles.leftColumn}>
          <View style={styles.tagGroup}>
            <Tag size={14} color={colors.accent} />
            <Text style={[styles.discountText, { color: colors.accent }]}>
              {displayDiscount}
            </Text>
          </View>

          <Text
            style={[styles.description, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {displayDesc}
          </Text>

          {validUntil && (
            <Text style={[styles.validity, { color: colors.textTertiary }]}>
              {isTamil ? 'காலாவதி:' : 'Expires:'} {validUntil}
            </Text>
          )}
        </View>

        <View style={styles.rightColumn}>
          <View
            style={[
              styles.codeBox,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.codeText, { color: colors.textPrimary }]}>
              {code}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleApply}
            style={[
              styles.applyBtn,
              {
                backgroundColor: copied ? colors.success : colors.accent,
              },
            ]}
            activeOpacity={0.8}
          >
            {copied ? (
              <Check size={12} color={Palette.white} />
            ) : (
              <Copy size={12} color={colors.textInverse} />
            )}
            <Text
              style={[
                styles.applyText,
                { color: copied ? Palette.white : colors.textInverse },
              ]}
            >
              {copied
                ? isTamil
                  ? 'பயன்பட்டது'
                  : 'Applied'
                : isTamil
                ? 'பயன்படுத்து'
                : 'Apply'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: Spacing.md,
    position: 'relative',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    position: 'relative',
    zIndex: 1,
  },
  leftColumn: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  tagGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  discountText: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  description: {
    fontSize: FontSize.xs + 1,
    lineHeight: 16,
    marginBottom: 4,
  },
  validity: {
    fontSize: 10,
    fontWeight: '500',
  },
  rightColumn: {
    alignItems: 'center',
    gap: 6,
  },
  codeBox: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  applyText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
