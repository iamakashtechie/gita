export interface Chapter {
  id: number;
  chapter_number: number;
  name: string;
  name_transliterated: string;
  name_translation: string;
  name_meaning: string;
  chapter_summary: string;
  chapter_summary_hindi: string;
  verses_count: number;
}

export interface Verse {
  id: number;
  chapter_number: number;
  verse_number: number;
  verse_order?: number;
  text: string;
  transliteration: string;
  word_meanings: string;
  title?: string;
}

export interface Translation {
  id: number;
  verse_id: number;
  verse_number?: number;
  author_id?: number;
  author_name: string;
  lang: string;
  description: string;
}

export interface Commentary {
  id: number;
  verse_id: number;
  verse_number?: number;
  author_id?: number;
  author_name: string;
  lang: string;
  description: string;
}

export interface Author {
  id: number;
  name: string;
}

export interface Bookmark {
  id: number;
  verse_id: number;
  chapter_number: number;
  verse_number: number;
  text: string;
  transliteration: string;
  created_at: string;
}

export interface Note {
  id: number;
  verse_id: number;
  note_text: string;
  created_at: string;
  updated_at: string;
}

export interface SearchResult {
  verse_id: number;
  chapter_number: number;
  verse_number: number;
  text: string;
  transliteration: string;
  word_meanings?: string;
}
