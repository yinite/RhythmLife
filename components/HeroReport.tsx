import React, { useState, useEffect } from 'react';
import { generateHeroReport } from '../services/geminiService';
import { Task } from '../types';
import { Scroll, Sparkles, Loader2, ArrowLeft } from 'lucide-react';

interface HeroReportProps {
  tasks: Task[];
  streak: number;
  onBack: () => void;
}

const HeroReport: React.FC<HeroReportProps> = ({ tasks, streak, onBack }) => {
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchReport = async () => {
      // Filter only completed tasks for the report
      const completed = tasks.filter(t => t.completed);
      if (completed.length === 0) {
        if (mounted) {
          setReport("今日英雄正在休整，暂无事迹记录。");
          setLoading(false);
        }
        return;
      }

      const text = await generateHeroReport(completed, streak);
      if (mounted) {
        setReport(text);
        setLoading(false);
      }
    };
    fetchReport();
    return () => { mounted = false; };
  }, [tasks, streak]);

  return (
    <div className="flex flex-col h-full p-6 animate-fade-in">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white">
          <ArrowLeft />
        </button>
        <h2 className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
          英雄史诗
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="relative p-6 bg-slate-800 rounded-lg border border-amber-900/30 shadow-[0_0_30px_rgba(251,191,36,0.1)]">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <Scroll className="text-amber-500" size={48} />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-amber-500/50">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p className="text-sm font-mono">正在以此刻书写传奇...</p>
            </div>
          ) : (
            <div className="prose prose-invert prose-p:text-amber-100/90 leading-relaxed font-serif">
              <p className="text-lg italic whitespace-pre-wrap">{report}</p>
            </div>
          )}
          
          <div className="mt-8 pt-4 border-t border-slate-700 flex justify-between items-center text-xs text-slate-500 font-mono">
            <span>连胜天数: {streak}</span>
            <span className="flex items-center gap-1 text-amber-500"><Sparkles size={12}/> AI 生成</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroReport;