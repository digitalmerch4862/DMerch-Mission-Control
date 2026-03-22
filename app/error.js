'use client';

export default function Error({ error, reset }) {
  return (
    <main style={{ maxWidth: 760, margin: '8vh auto', padding: 24 }}>
      <section style={{ background: '#121a33', border: '1px solid #2b3a72', borderRadius: 16, padding: 24 }}>
        <h1 style={{ marginTop: 0 }}>Something went wrong</h1>
        <p>We hit an unexpected error. Please try again.</p>
        <button
          onClick={reset}
          style={{
            marginTop: 12,
            background: '#1c2a57',
            border: '1px solid #2b3a72',
            color: '#e6ecff',
            borderRadius: 8,
            padding: '8px 12px',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
        {process.env.NODE_ENV !== 'production' && error?.message ? (
          <pre style={{ marginTop: 12, opacity: 0.8, whiteSpace: 'pre-wrap' }}>{error.message}</pre>
        ) : null}
      </section>
    </main>
  );
}
