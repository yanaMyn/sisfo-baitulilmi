'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/client';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { createSession } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-500 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 p-4 rounded-full">
              <Lock className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Admin Login
          </h1>
          <p className="text-blue-100 text-center mb-8">
            Silakan masuk untuk melanjutkan.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email (e.g., admin@example.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                disabled={loading}
                className="bg-white/90 border-white/30 text-gray-900 placeholder:text-gray-500 focus:bg-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Kata Sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-white/90 border-white/30 text-gray-900 placeholder:text-gray-500 focus:bg-white"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-blue-700 hover:bg-blue-50 font-semibold h-12 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
