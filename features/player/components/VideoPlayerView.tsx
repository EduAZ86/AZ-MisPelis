import React, { useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import { VideoView, VideoPlayer, useVideoPlayer, type VideoConfig } from "react-native-video";
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
    player.play();
  }, [player]);

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        controls={true}
        resizeMode="cover"
        pictureInPicture={true}
      />
      {playbackError && <Text style={styles.playbackError}>{playbackError}</Text>}
      <SourcePicker sources={sources} currentKey={currentSource.key} onSelect={onSelectSource} />
    </View>
  );
}

export type { VideoPlayer };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  video: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000" },
  loadingText: { color: "#fff", marginTop: 12, textAlign: "center" },
  playbackError: { color: "#f44", padding: 8, textAlign: "center" },
});