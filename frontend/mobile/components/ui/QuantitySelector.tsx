import { AppText as Text } from './AppText';
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { Radius, Spacing, FontSize } from '@ashok-raj/ui';

export interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export function QuantitySelector({
  quantity,
  onIncrement,
  onDecrement,
  min = 0,
  max = 99,
  size = 'md',
  style,
}: QuantitySelectorProps) {
  const { colors } = useTheme();

  const handleIncrement = () => {
    if (quantity < max) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onIncrement();
    }
  };

  const handleDecrement = () => {
    if (quantity > min) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDecrement();
    }
  };

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          height: isSmall ? 32 : 40,
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={handleDecrement}
        disabled={quantity <= min}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={[
          styles.button,
          {
            width: isSmall ? 32 : 40,
            opacity: quantity <= min ? 0.3 : 1,
          },
        ]}
        activeOpacity={0.7}
      >
        <Minus size={isSmall ? 14 : 16} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.valueWrap}>
        <Text
          style={[
            styles.valueText,
            {
              color: colors.textPrimary,
              fontSize: isSmall ? FontSize.xs + 2 : FontSize.sm + 2,
            },
          ]}
        >
          {quantity}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleIncrement}
        disabled={quantity >= max}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={[
          styles.button,
          {
            width: isSmall ? 32 : 40,
            opacity: quantity >= max ? 0.3 : 1,
          },
        ]}
        activeOpacity={0.7}
      >
        <Plus size={isSmall ? 14 : 16} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    overflow: 'hidden',
  },
  button: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueWrap: {
    paddingHorizontal: Spacing.sm,
    minWidth: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    fontWeight: '700',
  },
});
