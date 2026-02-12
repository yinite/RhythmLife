import { GoogleGenAI } from "@google/genai";
import { DailyRecord, Task } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateDailyBriefing = async (record: DailyRecord): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI 助手准备中...";

  const prompt = `
    Role: A wise mentor combining Traditional Chinese Medicine (TCM) wisdom, discipline, and modern fitness.
    
    User's Data for Today (${record.date}):
    [Diet]
    - Standard Breakfast: ${record.diet.standardBreakfast ? "Yes" : "No"}
    - Standard Lunch: ${record.diet.standardLunch ? "Yes" : "No"}
    - No Dinner (Intermittent Fasting): ${record.diet.noDinner ? "Success" : "Skipped"}
    
    [Body Cultivation]
    - Jin Gang Gong (TCM Exercise): ${record.exercise.jinGangGong ? "Practiced" : "Not yet"}
    - Strength Training: ${record.exercise.strengthTraining ? "Done" : "Rest"}
    - Weight: ${record.weight ? record.weight + "kg" : "Not recorded"}

    [Inner Peace & Meditation]
    - Morning Meditation: ${record.meditation.morning} mins
    - Noon Meditation: ${record.meditation.noon} mins
    - Evening Meditation: ${record.meditation.evening} mins
    
    [Mind & Skill]
    - Japanese Study: ${record.japanese.minutes} mins.
    - Notes: ${record.japanese.notes || "No specific notes"}

    Task: Provide a short, insightful daily review (max 100 words).
    Requirements:
    1. If "Jin Gang Gong" and "No Dinner" are met, praise the user's "Internal Energy (Qi)" cultivation.
    2. If Meditation is practiced (Morning, Noon, or Evening), acknowledge the cultivation of "Shen" (Spirit).
    3. If Japanese notes are present, briefly acknowledge the topic.
    4. Tone: Stoic, Encouraging, Zen.
    5. Language: Chinese (Simplified).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "道阻且长，行则将至。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "心静自然凉，数据已记录。";
  }
};

export const generateHeroReport = async (tasks: Task[], streak: number): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI 助手准备中...";

  const completedTitles = tasks.map(t => t.title).join(", ");
  const prompt = `
    Role: A legendary chronicler of heroes.
    
    The user has completed these tasks: ${completedTitles}.
    Current Streak: ${streak} days.
    
    Task: Write a very short (max 50 words), epic commendation for the user's achievements today. 
    Use metaphors of battle, leveling up, or cultivation.
    Language: Chinese (Simplified).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "今日胜绩已载入史册。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "英雄无言，行胜于言。";
  }
};