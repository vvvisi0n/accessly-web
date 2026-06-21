"use client";

import { useState } from "react";
import { useAna } from "@/hooks/useAna";
import AnaTrigger from "./AnaTrigger";
import AnaListening from "./AnaListening";
import AnaThinking from "./AnaThinking";
import AnaResponseSheet from "./AnaResponseSheet";
import AnaMenuReader from "./AnaMenuReader";
import AnaWeatherAlert, { type WeatherAlert } from "./AnaWeatherAlert";

// AnaRoot mounts in the root layout and persists across every screen.
// All --ana colour tokens are used exclusively here; they appear nowhere else.

export default function AnaRoot() {
  const ana = useAna();
  const [weatherAlert, setWeatherAlert] = useState<WeatherAlert | null>(null);
  const [showAACReplies] = useState(false); // enabled when speech-impaired profile flag exists
  const [imageTask, setImageTask] = useState<
    "menu" | "sign" | "mail" | "describe_room" | "hazard_check" | "find_item"
  >("menu");

  const handleImageCapture = (
    base64: string,
    mediaType: "image/jpeg" | "image/png" | "image/webp",
    task: string
  ) => {
    ana.submitImage(base64, mediaType, task);
  };

  return (
    <>
      {/* Proactive weather / emotional check-in card */}
      {weatherAlert && <AnaWeatherAlert alert={weatherAlert} />}

      {/* Dormant — FAB with tooltip */}
      {ana.state === "dormant" && (
        <AnaTrigger onActivate={ana.activate} />
      )}

      {/* Listening — full-screen immersive overlay */}
      {ana.state === "listening" && (
        <AnaListening transcript={ana.transcript} onDismiss={ana.dismiss} />
      )}

      {/* Thinking — orb with bouncing dots + live step feed */}
      {ana.state === "thinking" && (
        <AnaThinking statusText={ana.statusText} onDismiss={ana.dismiss} />
      )}

      {/* Responding — bottom sheet chat interface */}
      {ana.state === "responding" && (
        <AnaResponseSheet
          messages={ana.messages}
          isSpeaking={ana.isSpeaking}
          showAACReplies={showAACReplies}
          onSendText={ana.sendText}
          onVoiceActivate={ana.activate}
          onDismiss={ana.dismiss}
        />
      )}

      {/* Image reading — camera view for all read_image tasks */}
      {ana.state === "image-reading" && (
        <AnaMenuReader
          task={imageTask}
          onCapture={handleImageCapture}
          onDismiss={ana.dismiss}
        />
      )}
    </>
  );
}
