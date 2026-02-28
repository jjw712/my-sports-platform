"use client";

import { useEffect, useRef } from "react";

export type KakaoMapMarker = {
  id: string | number;
  lat: number;
  lng: number;
  title?: string;
};

export type KakaoMapProps = {
  center: { lat: number; lng: number };
  markers: KakaoMapMarker[];
  level?: number;
  height?: number;
};

declare global {
  interface Window {
    kakao: any;
  }
}

const SCRIPT_ID = "kakao-maps-sdk";

function loadKakaoSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.kakao?.maps) return Promise.resolve();

  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Kakao SDK load failed")));
    });
  }

  const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!key) return Promise.reject(new Error("NEXT_PUBLIC_KAKAO_JS_KEY is missing"));

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;
  script.async = true;

  return new Promise((resolve, reject) => {
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Kakao SDK load failed"));
    document.head.appendChild(script);
  });
}

export default function KakaoMap({ center, markers, level = 5, height = 480 }: KakaoMapProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: any;
    let markerObjs: any[] = [];

    loadKakaoSdk()
      .then(() => {
        window.kakao.maps.load(() => {
          if (!ref.current) return;

          map = new window.kakao.maps.Map(ref.current, {
            center: new window.kakao.maps.LatLng(center.lat, center.lng),
            level,
          });

          markerObjs = markers.map((m) => {
            const marker = new window.kakao.maps.Marker({
              position: new window.kakao.maps.LatLng(m.lat, m.lng),
            });
            marker.setMap(map);

            if (m.title) {
              const content = document.createElement("div");
              content.style.padding = "6px 8px";
              content.style.fontSize = "12px";
              content.textContent = m.title;

              const infowindow = new window.kakao.maps.InfoWindow({ content });
              window.kakao.maps.event.addListener(marker, "click", () => {
                infowindow.open(map, marker);
              });
            }

            return marker;
          });
        });
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      markerObjs.forEach((marker) => marker.setMap(null));
      markerObjs = [];
      map = null;
    };
  }, [center.lat, center.lng, level, markers]);

  return <div ref={ref} style={{ width: "100%", height }} />;
}
