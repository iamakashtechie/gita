import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Bookmark } from '../types/gita';
import { getBookmarks, toggleBookmark } from '../services/db';
import { useTheme } from '../context/ThemeContext';

interface BookmarksScreenProps {
  onSelectVerse: (chapterNumber: number, verseNumber: number) => void;
  onBack: () => void;
}

export const BookmarksScreen: React.FC<BookmarksScreenProps> = ({ onSelectVerse, onBack }) => {
  const { colors, fontSizeMultiplier } = useTheme();

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const bList = await getBookmarks();
      setBookmarks(bList);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleRemove = async (verseId: number) => {
    await toggleBookmark(verseId);
    setBookmarks((prev) => prev.filter((b) => b.verse_id !== verseId));
  };

  const renderBookmarkItem = ({ item }: { item: Bookmark }) => {
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
        onPress={() => onSelectVerse(item.chapter_number, item.verse_number)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeaderRow}>
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>
              Chapter {item.chapter_number} • Verse {item.verse_number}
            </Text>
          </View>

          <TouchableOpacity onPress={() => handleRemove(item.verse_id)} style={styles.removeBtn}>
            <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text
          style={[
            styles.sanskritText,
            { color: colors.sanskrit, fontSize: 15 * fontSizeMultiplier },
          ]}
          numberOfLines={2}
        >
          {item.text}
        </Text>

        <Text
          style={[styles.transliterationText, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.transliteration}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerState, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {bookmarks.length === 0 ? (
        <View style={styles.centerState}>
          <Ionicons name="bookmark-outline" size={54} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Saved Verses</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            When reading any verse, tap the bookmark icon to save it to your personal spiritual collection.
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBookmarkItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Text style={[styles.headerCount, { color: colors.textMuted }]}>
              {bookmarks.length} {bookmarks.length === 1 ? 'Verse' : 'Verses'} Saved
            </Text>
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
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCount: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  card: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  cardHeaderRow: {
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
  removeBtn: {
    padding: 4,
  },
  sanskritText: {
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 4,
  },
  transliterationText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
