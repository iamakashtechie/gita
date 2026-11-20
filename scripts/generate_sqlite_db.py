#!/usr/bin/env python3
import json
import sqlite3
import os
import sys

def build_database(data_dir="data", output_db="data/gita.db"):
    print(f"Creating SQLite database at: {output_db}")
    if os.path.exists(output_db):
        os.remove(output_db)

    conn = sqlite3.connect(output_db)
    cur = conn.cursor()

    # Enable fast writes for build phase
    cur.execute("PRAGMA synchronous = OFF")
    cur.execute("PRAGMA journal_mode = MEMORY")

    print("Creating tables...")
    cur.execute("""
    CREATE TABLE chapters (
        id INTEGER PRIMARY KEY,
        chapter_number INTEGER NOT NULL,
        name TEXT NOT NULL,
        name_transliterated TEXT,
        name_translation TEXT,
        name_meaning TEXT,
        chapter_summary TEXT,
        chapter_summary_hindi TEXT,
        verses_count INTEGER
    );
    """)

    cur.execute("""
    CREATE TABLE verses (
        id INTEGER PRIMARY KEY,
        chapter_number INTEGER NOT NULL,
        verse_number INTEGER NOT NULL,
        verse_order INTEGER,
        text TEXT NOT NULL,
        transliteration TEXT,
        word_meanings TEXT,
        title TEXT
    );
    """)

    cur.execute("""
    CREATE TABLE authors (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL
    );
    """)

    cur.execute("""
    CREATE TABLE translations (
        id INTEGER PRIMARY KEY,
        verse_id INTEGER NOT NULL,
        verse_number INTEGER,
        author_id INTEGER,
        author_name TEXT,
        lang TEXT,
        description TEXT,
        FOREIGN KEY(verse_id) REFERENCES verses(id)
    );
    """)

    cur.execute("""
    CREATE TABLE commentaries (
        id INTEGER PRIMARY KEY,
        verse_id INTEGER NOT NULL,
        verse_number INTEGER,
        author_id INTEGER,
        author_name TEXT,
        lang TEXT,
        description TEXT,
        FOREIGN KEY(verse_id) REFERENCES verses(id)
    );
    """)

    # User personalized tables (offline bookmarks, notes, history)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verse_id INTEGER UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(verse_id) REFERENCES verses(id)
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verse_id INTEGER NOT NULL,
        note_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(verse_id) REFERENCES verses(id)
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS reading_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verse_id INTEGER NOT NULL,
        chapter_number INTEGER NOT NULL,
        verse_number INTEGER NOT NULL,
        read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(verse_id) REFERENCES verses(id)
    );
    """)

    # Load chapters
    print("Populating chapters...")
    with open(os.path.join(data_dir, "chapters.json"), "r", encoding="utf-8") as f:
        chapters = json.load(f)
        for c in chapters:
            cur.execute("""
            INSERT INTO chapters (id, chapter_number, name, name_transliterated, name_translation, name_meaning, chapter_summary, chapter_summary_hindi, verses_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                c["id"],
                c["chapter_number"],
                c["name"],
                c.get("name_transliterated"),
                c.get("name_translation"),
                c.get("name_meaning"),
                c.get("chapter_summary"),
                c.get("chapter_summary_hindi"),
                c.get("verses_count")
            ))

    # Load authors
    print("Populating authors...")
    with open(os.path.join(data_dir, "authors.json"), "r", encoding="utf-8") as f:
        authors = json.load(f)
        for a in authors:
            cur.execute("INSERT INTO authors (id, name) VALUES (?, ?)", (a["id"], a["name"]))

    # Load verses
    print("Populating verses...")
    with open(os.path.join(data_dir, "verse.json"), "r", encoding="utf-8") as f:
        verses = json.load(f)
        for v in verses:
            cur.execute("""
            INSERT INTO verses (id, chapter_number, verse_number, verse_order, text, transliteration, word_meanings, title)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                v["id"],
                v["chapter_number"],
                v["verse_number"],
                v.get("verse_order"),
                v["text"],
                v.get("transliteration"),
                v.get("word_meanings"),
                v.get("title")
            ))

    # Load translations
    print("Populating translations...")
    with open(os.path.join(data_dir, "translation.json"), "r", encoding="utf-8") as f:
        translations = json.load(f)
        for t in translations:
            cur.execute("""
            INSERT INTO translations (id, verse_id, verse_number, author_id, author_name, lang, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                t["id"],
                t["verse_id"],
                t.get("verseNumber"),
                t.get("author_id"),
                t.get("authorName"),
                t.get("lang"),
                t.get("description")
            ))

    # Load commentaries
    print("Populating commentaries...")
    with open(os.path.join(data_dir, "commentary.json"), "r", encoding="utf-8") as f:
        commentaries = json.load(f)
        for com in commentaries:
            cur.execute("""
            INSERT INTO commentaries (id, verse_id, verse_number, author_id, author_name, lang, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                com["id"],
                com["verse_id"],
                com.get("verseNumber"),
                com.get("author_id"),
                com.get("authorName"),
                com.get("lang"),
                com.get("description")
            ))

    # Create Indexes for fast querying
    print("Building indexes...")
    cur.execute("CREATE INDEX idx_verses_chap_num ON verses(chapter_number, verse_number);")
    cur.execute("CREATE INDEX idx_trans_verse_id ON translations(verse_id);")
    cur.execute("CREATE INDEX idx_trans_verse_lang ON translations(verse_id, lang);")
    cur.execute("CREATE INDEX idx_comm_verse_id ON commentaries(verse_id);")
    cur.execute("CREATE INDEX idx_comm_verse_lang ON commentaries(verse_id, lang);")
    cur.execute("CREATE INDEX idx_comm_author ON commentaries(author_name);")

    # Build FTS5 Full-Text Search virtual table
    print("Building FTS5 search index...")
    cur.execute("""
    CREATE VIRTUAL TABLE verses_fts USING fts5(
        verse_id UNINDEXED,
        chapter_number UNINDEXED,
        verse_number UNINDEXED,
        text,
        transliteration,
        word_meanings
    );
    """)

    cur.execute("""
    INSERT INTO verses_fts (verse_id, chapter_number, verse_number, text, transliteration, word_meanings)
    SELECT id, chapter_number, verse_number, text, transliteration, word_meanings FROM verses;
    """)

    conn.commit()
    print("Optimizing and vacuuming database...")
    cur.execute("VACUUM;")
    conn.close()

    size_mb = os.path.getsize(output_db) / (1024 * 1024)
    print(f"Database generation complete! Output: {output_db} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    build_database()
