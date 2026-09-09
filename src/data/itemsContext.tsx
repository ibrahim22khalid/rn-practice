// ItemsContext: the single source of truth for the analytics "items" list.
// It seeds a hardcoded list and exposes `useItems()` so the analytics
// dashboard, details and form screens share one in-memory list + addItem
// action without prop drilling.
import { createContext, useContext, useState, ReactNode } from "react";

export interface PurePathItem {
  id: string;
  name: string;
  category: string;
  daysOnPath: number;
  streakActive: boolean;
}

const SEED_ITEMS: PurePathItem[] = [
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

interface ItemsContextValue {
  items: PurePathItem[];
  addItem: (item: Omit<PurePathItem, "id">) => void;
}

// The context itself is private; only the provider and hook are exported.
// prop drilling is avoided by wrapping the app in <ItemsProvider> and calling useItems() anywhere.

const ItemsContext = createContext<ItemsContextValue | undefined>(undefined);

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PurePathItem[]>(SEED_ITEMS);

  // Marks a new item with a unique id and prepends it to the list.
  const addItem = (item: Omit<PurePathItem, "id">) => {
    const newItem: PurePathItem = { ...item, id: Date.now().toString() };
    setItems((prev) => [newItem, ...prev]);
  };

  return (
    <ItemsContext.Provider value={{ items, addItem }}>
      {children}
    </ItemsContext.Provider>
  );
}

// Hook used by any component inside ItemsProvider to reach the context.
export function useItems(): ItemsContextValue {
  const ctx = useContext(ItemsContext);
  if (!ctx) {
    throw new Error("useItems must be used within an ItemsProvider");
  }
  return ctx;
}
