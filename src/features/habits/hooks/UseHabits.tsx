// HabitsContext: the single source of truth for the habits list within the
// Habits tab. It owns the habit array, the loading/error flags, and the
// actions that mutate it (loadHabits, toggleDoneToday, addHabit). Exposing
// `useHabits()` lets the list, detail and add screens all read/update the
// same state without prop drilling.
import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react'
import { Habit } from '../types/habit'
import { fetchHabits } from '../api/habitsApi'

interface HabitsContextValue {
  habits: Habit[]
  loading: boolean
  error: boolean
  loadHabits: () => Promise<void>
  refetch: () => Promise<void>
  toggleDoneToday: (id: string) => void
  addHabit: (name: string, frequency: 'daily' | 'weekly') => void
  toggleDayDone: (id: string, dayIndex: number) => void
}

const HabitsContext = createContext<HabitsContextValue | undefined>(undefined)

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  // Guards that the API is fetched only once. Without it, loadHabits would
  // refetch on every list mount and clobber local toggles/additions.
  const hasLoadedRef = useRef(false)

  // Core fetch routine shared by loadHabits (guarded) and refetch (forced).
  const doFetch = async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await fetchHabits()
      hasLoadedRef.current = true
      setHabits(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  // Fetch habits from the API. No-ops if we've already loaded so that
  // client-side changes (toggling doneToday, adding a habit) survive
  // navigating away and back within the tab.
  const loadHabits = useCallback(async () => {
    if (hasLoadedRef.current) return
    await doFetch()
    //dependencies are empty because we want this function to be stable and not re-created on every render. The state setters (setLoading, setError, setHabits) are stable and don't need to be in the dependency array.
  }, [])

  // Always refetches from the API, bypassing the hasLoadedRef guard. Used by
  // the retry buttons shown on the error and empty states.
  const refetch = useCallback(async () => {
    await doFetch()
  }, [])

  // Flips doneToday for one habit by id. The "done today" count on the list
  // screen is derived from habits.filter(doneToday), so it updates for free.
  const toggleDoneToday = useCallback((id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, doneToday: !h.doneToday } : h))
    )
  }, [])

  // Toggling a day box also updates the streak counter:
  // - turning a box ON  -> streak + 1
  // - turning a box OFF -> streak - 1
  // The streak is always clamped so it never drops below 0, and never
  // drops below the number of currently-active (done) day boxes —
  // since the underlying data is static/local, this keeps the two
  // numbers consistent with each other on every toggle.
  const toggleDayDone = useCallback((id: string, dayIndex: number) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h

        const updatedDays = [...h.lastSevenDays]
        const wasDone = updatedDays[dayIndex]
        updatedDays[dayIndex] = !wasDone

        const activeDaysCount = updatedDays.filter(Boolean).length
        const rawStreak = wasDone ? h.streak - 1 : h.streak + 1
        const updatedStreak = Math.max(rawStreak, activeDaysCount, 0)

        return { ...h, lastSevenDays: updatedDays, streak: updatedStreak }
      })
    )
  }, [])

  // Prepends a new habit (fresh id, zeroed stats, nothing done today).
  const addHabit = useCallback((name: string, frequency: 'daily' | 'weekly') => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: name.trim(),
      streak: 0,
      doneToday: false,
      frequency,
      lastSevenDays: [false, false, false, false, false, false, false],
    }
    setHabits((prev) => [...prev, newHabit])
  }, [])

  return (
    <HabitsContext.Provider
      value={{
        habits,
        loading,
        error,
        loadHabits,
        refetch,
        toggleDoneToday,
        addHabit,
        toggleDayDone,
      }}
    >
      {children}
    </HabitsContext.Provider>
  )
}

// Hook used by any component inside HabitsProvider to reach the context.
export function useHabits(): HabitsContextValue {
  const ctx = useContext(HabitsContext)
  if (!ctx) {
    throw new Error('useHabits must be used within a HabitsProvider')
  }
  return ctx
}