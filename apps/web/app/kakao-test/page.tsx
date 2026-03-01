"use client";

import { useEffect, useMemo, useState } from "react";
import KakaoMap from "@/components/KakaoMap";
import { apiGet } from "@/lib/api";
import { VenueSchema, type Venue } from "@/lib/schemas";
import { z } from "zod";

const VenuesSchema = z.array(VenueSchema);
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 };

export default function Page() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    apiGet("/api/venues?sport=SOCCER", VenuesSchema)
      .then((data) => {
        if (!mounted) return;
        setVenues(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message ?? "failed to load venues");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const markers = useMemo(
    () =>
      venues
        .filter((v) => typeof v.lat === "number" && typeof v.lng === "number")
        .map((v) => ({
          id: v.id,
          lat: v.lat as number,
          lng: v.lng as number,
          title: v.name,
        })),
    [venues],
  );

  const center = markers.length > 0 ? { lat: markers[0].lat, lng: markers[0].lng } : DEFAULT_CENTER;

  return (
    <div className="space-y-3">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Kakao Map</h1>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <KakaoMap center={center} markers={markers} />
    </div>
  );
}
