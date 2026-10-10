import React from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Search, X, SlidersHorizontal } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from '../../i18n';
import { Radius, Spacing, FontSize } from '@ashok-raj/ui';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  showFilter?: boolean;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder,
  onFilterPress,
  showFilter = false,
  autoFocus = false,
  style,
}: SearchBarProps) {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const defaultPlaceholder = placeholder ?? t('common.search');

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? colors.surface : colors.surfaceElevated,
            borderColor: colors.border,
          },
        ]}
      >
        <Search size={18} color={colors.textTertiary} style={styles.searchIcon} />
        
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={defaultPlaceholder}
          placeholderTextColor={colors.textTertiary}
          autoFocus={autoFocus}
          style={[
            styles.input,
            {
              color: colors.textPrimary,
            },
          ]}
          returnKeyType="search"
        />

        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.clearBtn}
          >
            <X size={14} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {showFilter && (
        <TouchableOpacity
          onPress={onFilterPress}
          style={[
            styles.filterBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          activeOpacity={0.8}
        >
          <SlidersHorizontal size={18} color={colors.accent} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 46,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.sm + 1,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: Radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
