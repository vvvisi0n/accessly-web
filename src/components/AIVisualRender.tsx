"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface Props {
  mode: "2D" | "3D";
  coords: { lat: number; lng: number };
  obstacles?: { lat: number; lng: number; label: string }[];
  ramps?: { lat: number; lng: number; label: string }[];
}

export default function AIVisualRender({ mode, coords, obstacles = [], ramps = [] }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const threeRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  // 🗺 Mapbox 2D visualization
  useEffect(() => {
    if (mode === "2D" && mapRef.current) {
      const map = new mapboxgl.Map({
        container: mapRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [coords.lng, coords.lat],
        zoom: 16,
      });

      map.on("load", () => {
        setLoaded(true);

        // Ramp markers
        ramps.forEach((r) => {
          new mapboxgl.Marker({ color: "#10B981" })
            .setLngLat([r.lng, r.lat])
            .setPopup(new mapboxgl.Popup().setText(`♿ Ramp: ${r.label}`))
            .addTo(map);
        });

        // Obstacle markers
        obstacles.forEach((o) => {
          new mapboxgl.Marker({ color: "#EF4444" })
            .setLngLat([o.lng, o.lat])
            .setPopup(new mapboxgl.Popup().setText(`⚠️ Obstacle: ${o.label}`))
            .addTo(map);
        });
      });

      return () => map.remove();
    }
  }, [mode, coords, ramps, obstacles]);

  // 🧱 Three.js 3D visualization
  useEffect(() => {
    if (mode === "3D" && threeRef.current) {
      const width = threeRef.current.clientWidth;
      const height = threeRef.current.clientHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      threeRef.current.appendChild(renderer.domElement);

      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(5, 10, 7.5);
      scene.add(light);

      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshStandardMaterial({ color: 0xe5e5e5 })
      );
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      // Obstacles (red cubes)
      obstacles.forEach((_, i) => {
        const cube = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.5, 0.5),
          new THREE.MeshStandardMaterial({ color: 0xff4444 })
        );
        cube.position.set(i - 2, 0.25, 0);
        scene.add(cube);
      });

      // Ramps (green planes)
      ramps.forEach((_, i) => {
        const ramp = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.1, 1),
          new THREE.MeshStandardMaterial({ color: 0x10b981 })
        );
        ramp.position.set(i - 2, 0.05, -1);
        ramp.rotation.x = -Math.PI / 12;
        scene.add(ramp);
      });

      camera.position.set(3, 3, 5);
      camera.lookAt(0, 0, 0);

      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();

      setLoaded(true);
      return () => {
        threeRef.current!.removeChild(renderer.domElement);
        renderer.dispose();
      };
    }
  }, [mode, obstacles, ramps]);

  return (
    <div className="rounded-lg border overflow-hidden">
      {mode === "2D" ? (
        <div ref={mapRef} className="w-full h-[400px]" />
      ) : (
        <div ref={threeRef} className="w-full h-[400px] bg-neutral-900" />
      )}
      {!loaded && <p className="text-sm text-gray-500 p-2">Loading {mode} view…</p>}
    </div>
  );
}
