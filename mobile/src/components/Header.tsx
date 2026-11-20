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
  const { colors, isDarkMode, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton} accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.sanskrit }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightContainer}>
        {rightAction}
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.iconButton, { backgroundColor: colors.primaryLight }]}
          accessibilityLabel="Toggle Theme"
        >
          <Ionicons
            name={isDarkMode ? 'sunny' : 'moon'}
            size={20}
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
