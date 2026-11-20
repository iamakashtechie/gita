import React, { useState, useEffect, Suspense } from 'react';
import { View, Text, StyleSheet, BackHandler, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SQLiteProvider } from 'expo-sqlite';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AudioProvider } from './src/context/AudioContext';
import { Header } from './src/components/Header';
import { AudioBar } from './src/components/AudioBar';

import { HomeScreen } from './src/screens/HomeScreen';
import { ChapterScreen } from './src/screens/ChapterScreen';
import { VerseScreen } from './src/screens/VerseScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { BookmarksScreen } from './src/screens/BookmarksScreen';

export type ScreenState =
  | { name: 'home' }
  | { name: 'chapter'; chapterNumber: number }
  | { name: 'verse'; chapterNumber: number; verseNumber: number }
  | { name: 'search' }
  | { name: 'bookmarks' };

function MainNavigator() {
  const { colors, isDarkMode } = useTheme();
  const [screenStack, setScreenStack] = useState<ScreenState[]>([{ name: 'home' }]);

  const currentScreen = screenStack[screenStack.length - 1];

  const navigateTo = (screen: ScreenState) => {
    setScreenStack((prev) => [...prev, screen]);
  };

  const goBack = () => {
    if (screenStack.length > 1) {
      setScreenStack((prev) => prev.slice(0, prev.length - 1));
      return true;
    }
    return false;
  };

  // Hardware Back Button handling for Android
  useEffect(() => {
    const onBackPress = () => {
      return goBack();
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [screenStack]);

  const getHeaderProps = () => {
    switch (currentScreen.name) {
      case 'home':
        return {
          title: 'श्रीमद्भगवद्गीता',
          subtitle: 'The Divine Song of God',
          showBack: false,
        };
      case 'chapter':
        return {
          title: `Chapter ${currentScreen.chapterNumber}`,
          subtitle: 'Adhyaya Overview',
          showBack: true,
          onBack: goBack,
        };
      case 'verse':
        return {
          title: `Shloka ${currentScreen.chapterNumber}.${currentScreen.verseNumber}`,
          subtitle: 'Sacred Recitation & Meanings',
          showBack: true,
          onBack: goBack,
        };
      case 'search':
        return {
          title: 'Search Gita',
          subtitle: '701 Verses & Translations',
          showBack: true,
          onBack: goBack,
        };
      case 'bookmarks':
        return {
          title: 'Saved Verses',
          subtitle: 'Personal Collection & Notes',
          showBack: true,
          onBack: goBack,
        };
    }
  };

  const renderActiveScreen = () => {
    switch (currentScreen.name) {
      case 'home':
        return (
          <HomeScreen
            onSelectChapter={(ch) => navigateTo({ name: 'chapter', chapterNumber: ch })}
            onSelectVerse={(ch, v) => navigateTo({ name: 'verse', chapterNumber: ch, verseNumber: v })}
            onOpenSearch={() => navigateTo({ name: 'search' })}
            onOpenBookmarks={() => navigateTo({ name: 'bookmarks' })}
          />
        );
      case 'chapter':
        return (
          <ChapterScreen
            chapterNumber={currentScreen.chapterNumber}
            onBack={goBack}
            onSelectVerse={(ch, v) => navigateTo({ name: 'verse', chapterNumber: ch, verseNumber: v })}
          />
        );
      case 'verse':
        return (
          <VerseScreen
            chapterNumber={currentScreen.chapterNumber}
            verseNumber={currentScreen.verseNumber}
            onNavigateVerse={(ch, v) => {
              setScreenStack((prev) => [
                ...prev.slice(0, prev.length - 1),
                { name: 'verse', chapterNumber: ch, verseNumber: v },
              ]);
            }}
            onBack={goBack}
          />
        );
      case 'search':
        return (
          <SearchScreen
            onSelectVerse={(ch, v) => navigateTo({ name: 'verse', chapterNumber: ch, verseNumber: v })}
            onBack={goBack}
          />
        );
      case 'bookmarks':
        return (
          <BookmarksScreen
            onSelectVerse={(ch, v) => navigateTo({ name: 'verse', chapterNumber: ch, verseNumber: v })}
            onBack={goBack}
          />
        );
    }
  };

  const headerProps = getHeaderProps();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.cardBackground }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Header
        title={headerProps.title}
        subtitle={headerProps.subtitle}
        showBack={headerProps.showBack}
        onBack={headerProps.onBack}
      />
      <View style={[styles.screenContainer, { backgroundColor: colors.background }]}>
        {renderActiveScreen()}
      </View>
      <AudioBar
        onPressTrack={(ch, v) => {
          if (
            currentScreen.name !== 'verse' ||
            currentScreen.chapterNumber !== ch ||
            currentScreen.verseNumber !== v
          ) {
            navigateTo({ name: 'verse', chapterNumber: ch, verseNumber: v });
          }
        }}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Suspense
        fallback={
          <View style={styles.fallbackContainer}>
            <ActivityIndicator size="large" color="#B45309" />
            <Text style={styles.fallbackInvocation}>॥ ॐ श्री परमात्मने नमः ॥</Text>
            <Text style={styles.fallbackText}>Loading offline Bhagavad Gita...</Text>
          </View>
        }
      >
        <SQLiteProvider
          databaseName="gita.db"
          assetSource={{
            assetId: require('./assets/gita.db'),
            forceOverwrite: true,
          }}
          useSuspense
        >
          <ThemeProvider>
            <AudioProvider>
              <MainNavigator />
            </AudioProvider>
          </ThemeProvider>
        </SQLiteProvider>
      </Suspense>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF7F2',
  },
  fallbackInvocation: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '700',
    color: '#92400E',
  },
  fallbackText: {
    marginTop: 6,
    fontSize: 13,
    color: '#4B5563',
  },
});
