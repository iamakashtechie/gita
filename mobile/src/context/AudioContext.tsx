import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { createAudioPlayer, setAudioModeAsync, AudioPlayer, AudioStatus } from 'expo-audio';
import { getAudioSource } from '../services/audioMap';

interface AudioContextType {
  currentTrack: { chapterNumber: number; verseNumber: number } | null;
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  playbackSpeed: number;
  autoPlayNext: boolean;
  playVerse: (chapterNumber: number, verseNumber: number) => Promise<void>;
  pauseAudio: () => void;
  resumeAudio: () => void;
  stopAudio: () => void;
  seekAudio: (seconds: number) => Promise<void>;
  setSpeed: (speed: number) => void;
  toggleAutoPlayNext: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<{ chapterNumber: number; verseNumber: number } | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(1);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(true);

  const playerRef = useRef<AudioPlayer | null>(null);
  const subRef = useRef<{ remove: () => void } | null>(null);
  const currentTrackRef = useRef(currentTrack);
  const autoPlayNextRef = useRef(autoPlayNext);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    autoPlayNextRef.current = autoPlayNext;
  }, [autoPlayNext]);

  useEffect(() => {
    // Configure audio mode for background audio & speaker playback
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      shouldRouteThroughEarpiece: false,
    }).catch(console.error);

    return () => {
      if (subRef.current) {
        subRef.current.remove();
        subRef.current = null;
      }
      if (playerRef.current) {
        try {
          playerRef.current.release();
        } catch (e) {}
        playerRef.current = null;
      }
    };
  }, []);

  const handleStatusUpdate = (status: AudioStatus) => {
    setPosition(status.currentTime || 0);
    if (status.duration && status.duration > 0) {
      setDuration(status.duration);
    }
    setIsPlaying(status.playing);

    if (status.didJustFinish && !status.loop) {
      setIsPlaying(false);
      // Auto-advance to next verse in the chapter if enabled
      if (autoPlayNextRef.current && currentTrackRef.current) {
        const nextVerse = currentTrackRef.current.verseNumber + 1;
        playVerse(currentTrackRef.current.chapterNumber, nextVerse).catch(() => {
          // Finished chapter or no more verses
        });
      }
    }
  };

  const playVerse = async (chapterNumber: number, verseNumber: number) => {
    const source = getAudioSource(chapterNumber, verseNumber);
    if (!source) {
      console.warn(`No audio found for verse ${chapterNumber}.${verseNumber}`);
      return;
    }

    try {
      setIsLoading(true);

      // Clean up previous player
      if (subRef.current) {
        subRef.current.remove();
        subRef.current = null;
      }
      if (playerRef.current) {
        try {
          playerRef.current.release();
        } catch (e) {}
        playerRef.current = null;
      }

      setCurrentTrack({ chapterNumber, verseNumber });

      const player = createAudioPlayer(source);
      player.setPlaybackRate(playbackSpeed);

      const sub = player.addListener('playbackStatusUpdate', handleStatusUpdate);
      subRef.current = sub;
      playerRef.current = player;

      player.play();
      setIsLoading(false);
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play verse audio with expo-audio:', error);
      setIsLoading(false);
    }
  };

  const pauseAudio = () => {
    if (playerRef.current) {
      playerRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resumeAudio = () => {
    if (playerRef.current) {
      playerRef.current.play();
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (playerRef.current) {
      playerRef.current.pause();
      playerRef.current.seekTo(0);
      setIsPlaying(false);
      setPosition(0);
    }
    setCurrentTrack(null);
  };

  const seekAudio = async (seconds: number) => {
    if (playerRef.current) {
      await playerRef.current.seekTo(seconds);
      setPosition(seconds);
    }
  };

  const setSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(speed);
    }
  };

  const toggleAutoPlayNext = () => {
    setAutoPlayNext((prev) => !prev);
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isLoading,
        position,
        duration,
        playbackSpeed,
        autoPlayNext,
        playVerse,
        pauseAudio,
        resumeAudio,
        stopAudio,
        seekAudio,
        setSpeed,
        toggleAutoPlayNext,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export function useAudio(): AudioContextType {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
