# 🪷 Bhagavad Gita (श्रीमद्भगवद्गीता) - 100% Offline Android App

A completely offline, modern Android application for reading, searching, and listening to the sacred **Bhagavad Gita**. Built with **React Native**, **Expo**, **SQLite (FTS5)**, and local Sanskrit audio recitations.

---

## 🌟 Key Features

1. **100% Offline**:
   - Zero internet connectivity required.
   - All 18 chapters, 701 verses, 4,907 translations, and 11,186 commentaries reside in a pre-compiled, indexed **SQLite database (`gita.db`)**.
   - Sub-millisecond query responses across the entire dataset.

2. **Complete Audio Recitations**:
   - High-quality Sanskrit recitations for all 701 verses bundled locally.
   - Continuous chapter playback (auto-advances to next verse).
   - Speed controls (`0.75x`, `1.0x`, `1.25x`, `1.5x`).
   - Floating mini audio bar across all screens with interactive progress and scrubbing.

3. **Spiritual Reading Experience**:
   - Beautiful Devanagari Sanskrit typography.
   - Full Roman transliteration (IAST).
   - Word-by-word Sanskrit to English / Hindi meanings.
   - Multi-commentator and translation selection (Swami Chinmayananda, Swami Sivananda, Adi Shankaracharya, Ramanujacharya, Swami Ramsukhdas, etc.).
   - Bilingual support: switch between English and Hindi.

4. **Lightning-Fast Full-Text Search (FTS5)**:
   - Instant search across verses, transliterations, word meanings, and translations.
   - Curated topic exploration chips (*Karma, Dharma, Bhakti, Yoga, Mind Control, Peace, Anger, Duty*).

5. **Personalization**:
   - Shloka of the Day daily reflection card.
   - Offline bookmarks for quick access to favorite verses.
   - Private personal notes and reflections per verse, persisted in SQLite.
   - Day / Night spiritual themes (*Sattvic Cream* & *Deep Temple Slate*).
   - Scalable typography size (`Small`, `Medium`, `Large`, `Extra Large`).

---

## 🚀 Running on Your Android Device

### Option 1: Instant Testing via Expo Go (No Android Studio required!)
1. Install **Expo Go** from Google Play Store on your Android phone.
2. Ensure your phone and computer are on the same Wi-Fi network.
3. In the `mobile/` directory, run:
   ```bash
   npm start
   ```
4. Scan the displayed QR code with your Android phone's Expo Go app or camera.
5. The Gita app will load and work completely offline!

---

### Option 2: Build a Standalone Android APK (for installation without Expo Go)
To generate an installable `.apk` file:
```bash
# Install EAS CLI globally if not already installed
npm install -g eas-cli

# Log in to your Expo account
eas login

# Build standalone Android APK
eas build -p android --profile preview
```

---

## 🗄️ Project Architecture

```
mobile/
├── assets/
│   ├── gita.db               # Pre-compiled, indexed SQLite database (~32MB)
│   ├── audio/                # 701 Sanskrit MP3 recitation files across chapters 1-18
│   ├── icon.png              # App icon
│   └── splash-icon.png       # Splash screen graphic
├── src/
│   ├── components/
│   │   ├── Header.tsx        # Spiritual header with theme toggle & back navigation
│   │   └── AudioBar.tsx      # Persistent floating audio player bar
│   ├── context/
│   │   ├── ThemeContext.tsx  # Spiritual Day/Night color palettes & font sizing
│   │   └── AudioContext.tsx  # Global recitation player with auto-advance & speed
│   ├── screens/
│   │   ├── HomeScreen.tsx    # Daily shloka + 18 Gita chapters list
│   │   ├── ChapterScreen.tsx # Chapter summary (EN/HI) + verses list + play all
│   │   ├── VerseScreen.tsx   # Sanskrit reader, word breakdown, commentators, notes
│   │   ├── SearchScreen.tsx  # Instant SQLite FTS5 search + topical filters
│   │   └── BookmarksScreen.tsx # Saved verses collection & management
│   ├── services/
│   │   ├── db.ts             # SQLite service layer with sub-millisecond queries
│   │   └── audioMap.ts       # Mapped audio asset registry for 701 verses
│   └── types/
│       └── gita.ts           # TypeScript interfaces for Chapter, Verse, Translation, Commentary
├── App.tsx                   # Main app entry, navigation stack, safe area handling
└── app.json                  # Expo Android application configuration
```
