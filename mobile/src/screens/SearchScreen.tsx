import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchResult } from '../types/gita';
import { searchVerses } from '../services/db';
import { useTheme } from '../context/ThemeContext';

interface SearchScreenProps {
  onSelectVerse: (chapterNumber: number, verseNumber: number) => void;
  onBack: () => void;
}

const POPULAR_TOPICS = [
  'Karma',
  'Dharma',
  'Bhakti',
  'Yoga',
  'Atman',
  'Meditation',
  'Anger',
  'Peace',
  'Duty',
  'Mind',
  'Surrender',
  'Gunas',
];

const SUGGESTED_THEMES = [
  {
    topic: 'Karma Yoga',
    search: 'Karma',
    description: 'Selfless action without attachment to fruits',
    icon: 'leaf-outline',
  },
  {
    topic: 'Dharma',
    search: 'Dharma',
    description: 'Living in harmony with righteous duty',
    icon: 'shield-checkmark-outline',
  },
  {
    topic: 'Bhakti',
    search: 'Bhakti',
    description: 'Path of loving devotion and surrender',
    icon: 'heart-outline',
  },
  {
    topic: 'Mastering the Mind',
    search: 'Mind',
    description: 'Conquering restlessness through meditation',
    icon: 'disc-outline',
  },
];

export const SearchScreen: React.FC<SearchScreenProps> = ({ onSelectVerse, onBack }) => {
  const { colors, fontSizeMultiplier } = useTheme();

  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query.trim());
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (text: string) => {
    setLoading(true);
    try {
      const res = await searchVerses(text);
      setResults(res);
      setHasSearched(true);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderResultItem = ({ item }: { item: SearchResult }) => {
    return (
      <TouchableOpacity
        style={[
          styles.resultCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.borderSubtle,
          },
        ]}
        onPress={() => onSelectVerse(item.chapter_number, item.verse_number)}
        activeOpacity={0.75}
      >
        <View style={styles.resultHeaderRow}>
          <View style={[styles.badge, { backgroundColor: colors.goldLight }]}>
            <Text style={[styles.badgeText, { color: colors.gold }]}>
              Chapter {item.chapter_number} • Verse {item.verse_number}
            </Text>
          </View>
          <View style={[styles.arrowPill, { backgroundColor: colors.pillBg }]}>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
          </View>
        </View>

        <Text
          style={[
            styles.sanskritSnippet,
            { color: colors.sanskrit, fontSize: 16 * fontSizeMultiplier },
          ]}
          numberOfLines={2}
        >
          {item.text}
        </Text>

        <Text
          style={[
            styles.transliterationSnippet,
            { color: colors.textSecondary, fontSize: 13 * fontSizeMultiplier },
          ]}
          numberOfLines={2}
        >
          {item.transliteration}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={[styles.exploreText, { color: colors.primary }]}>
            Explore Verse & Commentaries
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Input Box */}
      <View
        style={[
          styles.searchBoxContainer,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <View style={[styles.searchIconBadge, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="search" size={18} color={colors.primary} />
        </View>
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search shloka, concept, or meaning..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoFocus={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggested Topics Bar */}
      <View style={styles.topicsSection}>
        <View style={styles.topicsLabelRow}>
          <Ionicons name="sparkles" size={12} color={colors.gold} style={{ marginRight: 5 }} />
          <Text style={[styles.topicsLabel, { color: colors.textSecondary }]}>Explore Topics</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicsScrollContent}
        >
          {POPULAR_TOPICS.map((topic) => {
            const isSelected = query.trim().toLowerCase() === topic.toLowerCase();
            return (
              <TouchableOpacity
                key={topic}
                style={[
                  styles.topicChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.pillBg,
                    borderColor: isSelected ? colors.primary : colors.borderSubtle,
                  },
                ]}
                onPress={() => setQuery(topic)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.topicChipText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {topic}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content Area */}
      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.stateText, { color: colors.textSecondary }]}>
            Searching sacred verses...
          </Text>
        </View>
      ) : hasSearched && results.length === 0 ? (
        <View style={styles.centerState}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.pillBg }]}>
            <Ionicons name="search-outline" size={36} color={colors.textMuted} />
          </View>
          <Text style={[styles.emptyHeading, { color: colors.textPrimary }]}>No Verses Found</Text>
          <Text style={[styles.stateText, { color: colors.textSecondary }]}>
            No matching shlokas for "{query}". Try keywords like Karma, Yoga, Atman, or peace.
          </Text>
        </View>
      ) : !hasSearched && query.trim().length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyDiscoverContainer} showsVerticalScrollIndicator={false}>
          <View style={[styles.welcomeBanner, { backgroundColor: colors.cardBackground, borderColor: colors.borderSubtle }]}>
            <Text style={[styles.welcomeInvocation, { color: colors.gold }]}>॥ ॐ तत्सत् ॥</Text>
            <Text style={[styles.welcomeTitle, { color: colors.textPrimary }]}>
              Search the Universal Dialogue
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
              Instantly find verses across all 18 chapters by Sanskrit terms, English keywords, or spiritual themes.
            </Text>
          </View>

          <Text style={[styles.suggestedThemesHeader, { color: colors.textSecondary }]}>
            Key Spiritual Themes
          </Text>

          <View style={styles.themesGrid}>
            {SUGGESTED_THEMES.map((theme) => (
              <TouchableOpacity
                key={theme.topic}
                style={[
                  styles.themeCard,
                  { backgroundColor: colors.cardBackground, borderColor: colors.borderSubtle },
                ]}
                onPress={() => setQuery(theme.search)}
                activeOpacity={0.75}
              >
                <View style={[styles.themeIconWrapper, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name={theme.icon as any} size={20} color={colors.primary} />
                </View>
                <View style={styles.themeContent}>
                  <Text style={[styles.themeCardTitle, { color: colors.textPrimary }]}>
                    {theme.topic}
                  </Text>
                  <Text style={[styles.themeCardDesc, { color: colors.textSecondary }]}>
                    {theme.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.chapter_number}_${item.verse_number}`}
          renderItem={renderResultItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.resultsHeaderRow}>
              <View style={[styles.resultsPill, { backgroundColor: colors.pillBg }]}>
                <Ionicons name="checkmark-circle-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
                  {results.length} {results.length === 1 ? 'verse found' : 'verses found'}
                </Text>
              </View>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 12,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14.5,
  },
  clearBtn: {
    padding: 6,
  },
  topicsSection: {
    marginBottom: 8,
  },
  topicsLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 6,
  },
  topicsLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topicsScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  topicChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  topicChipText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  resultsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  arrowPill: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sanskritSnippet: {
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 6,
  },
  transliterationSnippet: {
    fontStyle: 'italic',
    lineHeight: 19,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  exploreText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 2,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyHeading: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  stateText: {
    fontSize: 13.5,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  emptyDiscoverContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  welcomeBanner: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
  },
  welcomeInvocation: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 6,
  },
  welcomeTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  suggestedThemesHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  themesGrid: {
    gap: 10,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  themeIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  themeContent: {
    flex: 1,
  },
  themeCardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  themeCardDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
});
