'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';

import { LoadingScreen } from '@/components/login/LoadingScreen';
import { BackgroundGradient } from '@/components/login/BackgroundGradient';
import { AnimatedCursor } from '@/components/login/AnimatedCursor';
import { GlassLoginCard } from '@/components/login/GlassLoginCard';
import { AnimatedFeatures } from '@/components/login/AnimatedFeatures';
import { LoginScene } from '@/components/login/LoginScene';
import { FloatingMusicBackground } from '@/components/login/FloatingMusicBackground';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function LoginPage() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Prevent scroll during loading
  useEffect(() => {
    if (!loadingComplete) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [loadingComplete]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Transition out effects can go here
    try {
      const res = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Simple zoom out animation before push
        setTimeout(() => {
          router.push('/home');
        }, 1000);
      } else {
        alert(data.error || 'Login failed');
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => {
          router.push('/home');
        }, 1000);
      } else {
        alert(data.error || 'Signup failed');
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => {
          router.push('/home');
        }, 1000);
      } else {
        alert(data.error || 'Google login failed');
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId="838052480666-3rh408qo3ehs2h9q8gi1v5gnf1g00u0f.apps.googleusercontent.com">
      <AnimatePresence>
        {!loadingComplete && (
          <LoadingScreen onComplete={() => setLoadingComplete(true)} />
        )}
      </AnimatePresence>

      <main className="min-h-screen w-full flex flex-col md:flex-row bg-[#050505] overflow-hidden relative selection:bg-primary/30">
        <AnimatedCursor />
        
        {/* Render fallback background gradient immediately */}
        <BackgroundGradient />

        {/* Dynamic Scene based on device */}
        {loadingComplete && (isMobile ? <FloatingMusicBackground /> : <LoginScene />)}

        {/* Left Side: Immersive Text & Features */}
        <motion.div 
          className="relative flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 md:py-0 overflow-hidden z-10 pointer-events-none hidden md:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: loadingComplete ? 1 : 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="relative z-10 space-y-6 max-w-xl pointer-events-auto">
            <motion.div className="overflow-hidden">
              <motion.h1 
                initial={{ y: 100, opacity: 0, filter: "blur(20px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 1, delay: 0.8, type: "spring", stiffness: 50 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white pb-2"
              >
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-blue-400">Sonexa</span>
              </motion.h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="text-xl md:text-2xl text-white/60 font-light"
            >
              Sync your music, connect your world. The ultimate social listening experience.
            </motion.p>

            <AnimatedFeatures />
          </div>
        </motion.div>

        {/* Right Side: Login Form */}
        <motion.div
          className="relative z-20 flex items-center justify-center w-full md:w-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: loadingComplete ? 1 : 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
           <GlassLoginCard 
             email={email}
             setEmail={setEmail}
             password={password}
             setPassword={setPassword}
             name={name}
             setName={setName}
             isSignUp={isSignUp}
             setIsSignUp={setIsSignUp}
             isLoading={isLoading}
             handleLogin={handleLogin}
             handleSignup={handleSignup}
             handleGoogleSuccess={handleGoogleSuccess}
           />
        </motion.div>
      </main>
    </GoogleOAuthProvider>
  );
}
