import React, { useState, useEffect, useRef } from 'react';
import { ViewState, DailyRecord, createDefaultRecord } from './types';
import DeepFocus from './components/DeepFocus';
import MeditationTimer from './components/MeditationTimer';
import { generateDailyBriefing } from './services/geminiService';
import { getRecordForDate, saveRecord, getAllHistory, getRawDataForExport, importRawData } from './utils/storage';
import { 
  BookOpen, Flame, Scale, Moon, Calendar, 
  Utensils, Coffee, Sun, Dumbbell, History, 
  ChevronRight, ChevronLeft, Edit3, Flower, Sunrise, Sunset, Play,
  Download, Upload, FileJson, AlertCircle
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [record, setRecord] = useState<DailyRecord>(createDefaultRecord(new Date().toISOString().split('T')[0]));
  const [history, setHistory] = useState<DailyRecord[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Track which meditation type is active
  const [meditationType, setMeditationType] = useState<'morning' | 'noon' | 'evening' | null>(null);

  // Helper to check if current view is today
  const isToday = currentDate === new Date().toISOString().split('T')[0];

  // Load data when date changes
  useEffect(() => {
    const data = getRecordForDate(currentDate);
    setRecord(data);
    setIsLoaded(true);
  }, [currentDate]);

  // Save data whenever record changes
  useEffect(() => {
    // Prevent saving default empty state over existing data on initial load
    if (isLoaded && record) {
      saveRecord(record);
    }
  }, [record, isLoaded]);

  // Load history when entering history view
  useEffect(() => {
    if (view === ViewState.HISTORY) {
      setHistory(getAllHistory());
    }
  }, [view]);

  // --- Handlers ---

  const toggleDiet = (key: 'standardBreakfast' | 'standardLunch' | 'noDinner') => {
    if (!isToday) return; // Prevent editing past/future via toggles easily, or allow it? Assuming allowed for now or strictly strictly today? 
    // The prompt asked for "duration editing" specifically for "today". 
    // I will keep existing toggles functional for any date to allow fixing records, 
    // but the NEW duration inputs will be restricted to isToday as requested.
    
    setRecord(prev => ({
      ...prev,
      diet: { ...prev.diet, [key]: !prev.diet[key] }
    }));
  };

  const toggleExercise = (key: 'jinGangGong' | 'strengthTraining') => {
    // See note above regarding date restriction. Keeping consistent with previous behavior for checkboxes.
    setRecord(prev => ({
      ...prev,
      exercise: { ...prev.exercise, [key]: !prev.exercise[key] }
    }));
  };

  const updateWeight = (val: string) => {
    setRecord(prev => ({ ...prev, weight: val ? parseFloat(val) : null }));
  };

  const updateJapaneseNotes = (val: string) => {
    setRecord(prev => ({ ...prev, japanese: { ...prev.japanese, notes: val } }));
  };

  // NEW: Update Meditation Minutes Manually
  const updateMeditation = (type: 'morning' | 'noon' | 'evening', val: string) => {
    if (!isToday) return;
    const num = val === '' ? 0 : parseInt(val);
    setRecord(prev => ({
        ...prev,
        meditation: {
            ...prev.meditation,
            [type]: isNaN(num) ? 0 : num
        }
    }));
  };

  // NEW: Update Japanese Minutes Manually
  const updateJapaneseMinutes = (val: string) => {
    if (!isToday) return;
    const num = val === '' ? 0 : parseInt(val);
    setRecord(prev => ({
        ...prev,
        japanese: { ...prev.japanese, minutes: isNaN(num) ? 0 : num }
    }));
  };

  const startMeditation = (type: 'morning' | 'noon' | 'evening') => {
    if (!isToday) return;
    setMeditationType(type);
    setView(ViewState.MEDITATION);
  };

  const handleMeditationExit = (seconds: number) => {
    setView(ViewState.HOME);
    if (seconds > 0 && meditationType) {
        const minutesToAdd = Math.ceil(seconds / 60);
        setRecord(prev => ({
            ...prev,
            meditation: {
                ...prev.meditation,
                [meditationType]: (prev.meditation[meditationType] || 0) + minutesToAdd
            }
        }));
    }
    setMeditationType(null);
  };

  const handleFocusExit = (seconds: number) => {
    setView(ViewState.HOME);
    if (seconds > 0) {
      // Calculate minutes, rounding up so even short tests count as 1 min
      const minutesToAdd = Math.ceil(seconds / 60);
      setRecord(prev => ({
        ...prev,
        japanese: { ...prev.japanese, minutes: prev.japanese.minutes + minutesToAdd }
      }));
    }
  };

  const generateAiReview = async () => {
    setLoadingAi(true);
    const text = await generateDailyBriefing(record);
    setRecord(prev => ({ ...prev, aiBriefing: text }));
    setLoadingAi(false);
  };

  const changeDate = (offset: number) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + offset);
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  // --- Backup/Restore Handlers ---
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = getRawDataForExport();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `rhythm_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importRawData(content);
        if (success) {
          alert('数据恢复成功！页面将刷新。');
          window.location.reload();
        } else {
          alert('数据文件格式错误，请使用正确的备份文件。');
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Components ---

  const ToggleButton = ({ active, onClick, icon, label, colorClass }: any) => (
    <button 
      type="button"
      onClick={onClick}
      className={`flex-1 p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2
        ${active 
          ? `bg-slate-800 ${colorClass.replace('text', 'border')} shadow-lg shadow-${colorClass.split('-')[1]}-900/20` 
          : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'}`}
    >
      <div className={active ? colorClass : 'text-slate-600'}>{icon}</div>
      <span className={`text-xs font-bold ${active ? 'text-slate-200' : 'text-slate-500'}`}>{label}</span>
      {active && <div className={`w-1.5 h-1.5 rounded-full ${colorClass.replace('text', 'bg')}`}></div>}
    </button>
  );

  // --- View: Deep Focus ---
  if (view === ViewState.FOCUS) {
    return <DeepFocus onExit={handleFocusExit} />;
  }

  // --- View: Meditation Timer ---
  if (view === ViewState.MEDITATION && meditationType) {
    return <MeditationTimer type={meditationType} onExit={handleMeditationExit} />;
  }

  // --- View: History ---
  if (view === ViewState.HISTORY) {
    const hasData = (day: DailyRecord) => {
      return day.diet.standardBreakfast || day.diet.standardLunch || day.diet.noDinner ||
             day.exercise.jinGangGong || day.exercise.strengthTraining || 
             day.japanese.minutes > 0 || day.weight !== null ||
             day.meditation.morning > 0 || day.meditation.evening > 0 || (day.meditation.noon && day.meditation.noon > 0);
    };

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 pb-20">
        <header className="flex items-center justify-between mb-8">
          <button onClick={() => setView(ViewState.HOME)} className="p-2 bg-slate-900 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors">
             <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-slate-200">历史档案</h2>
          <div className="w-10"></div>
        </header>

        <div className="space-y-4 mb-12">
          {history.length === 0 && <p className="text-center text-slate-500 mt-10">暂无记录</p>}
          {history.map(day => (
            <div key={day.date} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
              <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                <div className="text-sm font-bold text-slate-300 font-mono">{day.date}</div>
                <div className="text-lg font-mono font-bold text-slate-200">
                  {day.weight ? day.weight : <span className="text-slate-700 text-sm font-normal">--</span>} 
                  <span className="text-xs text-slate-500 ml-1">kg</span>
                </div>
              </div>
              
              <div className="flex gap-2 text-xs flex-wrap">
                 {/* Diet Tags */}
                 {day.diet.standardBreakfast && (
                   <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/50 px-2 py-1 rounded-md">
                     标准早餐
                   </span>
                 )}
                 {day.diet.standardLunch && (
                   <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/50 px-2 py-1 rounded-md">
                     标准午餐
                   </span>
                 )}
                 {day.diet.noDinner && (
                   <span className="bg-indigo-950 text-indigo-400 border border-indigo-900/50 px-2 py-1 rounded-md">
                     过午不食
                   </span>
                 )}
                 
                 {/* Exercise Tags */}
                 {day.exercise.jinGangGong && (
                   <span className="bg-amber-950 text-amber-400 border border-amber-900/50 px-2 py-1 rounded-md">
                     金刚功
                   </span>
                 )}
                 {day.exercise.strengthTraining && (
                   <span className="bg-rose-950 text-rose-400 border border-rose-900/50 px-2 py-1 rounded-md">
                     力量训练
                   </span>
                 )}

                 {/* Meditation Tags */}
                 {day.meditation?.morning > 0 && (
                    <span className="bg-violet-950 text-violet-400 border border-violet-900/50 px-2 py-1 rounded-md">
                      晨冥 {day.meditation.morning}m
                    </span>
                 )}
                 {day.meditation?.noon && day.meditation.noon > 0 && (
                    <span className="bg-amber-950 text-amber-400 border border-amber-900/50 px-2 py-1 rounded-md">
                      午冥 {day.meditation.noon}m
                    </span>
                 )}
                 {day.meditation?.evening > 0 && (
                    <span className="bg-indigo-950 text-indigo-400 border border-indigo-900/50 px-2 py-1 rounded-md">
                      晚冥 {day.meditation.evening}m
                    </span>
                 )}
                 
                 {/* Japanese Tag */}
                 {day.japanese.minutes > 0 && (
                   <span className="bg-sky-950 text-sky-400 border border-sky-900/50 px-2 py-1 rounded-md">
                     日语 {day.japanese.minutes}m
                   </span>
                 )}

                 {/* Empty State */}
                 {!hasData(day) && (
                   <span className="text-slate-600 italic">-- 暂无打卡 --</span>
                 )}
              </div>
              
              {day.japanese.notes && (
                 <div className="text-xs text-slate-500 bg-slate-950 p-2 rounded border border-slate-800/50 line-clamp-2">
                   {day.japanese.notes}
                 </div>
              )}
            </div>
          ))}
        </div>

        {/* Data Backup & Restore Section */}
        <div className="mt-8 border-t border-slate-800 pt-8">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                <FileJson size={16} /> 数据备份与恢复
            </h3>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <div className="flex gap-4">
                    <button 
                        onClick={handleExport}
                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                    >
                        <Download size={16} />
                        导出备份
                    </button>
                    <button 
                        onClick={handleImportClick}
                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                    >
                        <Upload size={16} />
                        导入数据
                    </button>
                </div>
                <div className="mt-3 flex items-start gap-2 text-xs text-slate-500">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <p>数据仅保存在浏览器缓存中。为防止丢失，建议定期导出备份。导入备份将覆盖当前所有数据。</p>
                </div>
                {/* Hidden File Input */}
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                />
            </div>
        </div>
      </div>
    );
  }

  // --- View: Home (Today) ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      
      {/* Date Header */}
      <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center">
        <button onClick={() => changeDate(-1)} className="p-2 text-slate-400 hover:text-white transition-colors"><ChevronLeft size={20} /></button>
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-500 uppercase tracking-widest">Daily Log</span>
          <span className="text-lg font-bold font-mono text-white">{currentDate}</span>
        </div>
        <button 
          onClick={() => changeDate(1)} 
          disabled={currentDate === new Date().toISOString().split('T')[0]}
          className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </header>

      <div className="p-5 space-y-6 max-w-md mx-auto">
        
        {/* 1. Diet Section */}
        <section>
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
            <Utensils size={14} /> 饮食纪律
          </h3>
          <div className="flex gap-3">
            <ToggleButton 
              active={record.diet.standardBreakfast} 
              onClick={() => toggleDiet('standardBreakfast')} 
              icon={<Coffee size={20} />} 
              label="标准早餐" 
              colorClass="text-emerald-400" 
            />
            <ToggleButton 
              active={record.diet.standardLunch} 
              onClick={() => toggleDiet('standardLunch')} 
              icon={<Sun size={20} />} 
              label="标准午餐" 
              colorClass="text-emerald-400" 
            />
            <ToggleButton 
              active={record.diet.noDinner} 
              onClick={() => toggleDiet('noDinner')} 
              icon={<Moon size={20} />} 
              label="过午不食" 
              colorClass="text-indigo-400" 
            />
          </div>
        </section>

        {/* 2. Body Section */}
        <section>
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
            <Flame size={14} /> 身体修炼
          </h3>
          <div className="flex gap-3 mb-3">
             <ToggleButton 
              active={record.exercise.jinGangGong} 
              onClick={() => toggleExercise('jinGangGong')} 
              icon={<span className="font-serif font-bold text-xl">金</span>} 
              label="金刚功" 
              colorClass="text-amber-400" 
            />
             <ToggleButton 
              active={record.exercise.strengthTraining} 
              onClick={() => toggleExercise('strengthTraining')} 
              icon={<Dumbbell size={20} />} 
              label="力量训练" 
              colorClass="text-rose-400" 
            />
          </div>
          {/* Weight Input */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
             <div className="flex items-center gap-3 text-slate-400">
               <Scale size={18} />
               <span className="text-sm font-medium">今日体重</span>
             </div>
             <div className="flex items-center gap-2">
               <input 
                 type="number" 
                 value={record.weight || ''}
                 onChange={(e) => updateWeight(e.target.value)}
                 placeholder="0.0"
                 className="bg-transparent text-right text-xl font-mono font-bold text-white w-20 focus:outline-none placeholder-slate-700"
               />
               <span className="text-xs text-slate-500 font-bold">KG</span>
             </div>
          </div>
        </section>

        {/* 3. Meditation Section (Timer + Manual Input) */}
        <section>
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
            <Flower size={14} /> 冥想静心
          </h3>
          <div className="grid grid-cols-3 gap-3">
             {/* Morning Meditation Card */}
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-col items-center justify-between gap-1 relative overflow-hidden group hover:border-violet-500/50 transition-all">
                <div className="absolute top-1 right-1 text-violet-500/10 pointer-events-none"><Sunrise size={32} /></div>
                
                <button 
                  onClick={() => isToday && startMeditation('morning')}
                  disabled={!isToday}
                  className="flex flex-col items-center z-10 w-full pt-1"
                >
                   <Sunrise size={18} className="text-violet-400 mb-1" />
                   <span className="text-xs font-bold text-violet-200">晨间</span>
                </button>

                <div className="flex items-center gap-1 z-10 mb-1 w-full justify-center">
                   <input
                       type="number"
                       value={record.meditation.morning || ''}
                       onChange={(e) => updateMeditation('morning', e.target.value)}
                       placeholder={record.meditation.morning === 0 ? "0" : ""}
                       disabled={!isToday}
                       className={`bg-transparent text-center text-lg font-mono font-bold text-white w-12 focus:outline-none p-0 ${isToday ? 'border-b border-slate-700 focus:border-violet-500' : ''} placeholder-slate-600`}
                       onClick={(e) => e.stopPropagation()}
                   />
                   <span className="text-[10px] text-slate-500">m</span>
                </div>
                
                {isToday && record.meditation.morning === 0 && (
                   <button 
                      onClick={() => startMeditation('morning')}
                      className="absolute bottom-2 right-2 p-1 text-slate-600 hover:text-violet-400 transition-colors"
                   >
                      <Play size={10} fill="currentColor" />
                   </button>
                )}
             </div>

             {/* Noon Meditation Card */}
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-col items-center justify-between gap-1 relative overflow-hidden group hover:border-amber-500/50 transition-all">
                <div className="absolute top-1 right-1 text-amber-500/10 pointer-events-none"><Sun size={32} /></div>
                
                <button 
                  onClick={() => isToday && startMeditation('noon')}
                  disabled={!isToday}
                  className="flex flex-col items-center z-10 w-full pt-1"
                >
                   <Sun size={18} className="text-amber-400 mb-1" />
                   <span className="text-xs font-bold text-amber-200">午间</span>
                </button>

                <div className="flex items-center gap-1 z-10 mb-1 w-full justify-center">
                   <input
                       type="number"
                       value={record.meditation.noon || ''}
                       onChange={(e) => updateMeditation('noon', e.target.value)}
                       placeholder={record.meditation.noon === 0 ? "0" : ""}
                       disabled={!isToday}
                       className={`bg-transparent text-center text-lg font-mono font-bold text-white w-12 focus:outline-none p-0 ${isToday ? 'border-b border-slate-700 focus:border-amber-500' : ''} placeholder-slate-600`}
                       onClick={(e) => e.stopPropagation()}
                   />
                   <span className="text-[10px] text-slate-500">m</span>
                </div>

                {isToday && record.meditation.noon === 0 && (
                   <button 
                      onClick={() => startMeditation('noon')}
                      className="absolute bottom-2 right-2 p-1 text-slate-600 hover:text-amber-400 transition-colors"
                   >
                      <Play size={10} fill="currentColor" />
                   </button>
                )}
             </div>

             {/* Evening Meditation Card */}
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-col items-center justify-between gap-1 relative overflow-hidden group hover:border-indigo-500/50 transition-all">
                <div className="absolute top-1 right-1 text-indigo-500/10 pointer-events-none"><Sunset size={32} /></div>
                
                <button 
                  onClick={() => isToday && startMeditation('evening')}
                  disabled={!isToday}
                  className="flex flex-col items-center z-10 w-full pt-1"
                >
                   <Sunset size={18} className="text-indigo-400 mb-1" />
                   <span className="text-xs font-bold text-indigo-200">晚间</span>
                </button>

                <div className="flex items-center gap-1 z-10 mb-1 w-full justify-center">
                   <input
                       type="number"
                       value={record.meditation.evening || ''}
                       onChange={(e) => updateMeditation('evening', e.target.value)}
                       placeholder={record.meditation.evening === 0 ? "0" : ""}
                       disabled={!isToday}
                       className={`bg-transparent text-center text-lg font-mono font-bold text-white w-12 focus:outline-none p-0 ${isToday ? 'border-b border-slate-700 focus:border-indigo-500' : ''} placeholder-slate-600`}
                       onClick={(e) => e.stopPropagation()}
                   />
                   <span className="text-[10px] text-slate-500">m</span>
                </div>

                {isToday && record.meditation.evening === 0 && (
                   <button 
                      onClick={() => startMeditation('evening')}
                      className="absolute bottom-2 right-2 p-1 text-slate-600 hover:text-indigo-400 transition-colors"
                   >
                      <Play size={10} fill="currentColor" />
                   </button>
                )}
             </div>
          </div>
        </section>

        {/* 4. Mind Section (Japanese) */}
        <section>
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
            <BookOpen size={14} /> 日语修行
          </h3>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-slate-800">
               <div>
                 <div className="flex items-baseline gap-1">
                     <input 
                       type="number"
                       value={record.japanese.minutes || ''}
                       onChange={(e) => updateJapaneseMinutes(e.target.value)}
                       disabled={!isToday}
                       placeholder="0"
                       className={`text-2xl font-mono font-bold text-white bg-transparent w-20 focus:outline-none placeholder-slate-700 p-0 ${isToday ? 'focus:border-b border-sky-500/50' : ''}`}
                     />
                     <span className="text-xs text-slate-500 font-sans">MINS</span>
                 </div>
                 <div className="text-xs text-slate-500 mt-1">今日专注时长</div>
               </div>
               <button 
                 onClick={() => setView(ViewState.FOCUS)}
                 className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
               >
                 <Flame size={14} /> 开始专注
               </button>
            </div>
            <div className="p-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <Edit3 size={12} />
                <span>学习内容记录</span>
              </div>
              <textarea 
                value={record.japanese.notes}
                onChange={(e) => updateJapaneseNotes(e.target.value)}
                placeholder="记录今日学习单词、语法或感悟..."
                className="w-full bg-slate-950/50 text-slate-300 text-sm p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500/50 resize-none h-24 placeholder-slate-700"
              />
            </div>
          </div>
        </section>

        {/* AI Briefing */}
        <section className="pt-4">
           {!record.aiBriefing ? (
             <button 
               onClick={generateAiReview}
               disabled={loadingAi}
               className="w-full py-4 border border-dashed border-slate-700 rounded-xl text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-all flex items-center justify-center gap-2"
             >
               {loadingAi ? <Moon className="animate-pulse" /> : <Moon />}
               <span className="text-sm font-medium">{loadingAi ? "正在生成复盘..." : "生成今日 AI 复盘"}</span>
             </button>
           ) : (
             <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-5 rounded-xl">
               <div className="flex justify-between items-start mb-2">
                 <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-wider">AI Coach Briefing</h4>
                 <button onClick={generateAiReview} className="text-slate-600 hover:text-white"><History size={14}/></button>
               </div>
               <p className="text-sm text-slate-300 leading-relaxed italic opacity-90">
                 {record.aiBriefing}
               </p>
             </div>
           )}
        </section>

      </div>

      {/* Floating History Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button 
          onClick={() => setView(ViewState.HISTORY)}
          className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 shadow-xl transition-all"
        >
          <Calendar size={24} />
        </button>
      </div>

    </div>
  );
};

export default App;