"use client";

import { motion } from "framer-motion";

/**
 * VoiceVisualizer Component
 * -------------------------
 * Animated bars that visualize AI voice output while speaking.
 *
 * Props:
 * - isSpeaking: boolean — whether the AI voice is currently playing
 */

interface VoiceVisualizerProps {
  isSpeaking: boolean;
}

export default function VoiceVisualizer({ isSpeaking }: VoiceVisualizerProps) {
  return (
    <div className="flex items-center justify-center gap-[3px]">
      {[0, 1, 2, 3, 4].map((bar) => (
        <motion.div
          key={bar}
          animate={{
            scaleY: isSpeaking ? [1, 2.5, 1] : 1,
            opacity: isSpeaking ? [0.6, 1, 0.6] : 0.3,
          }}
          transition={{
            repeat: isSpeaking ? Infinity : 0,
            repeatType: "mirror",
            duration: 0.6 + bar * 0.05,
            ease: "easeInOut",
          }}
          className={`w-[3px] h-[15px] rounded-full ${isSpeaking ? "bg-blue-500" : "bg-gray-400"}`}
        />
      ))}
    </div>
  );
}
