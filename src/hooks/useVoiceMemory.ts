"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export type VoiceProfile = {
  voiceName: string;
  tone: "friendly" | "professional" | "motivational" | "calm" | "alert";
  rate: number;
  pitch: number;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function useVoiceMemory(userId?: string) {
  const [profile, setProfile] = useState<VoiceProfile | null>(null);

  // 🔁 Local load
  useEffect(() => {
    const saved = localStorage.getItem("accessly_voice_profile");
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    }
  }, []);

  // ☁️ Cloud fetch if logged in
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase
        .from("voice_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (data) {
        setProfile({
          voiceName: data.voice_name,
          tone: data.tone,
          rate: data.rate,
          pitch: data.pitch,
        });
        localStorage.setItem(
          "accessly_voice_profile",
          JSON.stringify({
            voiceName: data.voice_name,
            tone: data.tone,
            rate: data.rate,
            pitch: data.pitch,
          })
        );
      }
    })();
  }, [userId]);

  // 💾 Save both locally + to cloud
  const updateVoiceProfile = async (updates: Partial<VoiceProfile>) => {
    const newProfile = { ...profile, ...updates } as VoiceProfile;
    setProfile(newProfile);
    localStorage.setItem("accessly_voice_profile", JSON.stringify(newProfile));

    if (userId) {
      await supabase.from("voice_profiles").upsert({
        user_id: userId,
        voice_name: newProfile.voiceName,
        tone: newProfile.tone,
        rate: newProfile.rate,
        pitch: newProfile.pitch,
        updated_at: new Date().toISOString(),
      });
    }
  };

  return { profile, updateVoiceProfile };
}
