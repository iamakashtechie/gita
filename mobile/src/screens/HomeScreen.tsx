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
      <View
        style={[
          styles.dailyCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            shadowColor: '#000',
          },
        ]}
      >
        <View style={styles.dailyHeaderRow}>
          <View style={[styles.dailyTagPill, { backgroundColor: colors.goldLight }]}>
            <Ionicons name="sparkles" size={13} color={colors.primary} />
            <Text style={[styles.dailyTagText, { color: colors.primary }]}>SHLOKA OF THE DAY</Text>
          </View>
          <View style={[styles.refPill, { backgroundColor: colors.pillBg }]}>
            <Text style={[styles.dailyVerseRef, { color: colors.textSecondary }]}>
              Chapter {verse.chapter_number} • Verse {verse.verse_number}
            </Text>
          </View>
        </View>

        {/* Sanskrit Shloka Quote */}
        <View style={styles.quoteBox}>
          <Text
            style={[
              styles.dailySanskrit,
              { color: colors.sanskrit, fontSize: 17 * fontSizeMultiplier },
            ]}
          >
            {verse.text}
          </Text>
        </View>

        {translation && (
          <Text
            style={[
              styles.dailyTranslation,
              { color: colors.textSecondary, fontSize: 13.5 * fontSizeMultiplier },
            ]}
            numberOfLines={3}
          >
            "{translation.description}"
          </Text>
        )}

        <View style={styles.dailyActionsRow}>
          <TouchableOpacity
            style={[styles.dailyListenBtn, { backgroundColor: colors.primaryLight }]}
            onPress={() => playVerse(verse.chapter_number, verse.verse_number)}
            activeOpacity={0.7}
          >
            <Ionicons name="volume-high" size={16} color={colors.primary} />
            <Text style={[styles.dailyListenText, { color: colors.primary }]}>Listen Recitation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dailyReadBtn, { backgroundColor: colors.primary }]}
            onPress={() => onSelectVerse(verse.chapter_number, verse.verse_number)}
            activeOpacity={0.8}
          >
            <Text style={styles.dailyReadText}>Explore</Text>
            <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderChapterItem = ({ item }: { item: Chapter }) => {
    const formattedNumber = item.chapter_number < 10 ? `0${item.chapter_number}` : `${item.chapter_number}`;

    return (
      <TouchableOpacity
        style={[
          styles.chapterCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            shadowColor: '#000',
          },
        ]}
        onPress={() => onSelectChapter(item.chapter_number)}
        activeOpacity={0.7}
      >
        <View style={[styles.chapterNumberBadge, { backgroundColor: colors.pillBg }]}>
          <Text style={[styles.chapterNumberText, { color: colors.primary }]}>{formattedNumber}</Text>
        </View>

        <View style={styles.chapterInfo}>
          <View style={styles.chapterTitleRow}>
            <Text style={[styles.sanskritName, { color: colors.sanskrit }]}>{item.name}</Text>
            <View style={[styles.verseCountPill, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.verseCountText, { color: colors.primary }]}>
                {item.verses_count} Verses
              </Text>
            </View>
          </View>

          <Text style={[styles.transliteratedName, { color: colors.textPrimary }]} numberOfLines={1}>
            {item.name_transliterated}
          </Text>

          <Text style={[styles.translationName, { color: colors.textSecondary }]} numberOfLines={1}>
            {preferredLang === 'hindi' && item.chapter_summary_hindi ? item.name_meaning : item.name_translation}
          </Text>
        </View>

        <View style={styles.chevronBox}>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
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
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View>
            {/* Top Invocation Emblem */}
            <View style={styles.invocationBanner}>
              <Text style={[styles.invocationText, { color: colors.sanskrit }]}>
                ॥ ॐ श्री परमात्मने नमः ॥
              </Text>
              <Text style={[styles.tagline, { color: colors.textMuted }]}>
                DIVINE SONG OF GOD • 18 CHAPTERS • 701 VERSES
              </Text>
            </View>

            {/* Daily Verse Card */}
            {renderDailyCard()}

            {/* Quick Action Navigation Tiles */}
            <View style={styles.quickNavRow}>
              <TouchableOpacity
                style={[
                  styles.quickNavTile,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    shadowColor: '#000',
                  },
                ]}
                onPress={onOpenSearch}
                activeOpacity={0.7}
              >
                <View style={[styles.quickNavIconBox, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="search" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.quickNavTitle, { color: colors.textPrimary }]}>Search Gita</Text>
                  <Text style={[styles.quickNavDesc, { color: colors.textMuted }]}>Topics & Sanskrit words</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickNavTile,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    shadowColor: '#000',
                  },
                ]}
                onPress={onOpenBookmarks}
                activeOpacity={0.7}
              >
                <View style={[styles.quickNavIconBox, { backgroundColor: colors.goldLight }]}>
                  <Ionicons name="bookmark" size={18} color={colors.gold} />
                </View>
                <View>
                  <Text style={[styles.quickNavTitle, { color: colors.textPrimary }]}>Saved Verses</Text>
                  <Text style={[styles.quickNavDesc, { color: colors.textMuted }]}>Bookmarks & notes</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Section Title */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Divine Discourses</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.sanskritSubtle }]}>अध्यायाः (1 - 18)</Text>
              </View>
              <View style={[styles.allVersesCountBadge, { backgroundColor: colors.pillBg }]}>
                <Text style={[styles.allVersesCountText, { color: colors.textSecondary }]}>
                  701 Shlokas
                </Text>
              </View>
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
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  invocationBanner: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  invocationText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  dailyCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  dailyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dailyTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  dailyTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  refPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  dailyVerseRef: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  quoteBox: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  dailySanskrit: {
    fontWeight: '800',
    lineHeight: 28,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  dailyTranslation: {
    lineHeight: 21,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  dailyActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 10,
  },
  dailyListenBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  dailyListenText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dailyReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    gap: 6,
  },
  dailyReadText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  quickNavRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  quickNavTile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  quickNavIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickNavTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  quickNavDesc: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  allVersesCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  allVersesCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  chapterNumberBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chapterNumberText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  sanskritName: {
    fontSize: 16,
    fontWeight: '800',
  },
  verseCountPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  verseCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  transliteratedName: {
    fontSize: 13.5,
    fontWeight: '600',
    marginBottom: 2,
  },
  translationName: {
    fontSize: 12,
  },
  chevronBox: {
    marginLeft: 6,
  },
});
