import React, { useEffect, useCallback, useState } from "react";
import { View, StyleSheet, Text, Modal, useWindowDimensions } from "react-native";
import { VideoView, VideoPlayer, useVideoPlayer, type VideoConfig } from "react-native-video";
import * as ScreenOrientation from "expo-screen-orientation";
import { SourcePicker } from "../source-picker/SourcePicker";
import type { StreamSource } from "@core/types";

interface VideoPlayerViewProps {
  currentSource: StreamSource | null;
  sources: StreamSource[];
  onSelectSource: (source: StreamSource) => void;
  playbackError?: string | null;
}

export function VideoPlayerView({
  currentSource,
  sources,
  onSelectSource,
  playbackError,
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
    />
  );
}

interface VideoPlayerInnerProps {
  currentSource: StreamSource;
  sources: StreamSource[];
  onSelectSource: (source: StreamSource) => void;
  playbackError?: string | null;
}

function VideoPlayerInner({ currentSource, sources, onSelectSource, playbackError }: VideoPlayerInnerProps) {
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