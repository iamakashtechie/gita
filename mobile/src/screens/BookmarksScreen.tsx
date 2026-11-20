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
        style={[
          styles.card,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.borderSubtle,
          },
        ]}
        onPress={() => onSelectVerse(item.chapter_number, item.verse_number)}
        activeOpacity={0.75}
      >
        <View style={styles.cardHeaderRow}>
          <View style={[styles.badge, { backgroundColor: colors.goldLight }]}>
            <Text style={[styles.badgeText, { color: colors.gold }]}>
              Chapter {item.chapter_number} • Verse {item.verse_number}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => handleRemove(item.verse_id)}
            style={[styles.removeBtn, { backgroundColor: colors.pillBg }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={15} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text
          style={[
            styles.sanskritText,
            { color: colors.sanskrit, fontSize: 16 * fontSizeMultiplier },
          ]}
          numberOfLines={2}
        >
          {item.text}
        </Text>

        <Text
          style={[
            styles.transliterationText,
            { color: colors.textSecondary, fontSize: 13 * fontSizeMultiplier },
          ]}
          numberOfLines={2}
        >
          {item.transliteration}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={[styles.footerActionText, { color: colors.primary }]}>
            Read Shloka & Reflections
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerState, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading your sacred bookmarks...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {bookmarks.length === 0 ? (
        <View style={styles.centerState}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.pillBg }]}>
            <Ionicons name="bookmark-outline" size={38} color={colors.gold} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Saved Verses Yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            When reading any verse, tap the bookmark icon to save it here for daily recitation and spiritual contemplation.
          </Text>
          <TouchableOpacity
            style={[styles.startExploreBtn, { backgroundColor: colors.primary }]}
            onPress={() => onSelectVerse(1, 1)}
            activeOpacity={0.8}
          >
            <Ionicons name="book-outline" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.startExploreText}>Begin with Chapter 1</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBookmarkItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.headerInfoRow}>
              <View style={[styles.counterPill, { backgroundColor: colors.pillBg }]}>
                <Ionicons name="bookmark" size={13} color={colors.gold} style={{ marginRight: 5 }} />
                <Text style={[styles.headerCount, { color: colors.textSecondary }]}>
                  {bookmarks.length} {bookmarks.length === 1 ? 'Verse Saved' : 'Verses Saved'}
                </Text>
              </View>
              <Text style={[styles.headerMutedTip, { color: colors.textMuted }]}>
                Daily Meditation List
              </Text>
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
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 13.5,
    marginTop: 12,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 290,
    marginBottom: 24,
  },
  startExploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  startExploreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  headerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  counterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  headerCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  headerMutedTip: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  card: {
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
  cardHeaderRow: {
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
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sanskritText: {
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 6,
  },
  transliterationText: {
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
  footerActionText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 2,
  },
});
