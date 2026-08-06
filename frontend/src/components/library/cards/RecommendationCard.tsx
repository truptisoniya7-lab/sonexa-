import React from 'react';
import { Play } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: any;
  onClick?: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, onClick }) => {
  return (
    <div onClick={onClick} className="group overflow-hidden rounded-3xl p-6 border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-500 cursor-pointer flex flex-col gap-5 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]">
      
      <div className="flex items-center gap-6 relative z-10">
        <div className="relative w-24 h-24 rounded-xl shadow-lg overflow-hidden shrink-0">
          <img src={recommendation.image} alt={recommendation.title} className="w-full h-full object-cover group-hover:scale-110 group-hover:blur-[2px] transition-all duration-500" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-white/60 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2">
            Because you listened to <span className="text-primary">{recommendation.reason}</span>
          </p>
          <h3 className="text-[24px] font-extrabold text-white truncate mb-1">{recommendation.title}</h3>
          <p className="text-[14px] text-white/50 font-medium">Recommended for you</p>
        </div>
      </div>

      {/* Recommended Sub-items (Songs/Albums) */}
      {recommendation.subItems && (
        <div className="flex gap-4 pt-5 border-t border-white/[0.08] overflow-x-auto hide-scrollbar">
          {recommendation.subItems.map((sub: any, i: number) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0 group/sub cursor-pointer">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-sm group-hover/sub:shadow-md transition-shadow">
                <img src={sub.image} alt={sub.title} className="w-full h-full object-cover group-hover/sub:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/sub:opacity-100 flex items-center justify-center transition-opacity">
                   <Play className="w-4 h-4 text-white fill-white" />
                </div>
              </div>
              <span className="text-[11px] text-white/50 font-medium truncate w-16 text-center group-hover/sub:text-white transition-colors">{sub.title}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Soft Glow Effect Background */}
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
    </div>
  );
};
