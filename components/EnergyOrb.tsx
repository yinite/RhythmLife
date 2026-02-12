import React, { useEffect, useState } from 'react';

interface EnergyOrbProps {
  level: number;
}

const EnergyOrb: React.FC<EnergyOrbProps> = ({ level }) => {
  // Color calculation based on energy level
  const getColor = (l: number) => {
    if (l > 70) return 'text-cyan-400'; // High energy
    if (l > 30) return 'text-amber-400'; // Medium
    return 'text-rose-500'; // Low energy warning
  };

  const colorClass = getColor(level);
  
  // Simple animation for the "liquid" inside
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-48 h-48 mx-auto my-6 flex items-center justify-center">
      {/* Outer Glow Ring */}
      <div className={`absolute inset-0 rounded-full border-2 border-opacity-20 ${colorClass.replace('text', 'border')} animate-pulse`}></div>
      
      {/* Core Orb Container */}
      <div className="w-40 h-40 rounded-full bg-slate-800 relative overflow-hidden shadow-inner border border-slate-700">
        
        {/* Liquid Wave Animation */}
        <div 
            className={`absolute bottom-0 left-0 right-0 transition-all duration-700 ease-in-out opacity-80 ${level > 70 ? 'bg-cyan-500' : level > 30 ? 'bg-amber-500' : 'bg-rose-600'}`}
            style={{ height: `${level}%` }}
        >
             <div className="absolute top-0 w-[200%] h-4 bg-white opacity-20 transform -translate-y-1/2 animate-[wave_3s_linear_infinite]" 
                  style={{ left: `-${offset}%` }}></div>
        </div>

        {/* Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 mix-blend-screen">
          <span className="text-4xl font-bold text-white tracking-tighter">{level}%</span>
          <span className="text-xs uppercase tracking-widest text-slate-300 mt-1">当前能量</span>
        </div>
      </div>
    </div>
  );
};

export default EnergyOrb;