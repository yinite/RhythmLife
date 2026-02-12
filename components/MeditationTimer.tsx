import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Sunrise, Sunset, Wind, Sun } from 'lucide-react';

interface MeditationTimerProps {
  type: 'morning' | 'noon' | 'evening';
  onExit: (secondsCompleted: number) => void;
}

const MeditationTimer: React.FC<MeditationTimerProps> = ({ type, onExit }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [breathState, setBreathState] = useState<'in' | 'hold' | 'out'>('in');

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

  // Breathing Guide Logic (4-4-4 Rhythm roughly simulated for visuals)
  useEffect(() => {
    if (!isActive) return;
    
    const breathCycle = () => {
        setBreathState('in');
        setTimeout(() => {
            setBreathState('hold');
            setTimeout(() => {
                setBreathState('out');
                setTimeout(() => {
                   // Loop handled by interval in reality, but for simple CSS anim state:
                }, 4000); // Exhale
            }, 2000); // Hold
        }, 4000); // Inhale
    };

    breathCycle();
    const interval = setInterval(breathCycle, 10000); // 10s cycle
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    setIsActive(false);
    onExit(seconds);
  };

  // Theme configuration
  const getTheme = () => {
    switch(type) {
        case 'morning':
            return {
                text: 'text-violet-200',
                bg: 'bg-violet-950',
                circle: 'bg-violet-500',
                gradient: 'from-violet-900/50 to-slate-950',
                title: '晨间觉察',
                icon: <Sunrise size={48} />
            };
        case 'noon':
            return {
                text: 'text-amber-200',
                bg: 'bg-amber-950',
                circle: 'bg-amber-500',
                gradient: 'from-amber-900/50 to-slate-950',
                title: '午间静心',
                icon: <Sun size={48} />
            };
        case 'evening':
            return {
                text: 'text-indigo-200',
                bg: 'bg-slate-950',
                circle: 'bg-indigo-600',
                gradient: 'from-indigo-950 to-black',
                title: '晚间静心',
                icon: <Sunset size={48} />
            };
    }
  };

  const theme = getTheme();

  return (
    <div className={`fixed inset-0 ${theme.bg} z-50 flex flex-col items-center justify-center overflow-hidden transition-colors duration-1000`}>
      
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} opacity-80`}></div>

      {/* Breathing Circle Animation */}
      <div className="relative z-0 flex items-center justify-center mb-12">
         {/* Outer Glow */}
         <div className={`absolute w-64 h-64 rounded-full blur-3xl opacity-20 ${theme.circle} transition-all duration-[4000ms] ${isActive && breathState === 'in' ? 'scale-150 opacity-40' : 'scale-100'}`}></div>
         
         {/* Main Breathing Circle */}
         <div className={`w-48 h-48 rounded-full border-2 border-white/10 backdrop-blur-sm flex items-center justify-center transition-all duration-[4000ms] ease-in-out ${isActive && breathState === 'in' ? 'scale-125 bg-white/5' : 'scale-100 bg-transparent'}`}>
            <div className={`w-32 h-32 rounded-full ${theme.circle} opacity-20 blur-md transition-all duration-[4000ms] ${isActive && breathState === 'in' ? 'scale-110' : 'scale-90'}`}></div>
         </div>

         {/* Icon Center */}
         <div className="absolute text-white/50">
            {theme.icon}
         </div>
      </div>

      {/* Timer & Controls */}
      <div className="z-10 text-center flex flex-col items-center">
        <h2 className={`${theme.text} text-sm tracking-[0.3em] uppercase mb-6 opacity-70 flex items-center gap-2`}>
            <Wind size={16} className={isActive ? 'animate-pulse' : ''} />
            {theme.title}
        </h2>
        
        <div className="text-6xl font-light text-white font-mono mb-16 tracking-wider drop-shadow-lg">
          {formatTime(seconds)}
        </div>

        {/* Controls */}
        <div className="flex gap-10 justify-center">
          <button 
            onClick={() => setIsActive(!isActive)}
            className={`w-20 h-20 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all`}
          >
            {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>
          
          <button 
            onClick={handleStop}
            className="w-20 h-20 rounded-full bg-slate-800/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-300 hover:bg-rose-900/40 hover:text-rose-400 transition-all"
          >
            <Square size={24} fill="currentColor" />
          </button>
        </div>
        
        <div className="mt-8 text-xs tracking-widest text-slate-500 uppercase">
           {isActive ? (
               <span className="animate-pulse duration-[3000ms]">
                   {breathState === 'in' ? '吸 气' : breathState === 'hold' ? '屏 息' : '呼 气'}
               </span>
           ) : '准备开始'}
        </div>
      </div>
    </div>
  );
};

export default MeditationTimer;