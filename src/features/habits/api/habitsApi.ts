import { Habit } from '../types/habit'

export const HABITS: Habit[] = [
  {
    id: '1',
    name: 'Pray Fajr on time',
    streak: 12,
    doneToday: true,
    frequency: 'daily',
    lastSevenDays: [true, true, true, false, true, true, true],
  },
  {
    id: '2',
    name: 'Read 10 pages',
    streak: 3,
    doneToday: false,
    frequency: 'daily',
    lastSevenDays: [true, false, true, true, false, false, true],
  },
  {
    id: '3',
    name: 'Call my mother',
    streak: 5,
    doneToday: false,
    frequency: 'weekly',
    lastSevenDays: [false, true, false, false, true, false, false],
  },
  {
    id: '4',
    name: 'Walk 30 minutes',
    streak: 0,
    doneToday: false,
    frequency: 'daily',
    lastSevenDays: [false, false, false, false, false, false, false],
  },
]

let SHOULD_FAIL = false

export function setShouldFail(value: boolean) {
  SHOULD_FAIL = value
}

export function fetchHabits(): Promise<Habit[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (SHOULD_FAIL) {
        reject(new Error('Failed to fetch habits'))
      } else {
        resolve([...HABITS])
      }
    }, 1500)
  })
}
