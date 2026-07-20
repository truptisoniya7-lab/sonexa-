'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Music2, Search, Users, Disc3, Headphones, Zap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/login`, {
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/home');
      } else {
        alert(data.error || 'Google login failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <GoogleOAuthProvider clientId="838052480666-3rh408qo3ehs2h9q8gi1v5gnf1g00u0f.apps.googleusercontent.com">
      <main className="min-h-screen w-full flex flex-col md:flex-row bg-background overflow-hidden">
        
        {/* Left Side: Branding & Animation */}
        <div className="relative flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 md:py-0 overflow-hidden bg-gradient-to-br from-purple-900/50 via-background to-black border-r border-white/5">
          {/* Background Effects */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {/* Glowing Orbs */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} 
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen"
            />
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }} 
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px] mix-blend-screen"
            />

            {/* Floating Music Notes */}
            <motion.div 
              animate={{ y: [-20, 20, -20], rotate: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[20%] right-[20%] opacity-20"
            >
              <Music2 className="w-24 h-24 text-purple-400" />
            </motion.div>
            <motion.div 
              animate={{ y: [20, -20, 20], rotate: [-10, 0, -10] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[30%] left-[10%] opacity-10"
            >
              <Headphones className="w-32 h-32 text-blue-400" />
            </motion.div>
            
            {/* Vinyl Outline */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -right-[150px] -bottom-[150px] opacity-10"
            >
              <Disc3 className="w-[400px] h-[400px] text-white" />
            </motion.div>
          </div>

          {/* Content */}
          <div className="relative z-10 space-y-8 max-w-xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 pb-2">
                Welcome to Sonexa
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mt-4 font-light">
                Sync your music, connect your world. The ultimate social listening experience.
              </p>
            </motion.div>

            <div className="space-y-6 pt-8">
              {[
                { icon: Search, title: "Discover Music", desc: "Find new tracks through community curation." },
                { icon: Users, title: "Connect Friends", desc: "See what your friends are listening to in real-time." },
                { icon: Zap, title: "Build Communities", desc: "Join rooms and queue music together seamlessly." }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <item.icon className="w-6 h-6 text-primary group-hover:text-purple-400 transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-[450px] lg:w-[500px] flex items-center justify-center p-8 md:p-12 relative z-10 bg-background/50 backdrop-blur-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full"
          >
            <Card className="glass-panel border-white/10 bg-black/40 shadow-2xl overflow-hidden relative">
              {/* Subtle top highlight for the card */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
              
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold tracking-tight text-center">Sign In</CardTitle>
                <CardDescription className="text-center text-muted-foreground">
                  Enter your credentials to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-2 pb-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                    </div>
                    <Input 
                      id="password" 
                      type="password"
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 focus-visible:ring-primary"
                    />
                  </div>
                  <Button type="submit" className="w-full font-bold shadow-lg bg-primary hover:bg-primary/90 text-white rounded-full h-11 transition-all hover:scale-[1.02]" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Log In / Sign Up"}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-black/40 px-2 text-muted-foreground rounded-full">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="flex justify-center w-full [&>div]:w-full [&>div>div]:w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => console.log('Login Failed')}
                    theme="filled_black"
                    shape="pill"
                    text="continue_with"
                    size="large"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </GoogleOAuthProvider>
  );
}
