"use client";

import { useEffect, useState } from "react";
import useVoiceNav, { NavPlace } from "@/hooks/useVoiceNav";
import useVoiceCommands from "@/hooks/useVoiceCommands";
import useConversationalAI from "@/hooks/useConversationalAI";
import useAIContextMemory from "@/hooks/useAIContextMemory";
import useLiveLocation from "@/hooks/useLiveLocation";
import useNearbyAccessiblePlaces from "@/hooks/useNearbyAccessiblePlaces";
import useProximityFeedback from "@/hooks/useProximityFeedback";
import useMapTheme from "@/hooks/useMapTheme";
import useDeviceSensors from "@/hooks/useDeviceSensors";
import useAdaptiveVoice from "@/hooks/useAdaptiveVoice";
import useEnvironmentAwareness from "@/hooks/useEnvironmentAwareness";
import useEmotionDetection, { Emotion } from "@/hooks/useEmotionDetection";
import useUserMemory from "@/hooks/useUserMemory";
import useAdaptivePersonality from "@/hooks/useAdaptivePersonality";
import useUserProfile from "@/hooks/useUserProfile";
import useOfflineRecovery from "@/hooks/useOfflineRecovery";
import useObstacleAvoidance from "@/hooks/useObstacleAvoidance";
import usePathPrediction from "@/hooks/usePathPrediction";
import useSafetyDetection from "@/hooks/useSafetyDetection";
import AccessibleMap from "@/components/AccessibleMap";

