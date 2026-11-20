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
        const [v, ch, transList, commList] = await Promise.all([
          getVerse(chapterNumber, verseNumber),
          getChapter(chapterNumber),
          getTranslations((chapterNumber - 1) * 100 + verseNumber), // fallback query or load by verse id
          getCommentaries((chapterNumber - 1) * 100 + verseNumber),
        ]);

        if (v) {
          setVerse(v);
          // Correctly load relations using actual verse id
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

          // Set default authors
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
      // Go to last verse of previous chapter
      onNavigateVerse(chapterNumber - 1, 1);
    }
  };

  const handleNextVerse = () => {
    if (verseNumber < totalVersesInChapter) {
      onNavigateVerse(chapterNumber, verseNumber + 1);
    } else if (chapterNumber < 18) {
      // Go to verse 1 of next chapter
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

  // Filter translations for selected language
  const availableTranslations = translations.filter(
    (t) => t.lang.toLowerCase() === selectedLang.toLowerCase()
  );
  const activeTranslation =
    availableTranslations.find((t) => t.author_name === selectedTransAuthor) ||
    availableTranslations[0] ||
    translations[0];

  // Filter commentaries
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
      <View style={[styles.topBar, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <View style={styles.topBarLeft}>
          <Text style={[styles.verseRefText, { color: colors.primary }]}>
            Chapter {chapterNumber} • Verse {verseNumber}
          </Text>
        </View>

        <View style={styles.topBarActions}>
          <TouchableOpacity onPress={cycleFontSize} style={styles.topIconBtn}>
            <Ionicons name="text" size={18} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleBookmarkToggle} style={styles.topIconBtn}>
            <Ionicons
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={bookmarked ? colors.accent : colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Sanskrit Shloka Card */}
        <View style={[styles.shlokaCard, { backgroundColor: colors.cardBackground, borderColor: colors.primaryLight }]}>
          <Text
            style={[
              styles.sanskritText,
              { color: colors.sanskrit, fontSize: 19 * fontSizeMultiplier },
            ]}
          >
            {verse.text}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text
            style={[
              styles.transliterationText,
              { color: colors.textSecondary, fontSize: 14 * fontSizeMultiplier },
            ]}
          >
            {verse.transliteration}
          </Text>

          {/* Audio Play Button */}
          <View style={styles.audioActionRow}>
            <TouchableOpacity
              style={[
                styles.audioPlayButton,
                { backgroundColor: isCurrentAudio ? colors.accent : colors.primary },
              ]}
              onPress={() => {
                if (isCurrentAudio) {
                  pauseAudio();
                } else if (currentTrack?.chapterNumber === chapterNumber && currentTrack?.verseNumber === verseNumber) {
                  resumeAudio();
                } else {
                  playVerse(chapterNumber, verseNumber);
                }
              }}
            >
              <Ionicons
                name={isCurrentAudio ? 'pause' : 'volume-high'}
                size={20}
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
          <View style={[styles.sectionCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.sectionHeaderTouchable}
              onPress={() => setShowWordMeanings(!showWordMeanings)}
            >
              <View style={styles.sectionTitleRow}>
                <Ionicons name="book-outline" size={18} color={colors.primary} />
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
              <Text
                style={[
                  styles.wordMeaningsText,
                  { color: colors.textSecondary, fontSize: 13 * fontSizeMultiplier },
                ]}
              >
                {verse.word_meanings}
              </Text>
            )}
          </View>
        ) : null}

        {/* Translations Section */}
        <View style={[styles.sectionCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="language-outline" size={18} color={colors.primary} />
              <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Translations</Text>
            </View>

            {/* Language Toggle */}
            <View style={styles.langSelector}>
              <TouchableOpacity
                style={[styles.langChoice, selectedLang === 'english' && { backgroundColor: colors.primary }]}
                onPress={() => setSelectedLang('english')}
              >
                <Text style={[styles.langChoiceText, selectedLang === 'english' && { color: '#FFFFFF' }]}>EN</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langChoice, selectedLang === 'hindi' && { backgroundColor: colors.primary }]}
                onPress={() => setSelectedLang('hindi')}
              >
                <Text style={[styles.langChoiceText, selectedLang === 'hindi' && { color: '#FFFFFF' }]}>HI</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Author Selector Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.authorChipsScroll}>
            {availableTranslations.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.authorChip,
                  {
                    backgroundColor:
                      activeTranslation?.id === t.id ? colors.primary : colors.primaryLight,
                  },
                ]}
                onPress={() => setSelectedTransAuthor(t.author_name)}
              >
                <Text
                  style={[
                    styles.authorChipText,
                    {
                      color: activeTranslation?.id === t.id ? '#FFFFFF' : colors.primary,
                    },
                  ]}
                >
                  {t.author_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {activeTranslation ? (
            <View style={styles.translationContent}>
              <Text style={[styles.authorNameLabel, { color: colors.primary }]}>
                {activeTranslation.author_name}
              </Text>
              <Text
                style={[
                  styles.translationBody,
                  { color: colors.textPrimary, fontSize: 15 * fontSizeMultiplier },
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
          <View style={[styles.sectionCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="reader-outline" size={18} color={colors.primary} />
                <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
                  Commentaries (भाष्य)
                </Text>
              </View>
            </View>

            {/* Commentators Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.authorChipsScroll}>
              {availableCommentaries.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.authorChip,
                    {
                      backgroundColor:
                        activeCommentary?.id === c.id ? colors.primary : colors.primaryLight,
                    },
                  ]}
                  onPress={() => setSelectedCommAuthor(c.author_name)}
                >
                  <Text
                    style={[
                      styles.authorChipText,
                      {
                        color: activeCommentary?.id === c.id ? '#FFFFFF' : colors.primary,
                      },
                    ]}
                  >
                    {c.author_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {activeCommentary ? (
              <View style={styles.commentaryContent}>
                <Text style={[styles.authorNameLabel, { color: colors.primary }]}>
                  Commentary by {activeCommentary.author_name}
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
        <View style={[styles.sectionCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="pencil-outline" size={18} color={colors.primary} />
              <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
                Personal Reflection
              </Text>
            </View>
            <TouchableOpacity onPress={() => setIsEditingNote(!isEditingNote)}>
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
                    backgroundColor: colors.background,
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
              >
                <Text style={styles.saveNoteBtnText}>Save Reflection</Text>
              </TouchableOpacity>
            </View>
          ) : noteText ? (
            <Text style={[styles.savedNoteText, { color: colors.textPrimary }]}>{noteText}</Text>
          ) : (
            <Text style={[styles.emptyNote, { color: colors.textMuted }]}>
              No reflections written yet. Tap "+ Add Note" to record your thoughts.
            </Text>
          )}
        </View>

        {/* Bottom Navigation: Prev / Next Shloka */}
        <View style={styles.bottomNavRow}>
          <TouchableOpacity
            style={[styles.navVerseBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={handlePrevVerse}
          >
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
            <Text style={[styles.navVerseText, { color: colors.textPrimary }]}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navVerseBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={handleNextVerse}
          >
            <Text style={[styles.navVerseText, { color: colors.textPrimary }]}>Next Shloka</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
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
  verseRefText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topIconBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  shlokaCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    elevation: 2,
    alignItems: 'center',
  },
  sanskritText: {
    fontWeight: '700',
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    width: '60%',
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
    borderRadius: 24,
    gap: 8,
  },
  audioPlayButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
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
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
  },
  langSelector: {
    flexDirection: 'row',
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 2,
  },
  langChoice: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  langChoiceText: {
    fontSize: 11,
    fontWeight: '700',
  },
  wordMeaningsText: {
    marginTop: 10,
    lineHeight: 20,
  },
  authorChipsScroll: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  authorChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  authorChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  translationContent: {
    marginTop: 8,
  },
  authorNameLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  translationBody: {
    lineHeight: 24,
  },
  commentaryContent: {
    marginTop: 8,
  },
  commentaryBody: {
    lineHeight: 22,
  },
  emptyNote: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 6,
  },
  editActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  noteInputContainer: {
    marginTop: 10,
  },
  noteTextInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    fontSize: 14,
    minHeight: 80,
    marginBottom: 10,
  },
  saveNoteBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  saveNoteBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  savedNoteText: {
    marginTop: 8,
    fontSize: 14,
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
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  navVerseText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
