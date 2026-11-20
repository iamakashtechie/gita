import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';

interface AudioBarProps {
  onPressTrack?: (chapterNumber: number, verseNumber: number) => void;
}

export const AudioBar: React.FC<AudioBarProps> = ({ onPressTrack }) => {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    position,
    duration,
    playbackSpeed,
    autoPlayNext,
    pauseAudio,
    resumeAudio,
    stopAudio,
    setSpeed,
    toggleAutoPlayNext,
  } = useAudio();
  const { colors } = useTheme();

  if (!currentTrack) {
    return null;
  }

  const formatTime = (totalSeconds: number) => {
    const rounded = Math.floor(totalSeconds);
    const minutes = Math.floor(rounded / 60);
    const seconds = rounded % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (position / duration) * 100)) : 0;

  const cycleSpeed = () => {
    if (playbackSpeed === 1.0) setSpeed(1.25);
    else if (playbackSpeed === 1.25) setSpeed(1.5);
    else if (playbackSpeed === 1.5) setSpeed(0.75);
    else setSpeed(1.0);
  };

  return (
    <View style={styles.outerWrapper}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            shadowColor: '#000',
          },
        ]}
      >
        {/* Progress Track */}
        <View style={[styles.progressTrack, { backgroundColor: colors.pillBg }]}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progressPercent}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>

        <View style={styles.contentRow}>
          {/* Track Info */}
          <TouchableOpacity
            style={styles.infoContainer}
            onPress={() => onPressTrack?.(currentTrack.chapterNumber, currentTrack.verseNumber)}
            activeOpacity={0.7}
          >
            <View style={[styles.soundIconBadge, { backgroundColor: colors.primaryLight }]}>
              <Ionicons
                name={isPlaying ? 'volume-high' : 'volume-medium'}
                size={18}
                color={colors.primary}
              />
            </View>
            <View style={styles.textDetails}>
              <Text style={[styles.trackTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                Adhyaya {currentTrack.chapterNumber} • Shloka {currentTrack.verseNumber}
              </Text>
              <Text style={[styles.timeText, { color: colors.textMuted }]}>
                {formatTime(position)} / {formatTime(duration)}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Action Controls */}
          <View style={styles.controlsRow}>
            {/* Speed Toggle */}
            <TouchableOpacity
              onPress={cycleSpeed}
              style={[styles.controlPill, { backgroundColor: colors.pillBg }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.speedText, { color: colors.primary }]}>{playbackSpeed}x</Text>
            </TouchableOpacity>

            {/* Auto Next Verse Toggle */}
            <TouchableOpacity
              onPress={toggleAutoPlayNext}
              style={[
                styles.iconBtn,
                { backgroundColor: autoPlayNext ? colors.primaryLight : colors.pillBg },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons
                name="repeat"
                size={16}
                color={autoPlayNext ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>

            {/* Play / Pause / Loading */}
            <TouchableOpacity
              onPress={isPlaying ? pauseAudio : resumeAudio}
              style={[styles.playButton, { backgroundColor: colors.primary }]}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            {/* Close Player */}
            <TouchableOpacity onPress={stopAudio} style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    paddingTop: 4,
  },
  container: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  progressTrack: {
    height: 4,
    width: '100%',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  soundIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textDetails: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  controlPill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {
    fontSize: 11,
    fontWeight: '800',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C25E00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});
