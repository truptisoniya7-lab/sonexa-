'use client';
import { motion } from 'framer-motion';
import { Search, Users, Zap } from 'lucide-react';

const features = [
  { icon: Search, title: "Discover Music", desc: "Find new tracks through community curation." },
  { icon: Users, title: "Connect Friends", desc: "See what your friends are listening to in real-time." },
  { icon: Zap, title: "Build Communities", desc: "Join rooms and queue music together seamlessly." }
];

export function AnimatedFeatures() {
  return (
    <div className="space-y-6 pt-12 relative z-10 max-w-xl">
      {features.map((item, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, x: -30, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.6 + (index * 0.15), type: "spring", stiffness: 100 }}
          whileHover={{ x: 10, scale: 1.02, backgroundColor: "rgba(255,255,255,0.03)" }}
          className="flex items-center gap-5 p-4 rounded-2xl group cursor-pointer border border-transparent hover:border-white/5 transition-all duration-300 relative overflow-hidden"
        >
          {/* Hover highlight background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-500 shadow-lg relative"
          >
            <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <item.icon className="w-7 h-7 text-primary/80 group-hover:text-purple-300 transition-colors duration-500 relative z-10" />
          </motion.div>
          <div className="relative z-10">
            <h3 className="font-bold text-lg text-white/90 group-hover:text-white transition-colors">{item.title}</h3>
            <p className="text-sm text-white/50 group-hover:text-white/70 transition-colors">{item.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
