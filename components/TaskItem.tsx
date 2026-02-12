import React, { useState } from 'react';
import { Task, TaskType } from '../types';
import { Check, BatteryCharging, Zap } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onComplete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete }) => {
  const [slideValue, setSlideValue] = useState(0);
  const [isCompleted, setIsCompleted] = useState(task.completed);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isCompleted) return;
    const val = parseInt(e.target.value);
    setSlideValue(val);

    // Threshold to complete
    if (val >= 95) {
      setIsCompleted(true);
      setSlideValue(100);
      if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback
      setTimeout(() => onComplete(task.id), 300); // Delay for animation
    }
  };

  const handleTouchEnd = () => {
    if (slideValue < 95 && !isCompleted) {
      setSlideValue(0); // Snap back if not completed
    }
  };

  const isDrain = task.type === TaskType.DRAIN;

  return (
    <div className={`relative w-full h-16 rounded-xl overflow-hidden mb-3 transition-all duration-300 ${isCompleted ? 'opacity-50 scale-95' : 'opacity-100'}`}>
      {/* Background Layer */}
      <div className="absolute inset-0 bg-slate-800 border border-slate-700 rounded-xl"></div>

      {/* Progress Fill Layer */}
      <div 
        className={`absolute top-0 bottom-0 left-0 transition-all duration-75 ease-linear rounded-xl ${isDrain ? 'bg-gradient-to-r from-slate-700 to-cyan-900' : 'bg-gradient-to-r from-slate-700 to-emerald-900'}`}
        style={{ width: `${slideValue}%`, opacity: 0.6 }}
      ></div>

      {/* Content Layer */}
      <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isDrain ? 'bg-slate-900 text-cyan-400' : 'bg-slate-900 text-emerald-400'}`}>
            {isDrain ? <Zap size={18} /> : <BatteryCharging size={18} />}
          </div>
          <div>
            <h3 className={`font-medium ${isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`}>{task.title}</h3>
            <p className="text-xs text-slate-400">{task.category} • {isDrain ? '-' : '+'}{task.energyValue} 能量</p>
          </div>
        </div>
        <div className="opacity-40">
           {isCompleted ? <Check className="text-emerald-400" /> : <span className="text-xs font-mono tracking-widest text-slate-500">滑动完成 &gt;&gt;</span>}
        </div>
      </div>

      {/* Slider Interaction Layer */}
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={slideValue} 
        onChange={handleSliderChange}
        onTouchEnd={handleTouchEnd}
        onMouseUp={handleTouchEnd}
        disabled={isCompleted}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
      />
    </div>
  );
};

export default TaskItem;