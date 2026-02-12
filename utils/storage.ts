import { DailyRecord, createDefaultRecord } from '../types';

const STORAGE_KEY = 'rhythm_app_data_v2';

export const getRecordForDate = (date: string): DailyRecord => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return createDefaultRecord(date);
    
    const parsed = JSON.parse(data);
    const storedRecord = parsed[date];
    
    if (!storedRecord) return createDefaultRecord(date);

    const defaultRecord = createDefaultRecord(date);

    // Merge logic:
    // 1. Base on default record (contains all latest fields like meditation.noon)
    // 2. Overwrite with stored record (might miss new fields)
    // 3. Explicitly merge nested objects that might have new fields added (like meditation)
    
    const mergedRecord = {
      ...defaultRecord,
      ...storedRecord,
    };

    // Fix for nested object evolution (e.g., adding 'noon' to meditation)
    if (storedRecord.meditation) {
        mergedRecord.meditation = {
            ...defaultRecord.meditation,
            ...storedRecord.meditation
        };
    }

    return mergedRecord;
  } catch (e) {
    console.error("Failed to load data", e);
    return createDefaultRecord(date);
  }
};

export const saveRecord = (record: DailyRecord) => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : {};
    parsed[record.date] = record;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch (e) {
    console.error("Failed to save data", e);
  }
};

export const getAllHistory = (): DailyRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    // Convert object to array and sort by date descending
    return Object.values(parsed).map((record: any) => {
        // Apply the same merging logic for history items to ensure no fields are missing
        const defaultRec = createDefaultRecord(record.date);
        const merged = { ...defaultRec, ...record };
        if (record.meditation) {
            merged.meditation = { ...defaultRec.meditation, ...record.meditation };
        }
        return merged;
    }).sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ) as DailyRecord[];
  } catch (e) {
    return [];
  }
};