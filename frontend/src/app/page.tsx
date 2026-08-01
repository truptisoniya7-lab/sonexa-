'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Mail, Check, EyeOff, Heart, SkipBack, Pause, SkipForward, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('truptisoniya7@gmail.com');
  const [password, setPassword] = useState('password123');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
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
        router.push('/home');
      } else {
        alert(data.error || 'Login failed');
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId="838052480666-3rh408qo3ehs2h9q8gi1v5gnf1g00u0f.apps.googleusercontent.com">
      <main className="relative min-h-screen w-full flex flex-col md:flex-row font-sans overflow-hidden bg-black text-white selection:bg-purple-500/30">
        
        {/* Background Image Setup */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/bg.jpg')" }}
        >
          {/* Fallback dark gradient if image not found, and overlay for better readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-purple-900/20 to-black/80" />
        </div>

        {/* Top Bar */}
        <header className="absolute top-0 w-full px-6 py-6 md:px-12 md:py-8 flex justify-between items-center z-20">
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-white font-bold text-xl italic drop-shadow-md">S</span>
            </div>
            <span className="text-2xl font-bold tracking-wide drop-shadow-md">Sonexa</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium text-white/90 drop-shadow-md">
            <span className="hidden md:inline">Music on. World off. You in.</span>
            <Heart className="w-5 h-5 cursor-pointer hover:text-pink-400 transition-colors" />
          </div>
        </header>

        {/* Left Content Area */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20 xl:px-32 pt-32 md:pt-0 pb-40 md:pb-32">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 drop-shadow-lg text-white">
            Welcome to
          </h1>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-6 drop-shadow-[0_0_25px_rgba(168,85,247,0.4)] tracking-tight py-2">
            Sonexa
          </h2>
          <p className="text-lg md:text-xl text-white/90 font-medium mb-6 drop-shadow-md max-w-sm">
            Where music connects hearts and moments.
          </p>
          
          {/* Soundwave Graphic SVG */}
          <div className="w-48 h-12 flex items-center justify-start mb-auto">
            <svg width="240" height="40" viewBox="0 0 240 40">
              <path d="M0,20 Q15,5 30,20 T60,20 T90,20 T120,20 T150,20 T180,20 T210,20" fill="none" stroke="url(#wave-grad)" strokeWidth="3" strokeLinecap="round" />
              <path d="M0,20 Q15,35 30,20 T60,20 T90,20 T120,20 T150,20 T180,20 T210,20" fill="none" stroke="url(#wave-grad)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
              <defs>
                <linearGradient id="wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="50%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#f472b6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Music Player Widget (Bottom Left) */}
        <div className="absolute bottom-10 left-6 md:left-12 lg:left-20 xl:left-32 z-20 flex items-center gap-4 bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-[300px] md:w-[340px]">
          <div className="w-14 h-14 rounded-lg bg-cover bg-center overflow-hidden relative shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-pink-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-black rounded-full" />
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <span className="text-sm font-bold text-white">Perfect</span>
            <span className="text-xs text-white/70">Ed Sheeran</span>
            {/* Tiny soundwave bars */}
            <div className="flex gap-[2px] mt-2 h-3 items-end">
               {[1, 2, 3, 4, 5, 4, 3, 5, 7, 4, 2, 3, 5, 8, 6, 4, 2, 3, 4, 2].map((i, idx) => (
                 <div key={idx} className="w-[2px] bg-purple-400 rounded-full" style={{ height: `${(i / 8) * 100}%` }} />
               ))}
            </div>
          </div>
          <div className="flex items-center gap-3 pr-2">
            <Heart className="w-4 h-4 text-white hover:text-pink-400 cursor-pointer transition-colors" />
            <SkipBack className="w-4 h-4 text-white cursor-pointer hover:text-purple-300 transition-colors fill-white" />
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
              <Pause className="w-4 h-4 text-white fill-white" />
            </div>
            <SkipForward className="w-4 h-4 text-white cursor-pointer hover:text-purple-300 transition-colors fill-white" />
          </div>
        </div>

        {/* Right Content Area (Login Form) */}
        <div className="relative z-10 w-full md:w-[480px] lg:w-[520px] flex items-center justify-center p-6 md:p-12 lg:pr-20 xl:pr-32 h-full min-h-screen">
          
          {/* Glass card container */}
          <div className="w-full relative">
            {/* Glowing border effect */}
            <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-white/30 via-white/5 to-transparent blur-[1px] pointer-events-none" />
            
            <div className="w-full bg-[#0a0a0a]/60 backdrop-blur-2xl rounded-3xl p-8 md:p-10 shadow-[0_0_50px_rgba(139,92,246,0.2)] border border-white/10 flex flex-col relative z-10">
              
              {/* Card Header */}
              <div className="flex flex-col items-center mb-8">
                {/* Logo in circle */}
                <div className="w-14 h-14 rounded-full bg-[#111] border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xl italic">S</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Sign In</h2>
                <p className="text-sm text-white/60">Let's get you back to the vibe.</p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                
                {/* Email Field */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white/90 ml-1">Email</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 w-5 h-5 text-white/40" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#1a1a1a]/80 border border-white/5 rounded-2xl py-3.5 pl-12 pr-12 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-white/30"
                      placeholder="name@example.com"
                    />
                    <Check className="absolute right-4 w-5 h-5 text-green-400" />
                  </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-medium text-white/90">Password</label>
                    <a href="#" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Forgot password?</a>
                  </div>
                  <div className="relative flex items-center">
                    {/* Placeholder dots since real password field masks output */}
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#1a1a1a]/80 border border-white/5 rounded-2xl py-3.5 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-white/30 tracking-widest font-mono"
                    />
                    <EyeOff className="absolute right-4 w-5 h-5 text-white/40 cursor-pointer hover:text-white/70 transition-colors" />
                  </div>
                </div>

                {/* Login Button */}
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="mt-2 w-full relative group overflow-hidden rounded-2xl p-[1px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-90 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 py-3.5 rounded-[15px] w-full text-sm font-semibold text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                    {isLoading ? 'Logging In...' : 'Log In'}
                    {!isLoading && <ArrowRight className="w-4 h-4 ml-1 opacity-70" />}
                  </div>
                </button>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-white/60 mt-2">
                  Don't have an account? <a href="#" className="text-purple-400 font-medium hover:text-purple-300 transition-colors">Sign Up</a>
                </p>

                {/* Divider */}
                <div className="flex items-center gap-4 my-2 opacity-50">
                  <div className="flex-1 h-[1px] bg-white/20" />
                  <span className="text-[10px] font-semibold tracking-wider text-white/60 uppercase">OR CONTINUE WITH</span>
                  <div className="flex-1 h-[1px] bg-white/20" />
                </div>

                {/* Google Button */}
                <button type="button" className="w-full bg-white hover:bg-white/90 transition-colors rounded-2xl py-3.5 flex items-center justify-center gap-3 text-black font-semibold text-sm">
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>

              </form>
            </div>
          </div>
        </div>

      </main>
    </GoogleOAuthProvider>
  );
}

