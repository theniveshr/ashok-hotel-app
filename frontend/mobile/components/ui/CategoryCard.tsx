import { AppText as Text } from './AppText';
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from '../../i18n';
import { Radius, Spacing, FontSize } from '@ashok-raj/ui';

export interface CategoryCardProps {
  id: string;
  name: string;
  nameTa: string;
  isSelected?: boolean;
  onPress: () => void;
  count?: number;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function CategoryCard({
  name,
  nameTa,
  isSelected = false,
  onPress,
  count,
  icon,
  style,
}: CategoryCardProps) {
  const { colors } = useTheme();
  const { isTamil } = useTranslation();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const displayName = isTamil ? nameTa : name;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.75}
      style={[
        styles.container,
        {
          backgroundColor: isSelected ? colors.accent : colors.surface,
          borderColor: isSelected ? colors.accent : colors.border,
        },
        style,
      ]}
    >
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text
        style={[
          styles.title,
          {
            color: isSelected ? colors.textInverse : colors.textPrimary,
            fontWeight: isSelected ? '700' : '500',
          },
        ]}
      >
        {displayName}
      </Text>
      {count !== undefined && (
        <View
          style={[
            styles.countBadge,
            {
              backgroundColor: isSelected
                ? 'rgba(0,0,0,0.15)'
                : colors.surfaceElevated,
            },
          ]}
        >
          <Text
            style={[
              styles.countText,
              {
                color: isSelected ? colors.textInverse : colors.textSecondary,
              },
            ]}
          >
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
    gap: 6,
  },
  iconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.sm + 1,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.full,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
