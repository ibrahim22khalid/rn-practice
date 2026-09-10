// items_context.tsx
// The single source of truth for the analytics "items" list. Wraps the
// app in <ItemsProvider> and exposes `useItems()` so the analytics
// dashboard, details and form screens share one in-memory list + addItem
// action without prop drilling. Data itself (type, seed, fetch/create)
// lives in items_api.ts.
import { createContext, useContext, useState, ReactNode } from "react";
import { PurePathItem, SEED_ITEMS, createItem } from "../api/itemsApi";

export type { PurePathItem };

interface ItemsContextValue {
  items: PurePathItem[];
  addItem: (item: Omit<PurePathItem, "id">) => void;
}

// The context itself is private; only the provider and hook are exported.
// prop drilling is avoided by wrapping the app in <ItemsProvider> and calling useItems() anywhere.

const ItemsContext = createContext<ItemsContextValue | undefined>(undefined);

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PurePathItem[]>(SEED_ITEMS);

  // Marks a new item with a unique id (via items_api) and prepends it to the list.
  const addItem = (item: Omit<PurePathItem, "id">) => {
    createItem(item).then((newItem) => {
      setItems((prev) => [newItem, ...prev]);
    });
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