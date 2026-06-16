"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GoogleMap, HeatmapLayerF, useLoadScript } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "90vh",
};

const center = { lat: 40.7128, lng: -74.006 }; // Default → NYC

export default function AccessibilityHeatmap() {
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["visualization"],
  });

  useEffect(() => {
    const fetchData = async () => {
      const querySnap = await getDocs(collection(db, "reviews"));
      const points: any[] = [];

      querySnap.forEach((doc) => {
        const data = doc.data() as any;
        if (!data.location || !data.aiAnalysis?.score) return;

        const { lat, lng } = data.location; // store lat/lng in Firestore when reviews are created
        const score = data.aiAnalysis.score;

        // 🔥 Weight high = accessible, low = less accessible
        const weight = score >= 80 ? 3 : score >= 50 ? 1.5 : 0.5;

        points.push({ location: new google.maps.LatLng(lat, lng), weight });
      });

      setHeatmapData(points);
    };

    fetchData();
  }, []);

  if (!isLoaded) return <div className="p-6">Loading map...</div>;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-blue-700">🗺️ Accessibility Heatmap</h1>
      <p className="text-gray-600">
        Visualizing Accessibility Scores based on user reviews and AI analysis.
      </p>
      <GoogleMap mapContainerStyle={mapContainerStyle} zoom={12} center={center}>
        {heatmapData.length > 0 && (
          <HeatmapLayerF
            data={heatmapData}
            options={{
              radius: 30,
              opacity: 0.7,
              gradient: [
                "rgba(255, 0, 0, 0)",
                "rgba(255, 0, 0, 1)",
                "rgba(255, 255, 0, 1)",
                "rgba(0, 255, 0, 1)",
              ],
            }}
          />
        )}
      </GoogleMap>
    </main>
  );
}
