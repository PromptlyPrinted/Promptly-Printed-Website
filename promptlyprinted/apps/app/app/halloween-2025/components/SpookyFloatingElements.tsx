'use client';

import { Ghost, Skull, Moon, Sparkles, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export const SpookyFloatingElements = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Animated Ghosts */}
      <div className="absolute top-20 left-10 animate-float-slow opacity-20">
        <Ghost className="w-16 h-16 text-purple-300" />
      </div>
      <div className="absolute top-40 right-20 animate-float-slower opacity-15" style={{ animationDelay: '2s' }}>
        <Ghost className="w-20 h-20 text-orange-300" />
      </div>
      <div className="absolute bottom-40 left-1/4 animate-float opacity-10" style={{ animationDelay: '4s' }}>
        <Ghost className="w-12 h-12 text-purple-400" />
      </div>

      {/* Floating Skulls */}
      <div className="absolute top-60 right-1/4 animate-spin-slow opacity-20">
        <Skull className="w-14 h-14 text-gray-400" />
      </div>
      <div className="absolute bottom-60 right-10 animate-spin-slower opacity-15" style={{ animationDelay: '3s' }}>
        <Skull className="w-16 h-16 text-gray-500" />
      </div>

      {/* Haunted Moons */}
      <div className="absolute top-10 right-10 animate-pulse-slow opacity-30">
        <Moon className="w-24 h-24 text-yellow-200" />
      </div>

      {/* Sparkles */}
      <div className="absolute top-1/3 left-1/3 animate-twinkle opacity-40">
        <Sparkles className="w-8 h-8 text-purple-300" />
      </div>
      <div className="absolute top-2/3 right-1/3 animate-twinkle opacity-30" style={{ animationDelay: '1.5s' }}>
        <Sparkles className="w-6 h-6 text-orange-300" />
      </div>

      {/* Lightning Bolts */}
      <div className="absolute top-1/4 right-1/3 animate-flash opacity-50">
        <Zap className="w-10 h-10 text-yellow-400" />
      </div>

      {/* Spooky Fog Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-purple-900/20 to-transparent animate-fog" />

      {/* Parallax Ghost that follows cursor */}
      <div
        className="absolute opacity-5 transition-all duration-1000 ease-out"
        style={{
          left: `${mousePosition.x / 20}px`,
          top: `${mousePosition.y / 20}px`,
        }}
      >
        <Ghost className="w-32 h-32 text-purple-500" />
      </div>

      {/* Floating Bats */}
      <div className="absolute top-32 left-1/2 animate-bat-fly opacity-30">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-gray-800">
          <path d="M12 2C11.5 2 11 2.19 10.59 2.59L2.59 10.59C1.8 11.37 1.8 12.63 2.59 13.41L10.59 21.41C11.37 22.2 12.63 22.2 13.41 21.41L21.41 13.41C22.2 12.63 22.2 11.37 21.41 10.59L13.41 2.59C13 2.19 12.5 2 12 2M7 7H17V9H7V7M7 11H17V13H7V11M7 15H17V17H7V15Z"/>
        </svg>
      </div>
      <div className="absolute top-48 right-1/3 animate-bat-fly opacity-25" style={{ animationDelay: '2s' }}>
        <svg width="35" height="35" viewBox="0 0 24 24" fill="currentColor" className="text-gray-900">
          <path d="M12 2C11.5 2 11 2.19 10.59 2.59L2.59 10.59C1.8 11.37 1.8 12.63 2.59 13.41L10.59 21.41C11.37 22.2 12.63 22.2 13.41 21.41L21.41 13.41C22.2 12.63 22.2 11.37 21.41 10.59L13.41 2.59C13 2.19 12.5 2 12 2M7 7H17V9H7V7M7 11H17V13H7V11M7 15H17V17H7V15Z"/>
        </svg>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-30px) translateX(10px); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-40px) translateX(-15px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-slower {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        @keyframes flash {
          0%, 50%, 100% { opacity: 0; }
          25% { opacity: 1; }
        }
        @keyframes fog {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        @keyframes bat-fly {
          0% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(100px) translateY(-30px); }
          50% { transform: translateX(200px) translateY(0); }
          75% { transform: translateX(100px) translateY(30px); }
          100% { transform: translateX(0) translateY(0); }
        }

        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: float-slower 10s ease-in-out infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-spin-slower {
          animation: spin-slower 30s linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        .animate-flash {
          animation: flash 5s ease-in-out infinite;
        }
        .animate-fog {
          animation: fog 8s ease-in-out infinite;
        }
        .animate-bat-fly {
          animation: bat-fly 15s linear infinite;
        }
      `}</style>
    </div>
  );
};
