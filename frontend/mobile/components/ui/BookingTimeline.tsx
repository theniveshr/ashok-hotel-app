import { AppText as Text } from './AppText';
import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { Calendar, KeyRound, Hotel, LogOut } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from '../../i18n';
import { Radius, Spacing, FontSize } from '@ashok-raj/ui';

export type BookingStep = 'CONFIRMED' | 'CHECKED_IN' | 'STAYING' | 'CHECKED_OUT';

export interface BookingTimelineProps {
  currentStep: BookingStep;
  style?: StyleProp<ViewStyle>;
}

export function BookingTimeline({ currentStep, style }: BookingTimelineProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const steps: { key: BookingStep; labelKey: any; icon: typeof Calendar }[] = [
    { key: 'CONFIRMED', labelKey: 'lodge.bookingConfirmed', icon: Calendar },
    { key: 'CHECKED_IN', labelKey: 'lodge.checkedIn', icon: KeyRound },
    { key: 'STAYING', labelKey: 'lodge.currentStay', icon: Hotel },
    { key: 'CHECKED_OUT', labelKey: 'lodge.checkedOut', icon: LogOut },
  ];

  const stepOrder: BookingStep[] = ['CONFIRMED', 'CHECKED_IN', 'STAYING', 'CHECKED_OUT'];
  const currentIndex = stepOrder.indexOf(currentStep);

  return (
    <View style={[styles.container, style]}>
      {steps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const IconComponent = step.icon;

        return (
          <View key={step.key} style={styles.stepRow}>
            <View style={styles.indicatorCol}>
              <View
                style={[
                  styles.nodeCircle,
                  {
                    backgroundColor: isCompleted ? colors.accent : colors.surfaceElevated,
                    borderColor: isCompleted ? colors.accent : colors.border,
                  },
                ]}
              >
                <IconComponent
                  size={14}
                  color={isCompleted ? colors.textInverse : colors.textTertiary}
                />
              </View>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.connectorLine,
                    {
                      backgroundColor:
                        index < currentIndex ? colors.accent : colors.border,
                    },
                  ]}
                />
              )}
            </View>

            <View style={styles.textCol}>
              <Text
                style={[
                  styles.stepTitle,
                  {
                    color: isCurrent
                      ? colors.accent
                      : isCompleted
                      ? colors.textPrimary
                      : colors.textTertiary,
                    fontWeight: isCurrent ? '700' : isCompleted ? '600' : '400',
                  },
                ]}
              >
                {t(step.labelKey)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 44,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 28,
    marginRight: Spacing.md,
  },
  nodeCircle: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
    marginVertical: 2,
  },
  textCol: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: FontSize.sm + 1,
  },
});
