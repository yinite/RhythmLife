import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Waves } from 'lucide-react';

interface DeepFocusProps {
  onExit: (secondsCompleted: number) => void;
}

const DeepFocus: React.FC<DeepFocusProps> = ({ onExit }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [fish, setFish] = useState<{id: number, top: number, speed: number}[]>([]);

  // Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  // Fish spawning logic based on time
  useEffect(() => {
    if (isActive && seconds % 10 === 0 && seconds > 0) {
      setFish(prev => [
        ...prev, 
        { id: Date.now(), top: Math.random() * 80 + 10, speed: Math.random() * 5 + 5 }
      ]);
    }
  }, [seconds, isActive]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    setIsActive(false);
    onExit(seconds);
  };

  return (
    <div className="fixed inset-0 bg-indigo-950 z-50 flex flex-col items-center justify-center overflow-hidden transition-colors duration-1000">
      {/* Background Gradient/Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-indigo-950 to-black opacity-80"></div>
      
      {/* Particles/Bubbles (Simulated with simple divs) */}
      <div className="absolute inset-0 pointer-events-none">
         {[...Array(20)].map((_, i) => (
           <div key={i} className="absolute rounded-full bg-blue-400 opacity-20 animate-pulse" 
                style={{
                  width: Math.random() * 10 + 2 + 'px',
                  height: Math.random() * 10 + 2 + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  animationDuration: Math.random() * 3 + 2 + 's'
                }}></div>
         ))}
      </div>

      {/* Fish Animation */}
      {fish.map(f => (
        <div 
          key={f.id} 
          className="absolute text-blue-300 opacity-30 transition-transform duration-[10000ms] ease-linear"
          style={{ 
            top: `${f.top}%`, 
            right: '-50px', 
            animation: `swim ${f.speed}s linear infinite` 
          }}
        >
          <Waves size={24} />
        </div>
      ))}
      <style>{`
        @keyframes swim {
          from { transform: translateX(110vw); }
          to { transform: translateX(-20vw); }
        }
      `}</style>

      {/* Timer Display */}
      <div className="z-10 text-center">
        <h2 className="text-blue-200 text-sm tracking-[0.3em] uppercase mb-4 opacity-70">静默深海</h2>
        <div className="text-7xl font-light text-white font-mono mb-12 tracking-wider drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          {formatTime(seconds)}
        </div>

        {/* Controls */}
        <div className="flex gap-8 justify-center">
          <button 
            onClick={() => setIsActive(!isActive)}
            className="w-20 h-20 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400/30 flex items-center justify-center text-white hover:bg-blue-500/40 transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)]"
          >
            {isActive ? <Pause size={32} /> : <Play size={32} className="ml-2" />}
          </button>
          
          <button 
            onClick={handleStop}
            className="w-20 h-20 rounded-full bg-rose-500/20 backdrop-blur-md border border-rose-400/30 flex items-center justify-center text-rose-300 hover:bg-rose-500/40 transition-all"
          >
            <Square size={24} fill="currentColor" />
          </button>
        </div>
        <div className="mt-6 flex justify-center gap-14 text-xs tracking-widest text-slate-400 uppercase">
           <span>{isActive ? '专注中' : '暂停'}</span>
           <span>结束并保存</span>
        </div>
      </div>
      
      <p className="absolute bottom-10 text-blue-400/40 text-xs text-center px-8">
        专注越久，深海生态越丰富。
      </p>
    </div>
  );
};

export default DeepFocus;