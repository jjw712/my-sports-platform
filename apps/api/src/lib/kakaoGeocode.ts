export type GeocodeResult = { lat: number; lng: number };

const KAKAO_ENDPOINT = 'https://dapi.kakao.com/v2/local/search/address.json';

export async function kakaoGeocode(address: string): Promise<GeocodeResult | null> {
  const key = process.env.KAKAO_REST_KEY?.trim();
  if (!key) {
    console.warn('KAKAO_REST_KEY is missing. Skipping geocode.');
    return null;
  }

  const query = address.trim();
  if (!query) return null;

  const url = `${KAKAO_ENDPOINT}?query=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `KakaoAK ${key}` },
    });

    if (!res.ok) {
      console.warn(`Kakao geocode failed: ${res.status}`);
      return null;
    }

    const data = (await res.json()) as {
      documents?: Array<{ x?: string; y?: string }>;
    };

    const first = data.documents?.[0];
    if (!first?.x || !first?.y) return null;

    const lng = Number(first.x);
    const lat = Number(first.y);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

    return { lat, lng };
  } catch (error) {
    console.warn('Kakao geocode error:', error);
    return null;
  }
}