export default function VoiceNav({ places }: { places: NavPlace[] }) {
  const {
    steps,
    index,
    isSpeaking,
    isPaused,
    start,
    stop,
    pause,
    resume,
    next,
    prev,
    speakCurrent,
    autoAdvance,
    setAutoAdvance,
    proximity,
    offCourse,
  } = useVoiceNav(places);

  // 🧠 Context, GPS, and Theme
  const { memory, remember } = useAIContextMemory();
  const { coords } = useLiveLocation();
  const { theme, setTheme } = useMapTheme();

  // ♿ Nearby accessible places
  const { places: nearbyPlaces, loading: nearbyLoading } = useNearbyAccessiblePlaces(coords);

  // 🎧 Voice commands
  const { listening, setListening } = useVoiceCommands({
    onNext: next,
    onPrev: prev,
    onRepeat: speakCurrent,
    onStart: start,
    onPause: pause,
    onResume: resume,
    onStop: stop,
  });

  // 🤖 Conversational AI
  const [conversationMode, setConversationMode] = useState(false);
  const { processQuery, thinking } = useConversationalAI({
    onCommand: (cmd) => console.log("Voice Command:", cmd),
    onResponse: (reply) => {
      remember("User", reply);
      console.log("AI Reply:", reply);
    },
  });

  // 🔔 Proximity Feedback
  const [proximityAlerts, setProximityAlerts] = useState(true);
  useProximityFeedback({
    enabled: proximityAlerts,
    points: (nearbyPlaces || []).map((p) => ({
      id: p.id,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      category: p.category,
    })),
    coords: coords ? { lat: coords.lat, lng: coords.lng } : null,
    vibrateAt: [50, 20],
    minBeepIntervalMs: 500,
    maxBeepIntervalMs: 2200,
    nearestOnly: true,
  });

  // 📱 Motion Sensor Awareness
  const [motionActive, setMotionActive] = useState(false);
  const { setEnabled } = useDeviceSensors({
    onShake: () => speakCurrent(),
    onTilt: (x) => {
      if (x > 25) next();
      if (x < -25) prev();
    },
  });
  useEffect(() => setEnabled(motionActive), [motionActive, setEnabled]);

  // 🔊 Adaptive Voice
  const { speak } = useAdaptiveVoice({ language: "en-US", defaultRate: 1, defaultPitch: 1 });

  // 🌍 Environment Awareness
  const env = useEnvironmentAwareness();
  useEffect(() => {
    if (env.brightness === "dim" && theme !== "dark") setTheme("dark");
    if (env.brightness === "bright" && theme === "dark") setTheme("light");
  }, [env.brightness, theme, setTheme]);

  useEffect(() => {
    if (env.noiseLevel > 80)
      speak({ text: "It's quite noisy — I'll speak louder for clarity.", context: "alert" });
  }, [env.noiseLevel, speak]);

  useEffect(() => {
    if (env.weather && ["61", "63", "65"].includes(env.weather))
      speak({ text: "It's raining — please be cautious on wet surfaces.", context: "alert" });
  }, [env.weather, speak]);

  // 😊 Emotion Detection
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("neutral");
  useEmotionDetection({
    onEmotionChange: (emotion) => {
      setCurrentEmotion(emotion);
      if (emotion === "frustrated")
        speak({
          text: "I sense frustration. Don’t worry, we’ll get through this together.",
          context: "calm",
        });
      if (emotion === "happy")
        speak({ text: "That’s the spirit! You’re doing great.", context: "approaching" });
    },
  });

  // 💾 User Memory
  const { prefs, updatePref } = useUserMemory();
  useEffect(() => {
    if (prefs.theme) setTheme(prefs.theme);
    if (prefs.proximityAlerts !== undefined) setProximityAlerts(prefs.proximityAlerts);
    if (prefs.motionEnabled !== undefined) setMotionActive(prefs.motionEnabled);
  }, [prefs, setTheme]);
  useEffect(() => updatePref("theme", theme), [theme]);
  useEffect(() => updatePref("proximityAlerts", proximityAlerts), [proximityAlerts]);
  useEffect(() => updatePref("motionEnabled", motionActive), [motionActive]);

  // 🧬 Adaptive Personality
  const { mode, adapt } = useAdaptivePersonality();
  useEffect(() => adapt(currentEmotion, offCourse ? 0.5 : 1), [currentEmotion, offCourse]);

  // 👤 Profile Integration
  const { profile, profiles, switchProfile, saveProfile, syncToCloud } = useUserProfile();
  useEffect(() => {
    if (profile.preferences.theme) setTheme(profile.preferences.theme);
  }, [profile]);
  useEffect(() => {
    saveProfile({
      ...profile,
      preferences: {
        ...profile.preferences,
        theme,
        proximityAlerts,
        motionEnabled: motionActive,
        personality: mode,
      },
    });
  }, [theme, proximityAlerts, motionActive, mode]);
  useEffect(() => {
    const i = setInterval(syncToCloud, 300000);
    return () => clearInterval(i);
  }, [syncToCloud]);

  // 🌐 Offline Recovery
  const { isOnline } = useOfflineRecovery({
    key: "accessana-route-cache",
    data: { places, nearbyPlaces },
    onRestore: () =>
      speak({ text: "Connection restored — resuming navigation.", context: "normal" }),
    onStatusChange: (online) =>
      !online && speak({ text: "You’re offline — using saved route data.", context: "alert" }),
  });

  // 🚧 Obstacle Avoidance
  const [rerouting, setRerouting] = useState(false);
  const { obstacle } = useObstacleAvoidance({
    coords,
    onObstacleDetected: (o) => {
      setRerouting(true);
      speak({ text: `Obstacle detected: ${o.type}. Rerouting...`, context: "alert" });
      setTimeout(() => {
        setRerouting(false);
        speak({ text: "New route ready — continuing.", context: "normal" });
      }, 5000);
    },
    onClear: () => !rerouting || speak({ text: "Obstacle cleared.", context: "normal" }),
  });

  // 🧭 Path Prediction + AI Hints
  const [nextStep, setNextStep] = useState<any>(null);
  usePathPrediction({
    steps,
    currentIndex: index,
    coords,
    onApproachingTurn: (s) => {
      setNextStep(s);
      speak({ text: `Next turn coming up — ${s.summary}`, context: "approaching" });
    },
    onHint: (hint) => speak({ text: hint, context: "normal" }),
  });

  // 🛡 Full Detection + Safety Mode
  const safety = useSafetyDetection({
    noiseLevel: env.noiseLevel,
    brightness: env.brightness,
    weather: env.weather,
    emotion: currentEmotion,
    obstacle: obstacle?.type || null,
    motionActive,
    onSafetyChange: (state) => {
      if (state.safeMode) {
        speak({ text: `Safety mode activated — ${state.reason}`, context: "alert" });
        pause();
      } else {
        speak({ text: "Safety conditions normal — resuming guidance.", context: "normal" });
        resume();
      }
    },
  });

  // 🗣 Voice Nav Events
  useEffect(() => {
    if (offCourse)
      speak({ text: "You’ve gone off route. Recalculating path.", context: "offcourse" });
  }, [offCourse, speak]);

  if (!places || places.length < 2) return null;

  // ================== UI ==================
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      {/* Profile Switcher */}
      <div className="flex items-center gap-2 mb-3">
        <label className="text-sm text-gray-600">👤 Profile:</label>
        <select
          value={profile.id}
          onChange={(e) => switchProfile(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500"
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          onClick={syncToCloud}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          ☁️ Sync
        </button>
      </div>

      {/* Safety Dashboard */}
      <div
        className={`text-xs mb-2 p-2 rounded-md border ${
          safety.safeMode
            ? "border-red-400 bg-red-50 text-red-700 animate-pulse"
            : "border-green-300 bg-green-50 text-green-700"
        }`}
      >
        🛡 Safety: {safety.safeMode ? "⚠ Active" : "✅ Normal"} | Noise: {env.noiseLevel} dB |
        Light: {env.brightness} | Mood: {currentEmotion} | Obstacle: {obstacle?.type || "None"}
      </div>

      {/* Connection + Prediction */}
      <div
        className={`text-xs mb-2 ${isOnline ? "text-emerald-600" : "text-amber-600 animate-pulse"}`}
      >
        {isOnline ? "🛰 Online — real-time guidance active" : "⚠ Offline — using cached routes"}
      </div>
      {nextStep && (
        <div className="text-xs text-indigo-600 mb-2">
          🔮 Upcoming: {nextStep.fromName} → {nextStep.toName}
        </div>
      )}
      {rerouting && (
        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-300 rounded-md px-3 py-1 mb-2 animate-pulse">
          🚧 Obstacle detected — rerouting…
        </div>
      )}

      {/* Map */}
      {coords && (
        <div className="mb-4">
          <AccessibleMap
            places={places}
            center={{ lat: coords.lat, lng: coords.lng }}
            selectedPlaceId={places[index]?.id}
            onPlaceSelect={(id) => console.log("Selected:", id)}
            showRoute
            showAccessibility
            nearbyPlaces={nearbyPlaces}
          />
          {nearbyLoading && (
            <div className="text-xs text-gray-500 mt-1 animate-pulse">
              🔄 Loading nearby places…
            </div>
          )}
        </div>
      )}
    </div>
  );
}
