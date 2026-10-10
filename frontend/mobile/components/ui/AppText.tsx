import React from 'react';
import {
  Platform,
  Text as RNText,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';

export interface AppTextProps extends RNTextProps {
  style?: RNTextProps['style'];
}

/**
 * Application-wide text primitive.
 * Enforces crisp, solid typography and high-contrast dark text rendering.
 */
export function AppText({ style, ...props }: AppTextProps) {
  return (
    <RNText
      {...props}
      style={[
        {
          color: '#0F172A',
          ...Platform.select({
            ios: { fontFamily: 'System' },
            android: { fontFamily: 'sans-serif' },
            default: { fontFamily: 'sans-serif' },
          }),
        } as TextStyle,
        style,
      ]}
    />
  );
}

export default AppText;
