import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Habit } from '../types/habit'
import { fetchHabits } from '../api/habitsApi'

interface HabitsContextValue {
  habits: Habit[]
  loading: boolean
  error: boolean
  loadHabits: () => Promise<void>
  toggleDoneToday: (id: string) => void
  addHabit: (name: string, frequency: 'daily' | 'weekly') => void
}

const HabitsContext = createContext<HabitsContextValue | undefined>(undefined)

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const loadHabits = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await fetchHabits()
      setHabits(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleDoneToday = useCallback((id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, doneToday: !h.doneToday } : h))
    )
  }, [])

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
      value={{ habits, loading, error, loadHabits, toggleDoneToday, addHabit }}
    >
      {children}
    </HabitsContext.Provider>
  )
}

export function useHabits(): HabitsContextValue {
  const ctx = useContext(HabitsContext)
  if (!ctx) {
    throw new Error('useHabits must be used within a HabitsProvider')
  }
  return ctx
}
