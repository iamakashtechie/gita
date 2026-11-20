# 🕉️ The Bhagavad Gita (श्रीमद्भगवद्गीता)

The complete open-source Bhagavad Gita dataset and **100% Offline Android Application** built with React Native & Expo.

![krishna-arjuna-1170x721](https://user-images.githubusercontent.com/62856848/194565916-2f0d5a4e-a038-4dcf-ba8d-1fd4f789a4a0.png)

---

## 📱 Offline Android App (`mobile/`)

A modern, fast, completely offline Android application for reading, searching, and listening to the Gita:

* **100% Offline**: Pre-compiled SQLite database with full-text search (FTS5) for sub-millisecond query responses.
* **Audio Recitations**: High-quality Sanskrit recitation audio for all 701 verses bundled locally with speed controls and auto-advance.
* **Devanagari Sanskrit Typography**: Sanskrit shlokas, English transliteration (IAST), and word-by-word breakdowns.
* **Multiple Commentaries & Translations**: Includes commentaries and translations from Adi Shankaracharya, Swami Sivananda, Swami Chinmayananda, Ramanujacharya, and Swami Ramsukhdas.
* **Spiritual Themes**: Sattvic Cream (Day) and Deep Temple Slate (Night) modes with adjustable font scaling.
* **Personalization**: Shloka of the Day, offline bookmarks, and personal reflection notes.

### Quick Start (Run on Your Android Phone)

```bash
# Navigate to the mobile app folder
cd mobile

# Install dependencies (if not already installed)
npm install

# Start the Expo development server
npx expo start -c
```
Scan the displayed QR code using the **Expo Go** app on your Android phone.

For instructions on building a standalone installable `.apk`, see [mobile/README.md](mobile/README.md).

---

## 🗃️ Dataset Architecture

* **18 Chapters** (`data/chapters.json`): Sanskrit names, meanings, English translations, and summaries in Hindi & English.
* **701 Verses** (`data/verse.json`): Sanskrit Devanagari shlokas, transliteration, and word-by-word meanings.
* **4,907 Translations** (`data/translation.json`): Multilingual translations across 21 authors in English, Hindi, and Sanskrit.
* **11,186 Commentaries** (`data/commentary.json`): Ancient and contemporary commentaries.
* **Audio Recitations** (`data/verse_recitation/`): Sanskrit verse recitation MP3s.

### Generating the Offline SQLite Database
```bash
python3 scripts/generate_sqlite_db.py
```
This compiles the raw JSON files into an indexed SQLite database with FTS5 search.

---

## 🙏 What is the Bhagavad Gita
- The Bhagavad Gita is one of the most prominent Hindu texts, forming a part of the Indian epic known as Mahabharata. 
- Originally written in Sanskrit, the Bhagavad Gita was composed between the 5th and 2nd century BCE.
- It is a guidebook to lead a purposeful and blissful life.
- Lord Krishna imparted this divine wisdom to Arjuna on the battlefield of Kurukshetra.

## 🌸 Relevance in Modern Times
The Bhagavad Gita provides timeless guidance for overcoming confusion, grief, and anxiety, cultivating inner stability, focus, and devotion in our daily lives.

---

## 🚀 Original Sites & Support
- https://bhagavadgita.io/
- https://vedvyas.org/
- https://radhakrishna.net/
- https://hanumanchalisa.net/
