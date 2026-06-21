"use client";

import { useState, useEffect } from "react";
import { useAna } from "@/hooks/useAna";
import AnaTrigger from "./AnaTrigger";
import AnaListening from "./AnaListening";
import AnaThinking from "./AnaThinking";
import AnaResponseSheet from "./AnaResponseSheet";
import AnaMenuReader from "./AnaMenuReader";
import AnaWeatherAlert, { type WeatherAlert } from "./AnaWeatherAlert";

export default function AnaRoot() {
  const ana = useAna();
  const [weatherAlert, setWeatherAlert] = useState<WeatherAlert | null>(null);
  const [showAACReplies, setShowAACReplies] = useState(false);
  const [imageTask, setImageTask] = useState<
    "menu" | "sign" | "mail" | "describe_room" | "hazard_check" | "find_item"
  >("menu");

  useEffect(() => {
    fetch("/api/profiles/sync")
      .then((r) => r.json())
      .then(() => setShowAACReplies(false))
      .catch(() => {});
  }, []);

  const handleImageCapture = (
    base64: string,
    mediaType: "image/jpeg" | "image/png" | "image/webp",
    task: string
  ) => {
    ana.submitImage(base64, mediaType, task);
  };

  return (
    <>
      {weatherAlert && <AnaWeatherAlert alert={weatherAlert} />}
      {ana.state === "dormant" && <AnaTrigger onActivate={ana.activate} />}
      {ana.state === "listening" && <AnaListening transcript={ana.transcript} onDismiss={ana.dismiss} />}
      {ana.state === "thinking" && <AnaThinking statusText={ana.statusText} onDismiss={ana.dismiss} />}
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
      {ana.state === "image-reading" && (
        <AnaMenuReader task={imageTask} onCapture={handleImageCapture} onDismiss={ana.dismiss} />
      )}
    </>
  );
}
