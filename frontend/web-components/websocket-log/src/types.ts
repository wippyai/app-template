export interface ComponentProps {
  topics?: string[]
  maxEntries?: number
}

export interface LogEntry {
  id: number
  timestamp: string
  topic: string
  data: unknown
}
