"use client";

import { useState, useEffect } from "react";

export interface UserProfile {
  id: string;
  name: string;
  language: string;
  voice: string;
  preferences: {
    theme: string;
    proximityAlerts: boolean;
    motionEnabled: boolean;
    personality: string;
  };
}

const DEFAULT_PROFILE: UserProfile = {
  id: "guest",
  name: "Guest User",
  language: "en",
  voice: "default",
  preferences: {
    theme: "light",
    proximityAlerts: true,
    motionEnabled: false,
    personality: "calm",
  },
};

export default function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [profiles, setProfiles] = useState<UserProfile[]>([DEFAULT_PROFILE]);

  // Load from local storage or cloud
  useEffect(() => {
    const stored = localStorage.getItem("accessana-user-profiles");
    if (stored) setProfiles(JSON.parse(stored));
    const current = localStorage.getItem("accessana-current-profile");
    if (current) {
      const found = JSON.parse(current);
      setProfile(found);
    }
  }, []);

  // Persist on change
  useEffect(() => {
    localStorage.setItem("accessana-user-profiles", JSON.stringify(profiles));
    localStorage.setItem("accessana-current-profile", JSON.stringify(profile));
  }, [profile, profiles]);

  function switchProfile(id: string) {
    const found = profiles.find((p) => p.id === id);
    if (found) setProfile(found);
  }

  function saveProfile(updated: UserProfile) {
    setProfiles((prev) => {
      const existing = prev.filter((p) => p.id !== updated.id);
      return [...existing, updated];
    });
    setProfile(updated);
  }

  async function syncToCloud() {
    try {
      const res = await fetch("/api/profiles/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profiles }),
      });
      if (!res.ok) throw new Error("Cloud sync failed");
      console.log("☁️ Profiles synced successfully");
    } catch (err) {
      console.error("Cloud sync error:", err);
    }
  }

  return { profile, profiles, setProfile, saveProfile, switchProfile, syncToCloud };
}
