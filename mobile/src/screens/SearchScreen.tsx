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
        style={[styles.resultCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
        onPress={() => onSelectVerse(item.chapter_number, item.verse_number)}
        activeOpacity={0.7}
      >
        <View style={styles.resultHeaderRow}>
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>
              Chapter {item.chapter_number} • Verse {item.verse_number}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </View>

        <Text
          style={[
            styles.sanskritSnippet,
            { color: colors.sanskrit, fontSize: 15 * fontSizeMultiplier },
          ]}
          numberOfLines={2}
        >
          {item.text}
        </Text>

        <Text
          style={[styles.transliterationSnippet, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.transliteration}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Input Box */}
      <View style={[styles.searchBoxContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.primary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search by topic, Sanskrit shloka, meaning..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoFocus={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggested Topics Bar */}
      <View style={styles.topicsSection}>
        <Text style={[styles.topicsLabel, { color: colors.textSecondary }]}>Explore Topics:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicsScroll}>
          {POPULAR_TOPICS.map((topic) => (
            <TouchableOpacity
              key={topic}
              style={[
                styles.topicChip,
                {
                  backgroundColor: query === topic ? colors.primary : colors.primaryLight,
                },
              ]}
              onPress={() => setQuery(topic)}
            >
              <Text
                style={[
                  styles.topicChipText,
                  { color: query === topic ? '#FFFFFF' : colors.primary },
                ]}
              >
                {topic}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search Results */}
      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.stateText, { color: colors.textSecondary }]}>Searching Gita database...</Text>
        </View>
      ) : hasSearched && results.length === 0 ? (
        <View style={styles.centerState}>
          <Ionicons name="search-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyHeading, { color: colors.textPrimary }]}>No Verses Found</Text>
          <Text style={[styles.stateText, { color: colors.textSecondary }]}>
            Try searching with a different Sanskrit or English keyword.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.chapter_number}_${item.verse_number}`}
          renderItem={renderResultItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            hasSearched ? (
              <Text style={[styles.resultsCount, { color: colors.textMuted }]}>
                Found {results.length} matching verses
              </Text>
            ) : undefined
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
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
  },
  clearBtn: {
    padding: 4,
  },
  topicsSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  topicsLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  topicsScroll: {
    flexDirection: 'row',
  },
  topicChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  topicChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  resultCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  sanskritSnippet: {
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 4,
  },
  transliterationSnippet: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  stateText: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
});
