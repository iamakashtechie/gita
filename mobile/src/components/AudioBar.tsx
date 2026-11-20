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
    <View style={[styles.container, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
      {/* Progress Line */}
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View style={[styles.progressBar, { width: `${progressPercent}%`, backgroundColor: colors.accent }]} />
      </View>

      <View style={styles.contentRow}>
        {/* Track Info */}
        <TouchableOpacity
          style={styles.infoContainer}
          onPress={() => onPressTrack?.(currentTrack.chapterNumber, currentTrack.verseNumber)}
          activeOpacity={0.7}
        >
          <View style={[styles.soundIconBadge, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="volume-high" size={16} color={colors.primary} />
          </View>
          <View style={styles.textDetails}>
            <Text style={[styles.trackTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              Chapter {currentTrack.chapterNumber} • Shloka {currentTrack.verseNumber}
            </Text>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              {formatTime(position)} / {formatTime(duration)}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Action Controls */}
        <View style={styles.controlsRow}>
          {/* Speed Toggle */}
          <TouchableOpacity onPress={cycleSpeed} style={[styles.controlButton, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.speedText, { color: colors.primary }]}>{playbackSpeed}x</Text>
          </TouchableOpacity>

          {/* Auto Next Verse */}
          <TouchableOpacity onPress={toggleAutoPlayNext} style={styles.controlButton}>
            <Ionicons
              name={autoPlayNext ? 'repeat' : 'arrow-forward'}
              size={18}
              color={autoPlayNext ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>

          {/* Play / Pause / Loading */}
          <TouchableOpacity
            onPress={isPlaying ? pauseAudio : resumeAudio}
            style={[styles.playButton, { backgroundColor: colors.primary }]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          {/* Close Player */}
          <TouchableOpacity onPress={stopAudio} style={styles.controlButton}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  progressTrack: {
    height: 3,
    width: '100%',
    borderRadius: 2,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
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
  },
  soundIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textDetails: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 11,
    marginTop: 1,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  controlButton: {
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {
    fontSize: 11,
    fontWeight: '700',
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
});
