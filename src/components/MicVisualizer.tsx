"use client";

import { motion } from "framer-motion";

/**
 * MicVisualizer Component
 * -----------------------
 * Animated pulsing waves that visualize when the microphone is active.
 *
 * Props:
 * - isListening: boolean - whether the mic is active
 */

interface MicVisualizerProps {
  isListening: boolean;
}

export default function MicVisualizer({ isListening }: MicVisualizerProps) {
  return (
    <div className="flex items-center justify-center gap-[3px]">
      {[0, 1, 2, 3, 4].map((bar) => (
        <motion.div
          key={bar}
          animate={{
            scaleY: isListening ? [1, 2.5, 1] : 1,
            opacity: isListening ? [0.6, 1, 0.6] : 0.4,
          }}
          transition={{
            repeat: isListening ? Infinity : 0,
            repeatType: "mirror",
            duration: 0.6 + bar * 0.05,
            ease: "easeInOut",
          }}
          className={`w-[3px] h-[15px] rounded-full ${isListening ? "bg-red-500" : "bg-gray-400"}`}
        />
      ))}
    </div>
  );
}
