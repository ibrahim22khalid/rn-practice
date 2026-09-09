export type Habit = {
  id: string
  name: string
  streak: number
  doneToday: boolean
  frequency: 'daily' | 'weekly'
  lastSevenDays: boolean[]
}
