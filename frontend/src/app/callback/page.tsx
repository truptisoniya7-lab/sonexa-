'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Connecting to Spotify...');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && state) {
      fetch(`\${process.env.NEXT_PUBLIC_API_URL || '${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}'}/spotify/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus('Successfully connected! Redirecting...');
          setTimeout(() => {
            router.push('/profile');
          }, 1500);
        } else {
          setStatus('Failed to connect to Spotify. Please try again.');
          setTimeout(() => {
            router.push('/profile');
          }, 3000);
        }
      })
      .catch(err => {
        console.error('Callback error', err);
        setStatus('An error occurred during authentication.');
        setTimeout(() => {
          router.push('/profile');
        }, 3000);
      });
    } else {
      setStatus('Invalid callback parameters.');
      setTimeout(() => {
        router.push('/profile');
      }, 3000);
    }
  }, [searchParams, router]);

  return (
    <div className="container fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="glass-panel" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>{status}</h2>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="container fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Loading...</h2>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
