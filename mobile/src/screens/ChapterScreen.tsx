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
          },
        ]}
        onPress={() => onSelectVerse(item.chapter_number, item.verse_number)}
        activeOpacity={0.7}
      >
        <View style={styles.verseHeaderRow}>
          <View style={[styles.verseBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.verseBadgeText}>
              {item.chapter_number}.{item.verse_number}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.audioIconBtn, { backgroundColor: colors.primaryLight }]}
            onPress={() => playVerse(item.chapter_number, item.verse_number)}
          >
            <Ionicons
              name={isThisPlaying ? 'pause' : 'volume-medium'}
              size={18}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        <Text
          style={[
            styles.sanskritPreview,
            { color: colors.sanskrit, fontSize: 15 * fontSizeMultiplier },
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

  const summaryText = showHindiSummary && chapter.chapter_summary_hindi
    ? chapter.chapter_summary_hindi
    : chapter.chapter_summary;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={verses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderVerseCard}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            {/* Top Chapter Title */}
            <View style={[styles.chapterOverviewCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Text style={[styles.chapterNumberLabel, { color: colors.primary }]}>
                CHAPTER {chapter.chapter_number}
              </Text>
              <Text style={[styles.sanskritTitle, { color: colors.sanskrit }]}>{chapter.name}</Text>
              <Text style={[styles.transliteratedTitle, { color: colors.textPrimary }]}>
                {chapter.name_transliterated}
              </Text>
              <Text style={[styles.meaningText, { color: colors.textSecondary }]}>
                "{chapter.name_translation}"
              </Text>

              {/* Recite Chapter Button */}
              <TouchableOpacity
                style={[styles.playAllButton, { backgroundColor: colors.primary }]}
                onPress={() => playVerse(chapter.chapter_number, 1)}
              >
                <Ionicons name="play" size={18} color="#FFFFFF" />
                <Text style={styles.playAllText}>Listen All Verses ({chapter.verses_count})</Text>
              </TouchableOpacity>
            </View>

            {/* Chapter Summary Card with Language Toggle */}
            <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={styles.summaryTopRow}>
                <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>Chapter Overview</Text>
                <View style={styles.langToggle}>
                  <TouchableOpacity
                    style={[
                      styles.langBtn,
                      !showHindiSummary && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => setShowHindiSummary(false)}
                  >
                    <Text style={[styles.langBtnText, !showHindiSummary && { color: '#FFFFFF' }]}>English</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.langBtn,
                      showHindiSummary && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => setShowHindiSummary(true)}
                  >
                    <Text style={[styles.langBtnText, showHindiSummary && { color: '#FFFFFF' }]}>हिन्दी</Text>
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
              >
                <Text style={[styles.expandText, { color: colors.primary }]}>
                  {isSummaryExpanded ? 'Show Less ▲' : 'Read Full Summary ▼'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.versesListHeader}>
              <Text style={[styles.versesListTitle, { color: colors.textPrimary }]}>
                Verses (श्लोकाः)
              </Text>
              <Text style={[styles.versesListCount, { color: colors.textMuted }]}>
                1 to {chapter.verses_count}
              </Text>
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
    marginBottom: 12,
  },
  chapterOverviewCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  chapterNumberLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  sanskritTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  transliteratedTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  meaningText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    gap: 8,
  },
  playAllText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  langToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 2,
  },
  langBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryContent: {
    fontSize: 13,
    lineHeight: 20,
  },
  expandButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  expandText: {
    fontSize: 12,
    fontWeight: '700',
  },
  versesListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  versesListTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  versesListCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  verseCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
    elevation: 1,
  },
  verseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  verseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verseBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  audioIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sanskritPreview: {
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 4,
  },
  transliterationPreview: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
