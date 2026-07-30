'use client';
import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GoogleLogin } from '@react-oauth/google';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function GlassLoginCard({
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  isSignUp,
  setIsSignUp,
  isLoading,
  handleLogin,
  handleSignup,
  handleGoogleSuccess
}: any) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  function handleMouse(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className="w-full md:w-[450px] lg:w-[500px] flex items-center justify-center p-8 md:p-12 relative z-10 perspective-1000">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, type: "spring", stiffness: 100 }}
        className="w-full preserve-3d"
        onMouseMove={handleMouse}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
        }}
      >
        <Card className="relative overflow-hidden bg-black/40 backdrop-blur-2xl border-white/10 shadow-2xl shadow-purple-900/20 group">
          {/* Noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
          
          {/* Animated border gradient sweep */}
          <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-br from-purple-500/50 via-transparent to-blue-500/50 opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude', WebkitMaskComposite: 'xor' }} />

          <div className="absolute top-0 left-[-100%] w-[200%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-45deg] group-hover:animate-shimmer pointer-events-none" />

          <CardHeader className="space-y-1 pb-6 relative z-10">
            <CardTitle className="text-2xl font-bold tracking-tight text-center text-white">
              {isSignUp ? 'Create an Account' : 'Sign In'}
            </CardTitle>
            <CardDescription className="text-center text-white/60">
              {isSignUp ? 'Enter your details to get started' : 'Enter your credentials to continue'}
            </CardDescription>
          </CardHeader>

          <CardContent className="relative z-10">
            <form onSubmit={isSignUp ? handleSignup : handleLogin} className="space-y-5">
              {isSignUp && (
                <div className="space-y-2 group/input relative">
                  <Label htmlFor="name" className="text-white/80 group-focus-within/input:text-primary transition-colors">Name</Label>
                  <div className="relative">
                    <Input 
                      id="name" 
                      type="text" 
                      placeholder="Display Name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 text-white focus-visible:ring-primary focus-visible:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                    />
                    <div className="absolute inset-0 rounded-md ring-1 ring-primary/0 group-focus-within/input:ring-primary/50 transition-all duration-500 pointer-events-none blur-sm" />
                  </div>
                </div>
              )}
              <div className="space-y-2 group/input relative">
                <Label htmlFor="email" className="text-white/80 group-focus-within/input:text-primary transition-colors">Email</Label>
                <div className="relative">
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white focus-visible:ring-primary focus-visible:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                  />
                  <div className="absolute inset-0 rounded-md ring-1 ring-primary/0 group-focus-within/input:ring-primary/50 transition-all duration-500 pointer-events-none blur-sm" />
                </div>
              </div>
              <div className="space-y-2 pb-2 group/input relative">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white/80 group-focus-within/input:text-primary transition-colors">Password</Label>
                  {!isSignUp && <a href="#" className="text-xs text-primary hover:text-purple-300 transition-colors">Forgot password?</a>}
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white focus-visible:ring-primary focus-visible:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                  />
                  <div className="absolute inset-0 rounded-md ring-1 ring-primary/0 group-focus-within/input:ring-primary/50 transition-all duration-500 pointer-events-none blur-sm" />
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" className="w-full font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white rounded-full h-12 transition-all relative overflow-hidden group/btn" disabled={isLoading}>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] group-hover/btn:animate-shimmer" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                        Entering Universe...
                      </>
                    ) : isSignUp ? "Sign Up" : "Log In"}
                  </span>
                </Button>
              </motion.div>
              
              <div className="text-center mt-4">
                <p className="text-sm text-white/60">
                  {isSignUp ? "Already have an account? " : "Don't have an account? "}
                  <button 
                    type="button" 
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-primary hover:text-purple-300 hover:underline transition-all"
                  >
                    {isSignUp ? "Log In" : "Sign Up"}
                  </button>
                </p>
              </div>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0B0B0F] px-2 text-white/40 rounded-full border border-white/10">
                  Or continue with
                </span>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex justify-center w-full [&>div]:w-full [&>div>div]:w-full relative group/google">
              <div className="absolute inset-0 rounded-full bg-white/5 blur-md group-hover/google:bg-white/10 transition-colors duration-500 pointer-events-none" />
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log('Login Failed')}
                theme="filled_black"
                shape="pill"
                text="continue_with"
                size="large"
              />
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
