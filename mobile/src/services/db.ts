import * as SQLite from 'expo-sqlite';
import { Chapter, Verse, Translation, Commentary, Bookmark, Note, SearchResult } from '../types/gita';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  const dbName = 'gita.db';

  try {
    let db = await SQLite.openDatabaseAsync(dbName);
    const tableCheck = await db.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='chapters'"
    );

    if (!tableCheck) {
      console.log('Chapters table missing in SQLite. Importing gita.db from bundled asset...');
      await db.closeAsync();
      await SQLite.importDatabaseFromAssetAsync(dbName, {
        assetId: require('../../assets/gita.db'),
        forceOverwrite: true,
      });
      db = await SQLite.openDatabaseAsync(dbName);
    }

    dbInstance = db;
    return dbInstance;
  } catch (error) {
    console.warn('Importing database via importDatabaseFromAssetAsync:', error);
    await SQLite.importDatabaseFromAssetAsync(dbName, {
      assetId: require('../../assets/gita.db'),
      forceOverwrite: true,
    });
    dbInstance = await SQLite.openDatabaseAsync(dbName);
    return dbInstance;
  }
}

/**
 * Fetch all 18 Chapters with summaries and verse counts
 */
export async function getChapters(): Promise<Chapter[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Chapter>(
    'SELECT * FROM chapters ORDER BY chapter_number ASC'
  );
  return rows;
}

/**
 * Fetch a specific chapter by its chapter number (1 to 18)
 */
export async function getChapter(chapterNumber: number): Promise<Chapter | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Chapter>(
    'SELECT * FROM chapters WHERE chapter_number = ?',
    [chapterNumber]
  );
  return row || null;
}

/**
 * Fetch all verses for a given chapter
 */
export async function getVersesByChapter(chapterNumber: number): Promise<Verse[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Verse>(
    'SELECT * FROM verses WHERE chapter_number = ? ORDER BY verse_number ASC',
    [chapterNumber]
  );
  return rows;
}

/**
 * Fetch a single verse by chapter number and verse number
 */
export async function getVerse(chapterNumber: number, verseNumber: number): Promise<Verse | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Verse>(
    'SELECT * FROM verses WHERE chapter_number = ? AND verse_number = ?',
    [chapterNumber, verseNumber]
  );
  return row || null;
}

/**
 * Fetch translations for a verse
 */
export async function getTranslations(verseId: number, lang?: string): Promise<Translation[]> {
  const db = await getDatabase();
  if (lang) {
    return await db.getAllAsync<Translation>(
      'SELECT * FROM translations WHERE verse_id = ? AND lang = ? ORDER BY author_name ASC',
      [verseId, lang]
    );
  }
  return await db.getAllAsync<Translation>(
    'SELECT * FROM translations WHERE verse_id = ? ORDER BY lang ASC, author_name ASC',
    [verseId]
  );
}

/**
 * Fetch commentaries for a verse
 */
export async function getCommentaries(verseId: number, lang?: string): Promise<Commentary[]> {
  const db = await getDatabase();
  if (lang) {
    return await db.getAllAsync<Commentary>(
      'SELECT * FROM commentaries WHERE verse_id = ? AND lang = ? ORDER BY author_name ASC',
      [verseId, lang]
    );
  }
  return await db.getAllAsync<Commentary>(
    'SELECT * FROM commentaries WHERE verse_id = ? ORDER BY lang ASC, author_name ASC',
    [verseId]
  );
}

/**
 * Fetch Shloka of the Day (seeded by today's date)
 */
