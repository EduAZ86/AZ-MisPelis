import React, { useEffect, useCallback, useRef, useState } from "react";
import { View, StyleSheet, Text, Modal, useWindowDimensions } from "react-native";
import {
  VideoView,
  VideoPlayer,
  useVideoPlayer,
  useEvent,
  type VideoConfig,
  type onLoadData,
  type onProgressData,
} from "react-native-video";
import * as ScreenOrientation from "expo-screen-orientation";
import { SourcePicker } from "../source-picker/SourcePicker";
import { usePlaybackProgress, type PlaybackMetadata } from "../hooks/usePlaybackProgress";
import type { StreamSource } from "@core/types";

interface VideoPlayerViewProps {
  currentSource: StreamSource | null;
  sources: StreamSource[];
  onSelectSource: (source: StreamSource) => void;
  playbackError?: string | null;
  playback?: PlaybackMetadata;
}

export function VideoPlayerView({
  currentSource,
  sources,
  onSelectSource,
  playbackError,
  playback,
}: VideoPlayerViewProps) {
  if (!currentSource) {
    return null;
  }

  return (
    <VideoPlayerInner
      key={currentSource.key}
      currentSource={currentSource}
      sources={sources}
      onSelectSource={onSelectSource}
      playbackError={playbackError}
      playback={playback}
    />
  );
}

interface VideoPlayerInnerProps {
  currentSource: StreamSource;
  sources: StreamSource[];
  onSelectSource: (source: StreamSource) => void;
  playbackError?: string | null;
  playback?: PlaybackMetadata;
}

function VideoPlayerInner({ currentSource, sources, onSelectSource, playbackError, playback }: VideoPlayerInnerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const sourceConfig: VideoConfig = {
    uri: currentSource.url,
    headers: currentSource.headers,
    bufferConfig: { minBufferMs: 5000, maxBufferMs: 30000, bufferForPlaybackMs: 2000 },
  };

  const player = useVideoPlayer(sourceConfig, (p) => {
    p.mixAudioMode = "duckOthers";
    p.playInBackground = true;
    p.showNotificationControls = true;
  });

  const { saveProgress, getProgress, clearProgress } = usePlaybackProgress({
    input: playback?.input ?? { type: "movie", id: 0 },
    title: playback?.title,
    poster: playback?.poster,
    meta_score: playback?.meta_score,
  });

  const durationRef = useRef(0);
  const positionRef = useRef(0);
  const lastSavedRef = useRef(0);
  const resumedRef = useRef(false);

  const handleLoad = useCallback(
    (data: onLoadData) => {
      durationRef.current = Number.isFinite(data.duration) ? data.duration : 0;
      if (!resumedRef.current && durationRef.current > 0) {
        const saved = getProgress();
        if (saved > 0.01 && saved < 0.95) {
          player.seekTo(saved * durationRef.current);
        }
        resumedRef.current = true;
      }
    },
    [getProgress, player]
  );

  const handleProgress = useCallback(
    (data: onProgressData) => {
      const duration = durationRef.current;
      if (duration <= 0) return;
      positionRef.current = data.currentTime;
      const now = Date.now();
      if (now - lastSavedRef.current < 5000 && data.currentTime < duration - 5) return;
      lastSavedRef.current = now;
      saveProgress(data.currentTime, duration);
    },
    [saveProgress]
  );

  const handleEnd = useCallback(() => {
    clearProgress();
  }, [clearProgress]);

  useEvent(player, "onLoad", handleLoad);
  useEvent(player, "onProgress", handleProgress);
  useEvent(player, "onEnd", handleEnd);

  useEffect(() => {
    return () => {
      const duration = durationRef.current;
      const position = positionRef.current;
      if (duration > 0 && position > 0 && position < duration * 0.95) {
        saveProgress(position, duration);
      }
    };
  }, [saveProgress]);

  useEffect(() => {
    return () => {
      ScreenOrientation.unlockAsync().catch(() => {});
    };
  }, []);

  const handleFullscreenChange = useCallback((fullscreen: boolean) => {
    setIsFullscreen(fullscreen);
    if (fullscreen) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});
    } else {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    }
  }, []);

  const isLandscape = windowWidth > windowHeight;
  const shouldOverlay = isFullscreen || isLandscape;

  const exitOverlay = useCallback(() => {
    setIsFullscreen(false);
    ScreenOrientation.unlockAsync().catch(() => {});
  }, []);

  if (shouldOverlay) {
    return (
      <Modal visible animationType="none" transparent statusBarTranslucent onRequestClose={exitOverlay}>
        <View style={styles.fullscreen}>
          <VideoView
            style={{ width: windowWidth, height: windowHeight }}
            player={player}
            controls={true}
            resizeMode="contain"
            pictureInPicture={true}
            onFullscreenChange={handleFullscreenChange}
          />
          {playbackError && <Text style={styles.playbackError}>{playbackError}</Text>}
        </View>
      </Modal>
    );
  }

  const videoStyle = { width: "100%" as const, height: Math.round((windowWidth - 32) * 9 / 16) };

  return (
    <View style={styles.container}>
      <VideoView
        style={videoStyle}
        player={player}
        controls={true}
        resizeMode="contain"
        pictureInPicture={true}
        onFullscreenChange={handleFullscreenChange}
      />
      {playbackError && <Text style={styles.playbackError}>{playbackError}</Text>}
      <SourcePicker sources={sources} currentKey={currentSource.key} onSelect={onSelectSource} />
    </View>
  );
}

export type { VideoPlayer };

const styles = StyleSheet.create({
  container: { width: "100%", backgroundColor: "#000" },
  fullscreen: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  playbackError: { color: "#f44", padding: 8, textAlign: "center" },
});