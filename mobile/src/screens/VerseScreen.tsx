import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Verse, Translation, Commentary } from '../types/gita';
import {
  getVerse,
  getTranslations,
  getCommentaries,
  isBookmarked,
  toggleBookmark,
  getNote,
  saveNote,
  getChapter,
} from '../services/db';
import { useTheme } from '../context/ThemeContext';
import { useAudio } from '../context/AudioContext';

interface VerseScreenProps {
  chapterNumber: number;
  verseNumber: number;
  onNavigateVerse: (chapterNumber: number, verseNumber: number) => void;
  onBack: () => void;
}

export const VerseScreen: React.FC<VerseScreenProps> = ({
  chapterNumber,
  verseNumber,
  onNavigateVerse,
  onBack,
}) => {
  const { colors, fontSizeMultiplier, setFontSizeMultiplier, preferredLang } = useTheme();
  const { playVerse, pauseAudio, resumeAudio, isPlaying, currentTrack } = useAudio();

  const [verse, setVerse] = useState<Verse | null>(null);
  const [totalVersesInChapter, setTotalVersesInChapter] = useState<number>(47);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [commentaries, setCommentaries] = useState<Commentary[]>([]);
  const [selectedTransAuthor, setSelectedTransAuthor] = useState<string>('');
  const [selectedCommAuthor, setSelectedCommAuthor] = useState<string>('');
  const [selectedLang, setSelectedLang] = useState<'english' | 'hindi'>(preferredLang);
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [showWordMeanings, setShowWordMeanings] = useState<boolean>(true);
  const [noteText, setNoteText] = useState<string>('');
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const isCurrentAudio =
    isPlaying &&
    currentTrack?.chapterNumber === chapterNumber &&
    currentTrack?.verseNumber === verseNumber;

  useEffect(() => {
    async function loadVerseData() {
      try {
        setLoading(true);
        const [v, ch] = await Promise.all([
          getVerse(chapterNumber, verseNumber),
          getChapter(chapterNumber),
        ]);

        if (v) {
          setVerse(v);
          const [actualTrans, actualComm, bmStatus, note] = await Promise.all([
            getTranslations(v.id),
            getCommentaries(v.id),
            isBookmarked(v.id),
            getNote(v.id),
          ]);
          setTranslations(actualTrans);
          setCommentaries(actualComm);
          setBookmarked(bmStatus);
          setNoteText(note ? note.note_text : '');

          const englishTrans = actualTrans.filter((t) => t.lang === 'english');
          const hindiTrans = actualTrans.filter((t) => t.lang === 'hindi');
          if (preferredLang === 'hindi' && hindiTrans.length > 0) {
            setSelectedTransAuthor(hindiTrans[0].author_name);
          } else if (englishTrans.length > 0) {
            setSelectedTransAuthor(englishTrans[0].author_name);
          } else if (actualTrans.length > 0) {
            setSelectedTransAuthor(actualTrans[0].author_name);
          }

          if (actualComm.length > 0) {
            const preferredComm = actualComm.find((c) => c.lang === preferredLang);
            setSelectedCommAuthor(preferredComm ? preferredComm.author_name : actualComm[0].author_name);
          }
        }

        if (ch) {
          setTotalVersesInChapter(ch.verses_count);
        }
      } catch (err) {
        console.error('Failed to load verse reader:', err);
      } finally {
        setLoading(false);
      }
    }
    loadVerseData();
  }, [chapterNumber, verseNumber, preferredLang]);

  const handleBookmarkToggle = async () => {
    if (!verse) return;
    const newState = await toggleBookmark(verse.id);
    setBookmarked(newState);
  };

  const handleSaveNote = async () => {
    if (!verse) return;
    await saveNote(verse.id, noteText);
    setIsEditingNote(false);
    Alert.alert('Saved', 'Your reflection has been saved locally.');
  };

  const cycleFontSize = () => {
    if (fontSizeMultiplier === 1.0) setFontSizeMultiplier(1.15);
    else if (fontSizeMultiplier === 1.15) setFontSizeMultiplier(1.3);
    else if (fontSizeMultiplier === 1.3) setFontSizeMultiplier(0.9);
    else setFontSizeMultiplier(1.0);
  };

  const handlePrevVerse = () => {
    if (verseNumber > 1) {
      onNavigateVerse(chapterNumber, verseNumber - 1);
    } else if (chapterNumber > 1) {
      onNavigateVerse(chapterNumber - 1, 1);
    }
  };

  const handleNextVerse = () => {
    if (verseNumber < totalVersesInChapter) {
      onNavigateVerse(chapterNumber, verseNumber + 1);
    } else if (chapterNumber < 18) {
      onNavigateVerse(chapterNumber + 1, 1);
    }
  };

  if (loading || !verse) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const availableTranslations = translations.filter(
    (t) => t.lang.toLowerCase() === selectedLang.toLowerCase()
  );
  const activeTranslation =
    availableTranslations.find((t) => t.author_name === selectedTransAuthor) ||
    availableTranslations[0] ||
    translations[0];

  const availableCommentaries = commentaries.filter(
    (c) => c.lang.toLowerCase() === selectedLang.toLowerCase()
  );
  const activeCommentary =
    availableCommentaries.find((c) => c.author_name === selectedCommAuthor) ||
    availableCommentaries[0] ||
    commentaries[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Action Bar */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: colors.cardBackground,
            borderBottomColor: colors.borderSubtle,
          },
        ]}
      >
        <View style={styles.topBarLeft}>
          <View style={[styles.refPill, { backgroundColor: colors.goldLight }]}>
            <Text style={[styles.verseRefText, { color: colors.primary }]}>
              Chapter {chapterNumber} • Verse {verseNumber}
            </Text>
          </View>
        </View>

        <View style={styles.topBarActions}>
          <TouchableOpacity
            onPress={cycleFontSize}
            style={[styles.topIconBtn, { backgroundColor: colors.pillBg }]}
            activeOpacity={0.7}
            accessibilityLabel="Adjust Text Size"
          >
            <Ionicons name="text" size={17} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleBookmarkToggle}
            style={[
              styles.topIconBtn,
              { backgroundColor: bookmarked ? colors.goldLight : colors.pillBg },
            ]}
            activeOpacity={0.7}
            accessibilityLabel="Bookmark Shloka"
          >
            <Ionicons
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={bookmarked ? colors.gold : colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Sanskrit Shloka Hero Card */}
        <View
          style={[
            styles.shlokaCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              shadowColor: '#000',
            },
          ]}
        >
          <View style={styles.shlokaEmblemRow}>
            <View style={[styles.emblemLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.shlokaEmblemText, { color: colors.sanskritSubtle }]}>
              ॥ श्लोक {verse.verse_number} ॥
            </Text>
            <View style={[styles.emblemLine, { backgroundColor: colors.border }]} />
          </View>

          <Text
            style={[
              styles.sanskritText,
              { color: colors.sanskrit, fontSize: 19 * fontSizeMultiplier },
            ]}
          >
            {verse.text}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

          <Text
            style={[
              styles.transliterationText,
              { color: colors.textSecondary, fontSize: 14 * fontSizeMultiplier },
            ]}
          >
            {verse.transliteration}
          </Text>

          {/* Audio Recitation Action */}
          <View style={styles.audioActionRow}>
            <TouchableOpacity
              style={[
                styles.audioPlayButton,
                { backgroundColor: isCurrentAudio ? colors.accent : colors.primary },
              ]}
              onPress={() => {
                if (isCurrentAudio) {
                  pauseAudio();
                } else if (
                  currentTrack?.chapterNumber === chapterNumber &&
                  currentTrack?.verseNumber === verseNumber
                ) {
                  resumeAudio();
                } else {
                  playVerse(chapterNumber, verseNumber);
                }
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isCurrentAudio ? 'pause' : 'volume-high'}
                size={19}
                color="#FFFFFF"
              />
              <Text style={styles.audioPlayButtonText}>
                {isCurrentAudio ? 'Pause Recitation' : 'Play Sanskrit Recitation'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Word-by-Word Meanings Accordion */}
        {verse.word_meanings ? (
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                shadowColor: '#000',
              },
            ]}
          >
            <TouchableOpacity
              style={styles.sectionHeaderTouchable}
              onPress={() => setShowWordMeanings(!showWordMeanings)}
              activeOpacity={0.7}
            >
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionIconBadge, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="book-outline" size={16} color={colors.primary} />
                </View>
                <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
                  Word-by-Word Meanings (पदार्थ)
                </Text>
              </View>
              <Ionicons
                name={showWordMeanings ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            {showWordMeanings && (
              <View style={[styles.wordMeaningsBox, { backgroundColor: colors.pillBg }]}>
                <Text
                  style={[
                    styles.wordMeaningsText,
                    { color: colors.textSecondary, fontSize: 13.5 * fontSizeMultiplier },
                  ]}
                >
                  {verse.word_meanings}
                </Text>
              </View>
            )}
          </View>
        ) : null}

        {/* Translations Section */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              shadowColor: '#000',
            },
          ]}
        >
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIconBadge, { backgroundColor: colors.goldLight }]}>
                <Ionicons name="language-outline" size={16} color={colors.gold} />
              </View>
              <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
                Translations
              </Text>
            </View>

            {/* Language Segment */}
            <View style={[styles.langSegmentBox, { backgroundColor: colors.pillBg }]}>
              <TouchableOpacity
                style={[
                  styles.langSegmentBtn,
                  selectedLang === 'english' && { backgroundColor: colors.cardBackground },
                ]}
                onPress={() => setSelectedLang('english')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.langSegmentBtnText,
                    { color: selectedLang === 'english' ? colors.primary : colors.textMuted },
                  ]}
                >
                  English
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.langSegmentBtn,
                  selectedLang === 'hindi' && { backgroundColor: colors.cardBackground },
                ]}
                onPress={() => setSelectedLang('hindi')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.langSegmentBtnText,
                    { color: selectedLang === 'hindi' ? colors.primary : colors.textMuted },
                  ]}
                >
                  हिन्दी
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Author Selector Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.authorChipsScroll}
          >
            {availableTranslations.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.authorChip,
                  {
                    backgroundColor:
                      activeTranslation?.id === t.id ? colors.primary : colors.pillBg,
                  },
                ]}
                onPress={() => setSelectedTransAuthor(t.author_name)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.authorChipText,
                    {
                      color: activeTranslation?.id === t.id ? '#FFFFFF' : colors.textSecondary,
                    },
                  ]}
                >
                  {t.author_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {activeTranslation ? (
            <View style={[styles.translationContentBox, { backgroundColor: colors.pillBg }]}>
              <Text style={[styles.authorNameLabel, { color: colors.primary }]}>
                TRANSLATION BY {activeTranslation.author_name}
              </Text>
              <Text
                style={[
                  styles.translationBody,
                  { color: colors.textPrimary, fontSize: 14.5 * fontSizeMultiplier },
                ]}
              >
                {activeTranslation.description}
              </Text>
            </View>
          ) : (
            <Text style={[styles.emptyNote, { color: colors.textMuted }]}>
              No translation available for selected language.
            </Text>
          )}
        </View>

        {/* Commentaries Section */}
        {commentaries.length > 0 && (
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                shadowColor: '#000',
              },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionIconBadge, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="reader-outline" size={16} color={colors.primary} />
                </View>
                <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
                  Commentaries (भाष्य)
                </Text>
              </View>
            </View>

            {/* Commentators Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.authorChipsScroll}
            >
              {availableCommentaries.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.authorChip,
                    {
                      backgroundColor:
                        activeCommentary?.id === c.id ? colors.primary : colors.pillBg,
                    },
                  ]}
                  onPress={() => setSelectedCommAuthor(c.author_name)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.authorChipText,
                      {
                        color: activeCommentary?.id === c.id ? '#FFFFFF' : colors.textSecondary,
                      },
                    ]}
                  >
                    {c.author_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {activeCommentary ? (
              <View style={[styles.commentaryContentBox, { backgroundColor: colors.pillBg }]}>
                <Text style={[styles.authorNameLabel, { color: colors.primary }]}>
                  COMMENTARY BY {activeCommentary.author_name}
                </Text>
                <Text
                  style={[
                    styles.commentaryBody,
                    { color: colors.textSecondary, fontSize: 14 * fontSizeMultiplier },
                  ]}
                >
                  {activeCommentary.description}
                </Text>
              </View>
            ) : (
              <Text style={[styles.emptyNote, { color: colors.textMuted }]}>
                No commentary available for this author/language.
              </Text>
            )}
          </View>
        )}

        {/* Personal Notes Section */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              shadowColor: '#000',
            },
          ]}
        >
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIconBadge, { backgroundColor: colors.goldLight }]}>
                <Ionicons name="pencil-outline" size={16} color={colors.gold} />
              </View>
              <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
                Personal Reflections
              </Text>
            </View>
            <TouchableOpacity onPress={() => setIsEditingNote(!isEditingNote)} activeOpacity={0.7}>
              <Text style={[styles.editActionText, { color: colors.primary }]}>
                {isEditingNote ? 'Cancel' : noteText ? 'Edit' : '+ Add Note'}
              </Text>
            </TouchableOpacity>
          </View>

          {isEditingNote ? (
            <View style={styles.noteInputContainer}>
              <TextInput
                style={[
                  styles.noteTextInput,
                  {
                    color: colors.textPrimary,
                    borderColor: colors.border,
                    backgroundColor: colors.pillBg,
                  },
                ]}
                placeholder="Write your reflections or insights on this shloka..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                value={noteText}
                onChangeText={setNoteText}
              />
              <TouchableOpacity
                style={[styles.saveNoteBtn, { backgroundColor: colors.primary }]}
                onPress={handleSaveNote}
                activeOpacity={0.8}
              >
                <Text style={styles.saveNoteBtnText}>Save Reflection</Text>
              </TouchableOpacity>
            </View>
          ) : noteText ? (
            <View style={[styles.savedNoteBox, { backgroundColor: colors.pillBg }]}>
              <Text style={[styles.savedNoteText, { color: colors.textPrimary }]}>{noteText}</Text>
            </View>
          ) : (
            <Text style={[styles.emptyNote, { color: colors.textMuted }]}>
              No reflections written yet. Tap "+ Add Note" to record your insights.
            </Text>
          )}
        </View>

        {/* Bottom Shloka Navigation Bar */}
        <View style={styles.bottomNavRow}>
          <TouchableOpacity
            style={[
              styles.navVerseBtn,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                shadowColor: '#000',
              },
            ]}
            onPress={handlePrevVerse}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={18} color={colors.primary} />
            <Text style={[styles.navVerseText, { color: colors.textPrimary }]}>Previous Shloka</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navVerseBtn,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                shadowColor: '#000',
              },
            ]}
            onPress={handleNextVerse}
            activeOpacity={0.7}
          >
            <Text style={[styles.navVerseText, { color: colors.textPrimary }]}>Next Shloka</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  topBarLeft: {
    flex: 1,
  },
  refPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  verseRefText: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  shlokaCard: {
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    marginBottom: 14,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    alignItems: 'center',
  },
  shlokaEmblemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    width: '100%',
    justifyContent: 'center',
  },
  emblemLine: {
    height: 1,
    flex: 1,
    marginHorizontal: 10,
  },
  shlokaEmblemText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sanskritText: {
    fontWeight: '800',
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    width: '50%',
    marginVertical: 12,
  },
  transliterationText: {
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  audioActionRow: {
    marginTop: 4,
    width: '100%',
  },
  audioPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
    elevation: 2,
    shadowColor: '#C25E00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  audioPlayButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  sectionCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  sectionHeaderTouchable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  langSegmentBox: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  langSegmentBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  langSegmentBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  wordMeaningsBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
  },
  wordMeaningsText: {
    lineHeight: 22,
  },
  authorChipsScroll: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  authorChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  authorChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  translationContentBox: {
    marginTop: 6,
    padding: 14,
    borderRadius: 14,
  },
  authorNameLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  translationBody: {
    lineHeight: 24,
  },
  commentaryContentBox: {
    marginTop: 6,
    padding: 14,
    borderRadius: 14,
  },
  commentaryBody: {
    lineHeight: 23,
  },
  emptyNote: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 6,
  },
  editActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  noteInputContainer: {
    marginTop: 10,
  },
  noteTextInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 14,
    minHeight: 85,
    marginBottom: 10,
  },
  saveNoteBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  saveNoteBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  savedNoteBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
  },
  savedNoteText: {
    fontSize: 13.5,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  bottomNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  navVerseBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  navVerseText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});
