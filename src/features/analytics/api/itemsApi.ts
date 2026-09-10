// items_api.ts
// Data layer for the analytics "items" list: the shared type, the seed
// data, and simple functions that stand in for real API calls. The
// context layer (items_context.tsx) is the only consumer of this file.

export interface PurePathItem {
  id: string;
  name: string;
  category: string;
  daysOnPath: number;
  streakActive: boolean;
}

export const SEED_ITEMS: PurePathItem[] = [
  { id: "1", name: "Morning Prayer Routine", category: "Spiritual", daysOnPath: 15, streakActive: true },
  { id: "2", name: "Gratitude Journaling", category: "Mindfulness", daysOnPath: 12, streakActive: true },
  { id: "3", name: "Daily Walking", category: "Physical", daysOnPath: 21, streakActive: true },
  { id: "4", name: "Reading Quran", category: "Spiritual", daysOnPath: 30, streakActive: true },
  { id: "5", name: "Healthy Eating", category: "Physical", daysOnPath: 8, streakActive: false },
  { id: "6", name: "Digital Detox Hour", category: "Mental", daysOnPath: 5, streakActive: true },
  { id: "7", name: "Community Service", category: "Social", daysOnPath: 14, streakActive: true },
  { id: "8", name: "Evening Reflection", category: "Mindfulness", daysOnPath: 10, streakActive: true },
  { id: "9", name: "Hydration Goal", category: "Physical", daysOnPath: 25, streakActive: true },
  { id: "10", name: "Sleep Schedule", category: "Mental", daysOnPath: 7, streakActive: false },
  { id: "11", name: "Charity Donation", category: "Social", daysOnPath: 3, streakActive: true },
  { id: "12", name: "Dhikr After Prayer", category: "Spiritual", daysOnPath: 18, streakActive: true },
  { id: "13", name: "Nature Walk", category: "Physical", daysOnPath: 6, streakActive: true },
  { id: "14", name: "Mindful Breathing", category: "Mindfulness", daysOnPath: 9, streakActive: true },
  { id: "15", name: "Call a Friend", category: "Social", daysOnPath: 4, streakActive: false },
  { id: "16", name: "Fasting on Monday", category: "Spiritual", daysOnPath: 2, streakActive: true },
  { id: "17", name: "Stretching Routine", category: "Physical", daysOnPath: 11, streakActive: true },
  { id: "18", name: "No Social Media", category: "Mental", daysOnPath: 16, streakActive: true },
  { id: "19", name: "Volunteer Work", category: "Social", daysOnPath: 1, streakActive: true },
  { id: "20", name: "Evening Dhikr", category: "Spiritual", daysOnPath: 20, streakActive: true },
  { id: "21", name: "Meal Prepping", category: "Physical", daysOnPath: 13, streakActive: true },
  { id: "22", name: "Journaling Wins", category: "Mindfulness", daysOnPath: 8, streakActive: false },
  { id: "23", name: "Family Time", category: "Social", daysOnPath: 22, streakActive: true },
  { id: "24", name: "Tahajjud Prayer", category: "Spiritual", daysOnPath: 3, streakActive: true },
  { id: "25", name: "Cold Shower Challenge", category: "Physical", daysOnPath: 5, streakActive: true },
];

// Simulates a GET request that fetches the current items list.
export function fetchItems(): Promise<PurePathItem[]> {
  return Promise.resolve(SEED_ITEMS);
}

// Simulates a POST request that creates a new item, assigning it an id.
export function createItem(item: Omit<PurePathItem, "id">): Promise<PurePathItem> {
  const newItem: PurePathItem = { ...item, id: Date.now().toString() };
  return Promise.resolve(newItem);
}