import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
}) => {
  const { colors, isDarkMode, toggleTheme, preferredLang, setPreferredLang } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          borderBottomColor: colors.borderSubtle,
        },
      ]}
    >
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity
            onPress={onBack}
            style={[styles.backButton, { backgroundColor: colors.pillBg }]}
            activeOpacity={0.7}
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.sanskritSubtle }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightContainer}>
        {rightAction}

        {/* Language Quick Switcher */}
        <TouchableOpacity
          onPress={() => setPreferredLang(preferredLang === 'english' ? 'hindi' : 'english')}
          style={[styles.actionBtn, { backgroundColor: colors.pillBg }]}
          activeOpacity={0.7}
          accessibilityLabel="Switch Language"
        >
          <Text style={[styles.langText, { color: colors.primary }]}>
            {preferredLang === 'english' ? 'हिं' : 'EN'}
          </Text>
        </TouchableOpacity>

        {/* Theme Mode Toggle */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.actionBtn, { backgroundColor: colors.pillBg }]}
          activeOpacity={0.7}
          accessibilityLabel="Toggle Theme"
        >
          <Ionicons
            name={isDarkMode ? 'sunny' : 'moon'}
            size={18}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