export async function getDailyShloka(): Promise<{ verse: Verse; translation: Translation | null }> {
  const db = await getDatabase();
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalVerses = 701;
  const targetId = (dayOfYear % totalVerses) + 1;

  const verse = await db.getFirstAsync<Verse>('SELECT * FROM verses WHERE id = ?', [targetId]);
  if (!verse) {
    const fallback = await db.getFirstAsync<Verse>('SELECT * FROM verses WHERE chapter_number = 2 AND verse_number = 47');
    const trans = await db.getFirstAsync<Translation>(
      'SELECT * FROM translations WHERE verse_id = ? AND lang = "english" LIMIT 1',
      [fallback?.id || 1]
    );
    return { verse: fallback!, translation: trans || null };
  }

  const translation = await db.getFirstAsync<Translation>(
    'SELECT * FROM translations WHERE verse_id = ? AND lang = "english" LIMIT 1',
    [verse.id]
  );

  return { verse, translation: translation || null };
}

/**
 * Full-Text Search across verses and transliterations
 */
export async function searchVerses(query: string): Promise<SearchResult[]> {
  const db = await getDatabase();
  const cleanQuery = query.trim().replace(/['"*]/g, '');
  if (!cleanQuery) return [];

  // Try FTS search first
  try {
    const ftsResults = await db.getAllAsync<SearchResult>(
      `SELECT verse_id, chapter_number, verse_number, text, transliteration, word_meanings 
       FROM verses_fts 
       WHERE verses_fts MATCH ? 
       LIMIT 30`,
      [`${cleanQuery}*`]
    );
    if (ftsResults && ftsResults.length > 0) {
      return ftsResults;
    }
  } catch (e) {
    // FTS fallback to LIKE
  }

  // Fallback to LIKE on verses and translations
  const likeQuery = `%${cleanQuery}%`;
  return await db.getAllAsync<SearchResult>(
    `SELECT v.id as verse_id, v.chapter_number, v.verse_number, v.text, v.transliteration, v.word_meanings
     FROM verses v
     LEFT JOIN translations t ON t.verse_id = v.id
     WHERE v.transliteration LIKE ? OR v.text LIKE ? OR v.word_meanings LIKE ? OR t.description LIKE ?
     GROUP BY v.id
     ORDER BY v.chapter_number ASC, v.verse_number ASC
     LIMIT 30`,
    [likeQuery, likeQuery, likeQuery, likeQuery]
  );
}

/**
 * Toggle bookmark for a verse
 */
export async function toggleBookmark(verseId: number): Promise<boolean> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<{ id: number }>('SELECT id FROM bookmarks WHERE verse_id = ?', [verseId]);
  if (existing) {
    await db.runAsync('DELETE FROM bookmarks WHERE verse_id = ?', [verseId]);
    return false; // Removed
  } else {
    await db.runAsync('INSERT INTO bookmarks (verse_id) VALUES (?)', [verseId]);
    return true; // Added
  }
}

/**
 * Check if a verse is bookmarked
 */
export async function isBookmarked(verseId: number): Promise<boolean> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ id: number }>('SELECT id FROM bookmarks WHERE verse_id = ?', [verseId]);
  return !!row;
}

/**
 * Get all bookmarked verses with details
 */
export async function getBookmarks(): Promise<Bookmark[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Bookmark>(`
    SELECT b.id, b.verse_id, v.chapter_number, v.verse_number, v.text, v.transliteration, b.created_at
    FROM bookmarks b
    JOIN verses v ON b.verse_id = v.id
    ORDER BY b.created_at DESC
  `);
}

/**
 * Save or update user note
 */
export async function saveNote(verseId: number, noteText: string): Promise<void> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<{ id: number }>('SELECT id FROM notes WHERE verse_id = ?', [verseId]);
  if (existing) {
    await db.runAsync(
      'UPDATE notes SET note_text = ?, updated_at = CURRENT_TIMESTAMP WHERE verse_id = ?',
      [noteText, verseId]
    );
  } else {
    await db.runAsync(
      'INSERT INTO notes (verse_id, note_text) VALUES (?, ?)',
      [verseId, noteText]
    );
  }
}

/**
 * Get note for a verse
 */
export async function getNote(verseId: number): Promise<Note | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Note>('SELECT * FROM notes WHERE verse_id = ?', [verseId]);
  return row || null;
}
