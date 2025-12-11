/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F8F9FA',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Primary colors
    primary: '#0a7ea4',
    primaryLight: '#E6F4F8',
    primaryDark: '#086B8A',
    // Secondary colors
    secondary: '#687076',
    secondaryLight: '#9BA1A6',
    // Card & Surface
    card: '#FFFFFF',
    cardBorder: '#E5E7EB',
    // Semantic colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    // Text variations
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    // Borders & Dividers
    border: '#E5E7EB',
    divider: '#F3F4F6',
  },
  dark: {
    text: '#ECEDEE',
    background: '#0F1419',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Primary colors
    primary: '#0a7ea4',
    primaryLight: '#1A3A47',
    primaryDark: '#0D95C0',
    // Secondary colors
    secondary: '#9BA1A6',
    secondaryLight: '#C5C9CE',
    // Card & Surface
    card: '#1A1F26',
    cardBorder: '#2D3748',
    // Semantic colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    // Text variations
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    // Borders & Dividers
    border: '#2D3748',
    divider: '#1F2937',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
