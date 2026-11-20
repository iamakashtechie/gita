import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Chapter, Verse } from '../types/gita';
import { getChapter, getVersesByChapter } from '../services/db';
import { useTheme } from '../context/ThemeContext';
import { useAudio } from '../context/AudioContext';

interface ChapterScreenProps {
  chapterNumber: number;
  onBack: () => void;
  onSelectVerse: (chapterNumber: number, verseNumber: number) => void;
}

export const ChapterScreen: React.FC<ChapterScreenProps> = ({
  chapterNumber,
  onBack,
  onSelectVerse,
}) => {
  const { colors, fontSizeMultiplier, preferredLang } = useTheme();
  const { playVerse, currentTrack, isPlaying } = useAudio();

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showHindiSummary, setShowHindiSummary] = useState<boolean>(preferredLang === 'hindi');
  const [isSummaryExpanded, setIsSummaryExpanded] = useState<boolean>(false);

  useEffect(() => {
    async function fetchChapterData() {
      try {
        setLoading(true);
        const [ch, vList] = await Promise.all([
          getChapter(chapterNumber),
          getVersesByChapter(chapterNumber),
        ]);
        setChapter(ch);
        setVerses(vList);
      } catch (err) {
        console.error('Failed to load chapter verses:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchChapterData();
  }, [chapterNumber]);

  if (loading || !chapter) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderVerseCard = ({ item }: { item: Verse }) => {
    const isThisPlaying =
      isPlaying &&
      currentTrack?.chapterNumber === item.chapter_number &&
      currentTrack?.verseNumber === item.verse_number;

    return (
      <TouchableOpacity
        style={[
          styles.verseCard,
          {
            backgroundColor: isThisPlaying ? colors.primaryLight : colors.cardBackground,
            borderColor: isThisPlaying ? colors.primary : colors.border,
            shadowColor: '#000',
          },
        ]}
        onPress={() => onSelectVerse(item.chapter_number, item.verse_number)}
        activeOpacity={0.7}
      >
        <View style={styles.verseHeaderRow}>
          <View
            style={[
              styles.verseBadge,
              { backgroundColor: isThisPlaying ? colors.primary : colors.pillBg },
            ]}
          >
            <Text
              style={[
                styles.verseBadgeText,
                { color: isThisPlaying ? '#FFFFFF' : colors.primary },
              ]}
            >
              Shloka {item.verse_number}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.audioIconBtn,
              { backgroundColor: isThisPlaying ? colors.primary : colors.primaryLight },
            ]}
            onPress={() => playVerse(item.chapter_number, item.verse_number)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isThisPlaying ? 'pause' : 'volume-high'}
              size={17}
              color={isThisPlaying ? '#FFFFFF' : colors.primary}
            />
          </TouchableOpacity>
        </View>

        <Text
          style={[
            styles.sanskritPreview,
            { color: colors.sanskrit, fontSize: 16 * fontSizeMultiplier },
          ]}
          numberOfLines={2}
        >
          {item.text}
        </Text>

        <Text
          style={[styles.transliterationPreview, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.transliteration}
        </Text>
      </TouchableOpacity>
    );
  };

  const summaryText =
    showHindiSummary && chapter.chapter_summary_hindi
      ? chapter.chapter_summary_hindi
      : chapter.chapter_summary;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={verses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderVerseCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            {/* Top Chapter Hero Card */}
            <View
              style={[
                styles.chapterHeroCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  shadowColor: '#000',
                },
              ]}
            >
              <View style={[styles.chapterTagPill, { backgroundColor: colors.goldLight }]}>
                <Text style={[styles.chapterTagText, { color: colors.primary }]}>
                  CHAPTER {chapter.chapter_number < 10 ? `0${chapter.chapter_number}` : chapter.chapter_number}
                </Text>
              </View>

              <Text style={[styles.sanskritTitle, { color: colors.sanskrit }]}>
                {chapter.name}
              </Text>
              <Text style={[styles.transliteratedTitle, { color: colors.textPrimary }]}>
                {chapter.name_transliterated}
              </Text>
              <Text style={[styles.meaningText, { color: colors.textSecondary }]}>
                "{chapter.name_translation}"
              </Text>

              {/* Play All Chapter Button */}
              <TouchableOpacity
                style={[styles.playAllButton, { backgroundColor: colors.primary }]}
                onPress={() => playVerse(chapter.chapter_number, 1)}
                activeOpacity={0.8}
              >
                <Ionicons name="play" size={17} color="#FFFFFF" />
                <Text style={styles.playAllText}>
                  Recite Entire Chapter ({chapter.verses_count} Shlokas)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Summary Card with Segmented Lang Selector */}
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  shadowColor: '#000',
                },
              ]}
            >
              <View style={styles.summaryTopRow}>
                <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>
                  Chapter Overview
                </Text>
                <View style={[styles.langSegment, { backgroundColor: colors.pillBg }]}>
                  <TouchableOpacity
                    style={[
                      styles.langSegmentBtn,
                      !showHindiSummary && { backgroundColor: colors.cardBackground },
                    ]}
                    onPress={() => setShowHindiSummary(false)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.langSegmentText,
                        { color: !showHindiSummary ? colors.primary : colors.textMuted },
                      ]}
                    >
                      English
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.langSegmentBtn,
                      showHindiSummary && { backgroundColor: colors.cardBackground },
                    ]}
                    onPress={() => setShowHindiSummary(true)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.langSegmentText,
                        { color: showHindiSummary ? colors.primary : colors.textMuted },
                      ]}
                    >
                      हिन्दी
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text
                style={[styles.summaryContent, { color: colors.textSecondary }]}
                numberOfLines={isSummaryExpanded ? undefined : 4}
              >
                {summaryText}
              </Text>

              <TouchableOpacity
                onPress={() => setIsSummaryExpanded(!isSummaryExpanded)}
                style={styles.expandButton}
                activeOpacity={0.7}
              >
                <Text style={[styles.expandText, { color: colors.primary }]}>
                  {isSummaryExpanded ? 'Show Less ▲' : 'Read Full Overview ▼'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.versesListHeader}>
              <View>
                <Text style={[styles.versesListTitle, { color: colors.textPrimary }]}>
                  Verses
                </Text>
                <Text style={[styles.versesListSub, { color: colors.sanskritSubtle }]}>
                  श्लोकाः (1 - {chapter.verses_count})
                </Text>
              </View>
              <View style={[styles.versePillCount, { backgroundColor: colors.pillBg }]}>
                <Text style={[styles.versePillCountText, { color: colors.textSecondary }]}>
                  {chapter.verses_count} Total
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
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerBlock: {
    marginBottom: 8,
  },
  chapterHeroCard: {
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  chapterTagPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 8,
  },
  chapterTagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  sanskritTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  transliteratedTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  meaningText: {
    fontSize: 13.5,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: 16,
    gap: 8,
    elevation: 2,
    shadowColor: '#C25E00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  playAllText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  summaryCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    marginBottom: 14,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  langSegment: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  langSegmentBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  langSegmentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryContent: {
    fontSize: 13.5,
    lineHeight: 21,
  },
  expandButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  expandText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  versesListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  versesListTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  versesListSub: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  versePillCount: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  versePillCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  verseCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  verseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  verseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  verseBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  audioIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sanskritPreview: {
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 6,
  },
  transliterationPreview: {
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
});
