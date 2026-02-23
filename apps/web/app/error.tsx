'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ color: 'crimson' }}>Something broke</h1>
      <p style={{ opacity: 0.8 }}>{error.message}</p>
      <button onClick={reset} style={{ marginTop: 16 }}>
        Retry
      </button>
    </main>
  );
}
