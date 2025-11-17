'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/client';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { createSession } from '@/lib/actions/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/admin');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Get ID token
      const idToken = await userCredential.user.getIdToken();

      // Create session cookie
      const result = await createSession(idToken);

      if (result.success) {
        router.push('/admin');
      } else {
        setError('Gagal membuat sesi. Silakan coba lagi.');
      }
    } catch (error: any) {
      setError('Email atau kata sandi salah.');
      console.error('Firebase login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
          </svg>
        </div>
        <h1>Admin Login</h1>
        <p>Silakan masuk untuk melanjutkan.</p>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            className="admin-input"
            placeholder="Email (e.g., admin@example.com)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            disabled={loading}
          />
          <input
            type="password"
            className="admin-input"
            placeholder="Kata Sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          {error && <p className="login-error">{error}</p>}
          <button
            type="submit"
            className="admin-btn btn-add login-btn"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
