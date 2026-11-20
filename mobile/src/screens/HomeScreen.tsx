import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Chapter, Verse, Translation } from '../types/gita';
import { getChapters, getDailyShloka } from '../services/db';
import { useTheme } from '../context/ThemeContext';
import { useAudio } from '../context/AudioContext';

interface HomeScreenProps {
  onSelectChapter: (chapterNumber: number) => void;
  onSelectVerse: (chapterNumber: number, verseNumber: number) => void;
  onOpenSearch: () => void;
  onOpenBookmarks: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectChapter,
  onSelectVerse,
  onOpenSearch,
  onOpenBookmarks,
}) => {
  const { colors, preferredLang, fontSizeMultiplier } = useTheme();
  const { playVerse } = useAudio();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [dailyVerse, setDailyVerse] = useState<{ verse: Verse; translation: Translation | null } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [chList, daily] = await Promise.all([
        getChapters(),
        getDailyShloka(),
      ]);
      setChapters(chList);
      setDailyVerse(daily);
    } catch (error) {
      console.error('Error loading Gita data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderDailyCard = () => {
    if (!dailyVerse) return null;
    const { verse, translation } = dailyVerse;

    return (
      <View style={[styles.dailyCard, { backgroundColor: colors.cardBackground, borderColor: colors.primaryLight }]}>
        <View style={styles.dailyHeaderRow}>
          <View style={[styles.dailyTag, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="sparkles" size={14} color={colors.primary} />
            <Text style={[styles.dailyTagText, { color: colors.primary }]}>SHLOKA OF THE DAY</Text>
          </View>
          <Text style={[styles.dailyVerseRef, { color: colors.textSecondary }]}>
            Ch {verse.chapter_number} : V {verse.verse_number}
          </Text>
        </View>

        <Text
          style={[
            styles.dailySanskrit,
            { color: colors.sanskrit, fontSize: 16 * fontSizeMultiplier },
          ]}
          numberOfLines={3}
        >
          {verse.text}
        </Text>

        {translation && (
          <Text
            style={[
              styles.dailyTranslation,
              { color: colors.textSecondary, fontSize: 14 * fontSizeMultiplier },
            ]}
            numberOfLines={3}
          >
            "{translation.description}"
          </Text>
        )}

        <View style={styles.dailyActionsRow}>
          <TouchableOpacity
            style={[styles.dailyButton, { backgroundColor: colors.primaryLight }]}
            onPress={() => playVerse(verse.chapter_number, verse.verse_number)}
          >
            <Ionicons name="volume-medium" size={16} color={colors.primary} />
            <Text style={[styles.dailyButtonText, { color: colors.primary }]}>Listen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dailyButtonPrimary, { backgroundColor: colors.primary }]}
            onPress={() => onSelectVerse(verse.chapter_number, verse.verse_number)}
          >
            <Text style={styles.dailyButtonPrimaryText}>Read & Commentaries</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderChapterItem = ({ item }: { item: Chapter }) => {
    return (
      <TouchableOpacity
        style={[styles.chapterCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
        onPress={() => onSelectChapter(item.chapter_number)}
        activeOpacity={0.7}
      >
        <View style={[styles.chapterNumberBadge, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.chapterNumberText, { color: colors.primary }]}>{item.chapter_number}</Text>
        </View>

        <View style={styles.chapterInfo}>
          <View style={styles.chapterTitleRow}>
            <Text style={[styles.sanskritName, { color: colors.sanskrit }]}>{item.name}</Text>
            <Text style={[styles.versesCountBadge, { color: colors.textMuted }]}>
              {item.verses_count} Verses
            </Text>
          </View>

          <Text style={[styles.transliteratedName, { color: colors.textPrimary }]} numberOfLines={1}>
            {item.name_transliterated}
          </Text>

          <Text style={[styles.translationName, { color: colors.textSecondary }]} numberOfLines={1}>
            {preferredLang === 'hindi' && item.chapter_summary_hindi ? item.name_meaning : item.name_translation}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading Sacred Verses...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={chapters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderChapterItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View>
            {/* Top Invocation Header */}
            <View style={styles.invocationBanner}>
              <Text style={[styles.invocationText, { color: colors.sanskrit }]}>
                ॥ ॐ श्री परमात्मने नमः ॥
              </Text>
              <Text style={[styles.tagline, { color: colors.textSecondary }]}>
                The Complete Bhagavad Gita • Offline Sanctuary
              </Text>
            </View>

            {/* Daily Verse Card */}
            {renderDailyCard()}

            {/* Quick Action Navigation Bar */}
            <View style={styles.quickNavRow}>
              <TouchableOpacity
                style={[styles.quickNavButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                onPress={onOpenSearch}
              >
                <Ionicons name="search" size={18} color={colors.primary} />
                <Text style={[styles.quickNavText, { color: colors.textPrimary }]}>Search Gita</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickNavButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                onPress={onOpenBookmarks}
              >
                <Ionicons name="bookmark" size={18} color={colors.primary} />
                <Text style={[styles.quickNavText, { color: colors.textPrimary }]}>Saved Verses</Text>
              </TouchableOpacity>
            </View>

            {/* Section Title */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>18 Chapters (अध्यायाः)</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>701 Verses Total</Text>
            </View>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  invocationBanner: {
    alignItems: 'center',
    marginVertical: 12,
  },
  invocationText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  tagline: {
    fontSize: 13,
    marginTop: 4,
  },
  dailyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginVertical: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  dailyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dailyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  dailyTagText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dailyVerseRef: {
    fontSize: 12,
    fontWeight: '600',
  },
  dailySanskrit: {
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  dailyTranslation: {
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 14,
    textAlign: 'center',
  },
  dailyActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    gap: 12,
  },
  dailyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  dailyButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dailyButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  dailyButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  quickNavRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  quickNavButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    elevation: 1,
  },
  quickNavText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    elevation: 1,
  },
  chapterNumberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chapterNumberText: {
    fontSize: 16,
    fontWeight: '700',
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  sanskritName: {
    fontSize: 16,
    fontWeight: '700',
  },
  versesCountBadge: {
    fontSize: 11,
    fontWeight: '500',
  },
  transliteratedName: {
    fontSize: 14,
    fontWeight: '600',
  },
  translationName: {
    fontSize: 12,
    marginTop: 2,
  },
});
