export type StoryLength = 'sprint' | 'midrun' | 'longhaul' | 'epic'

export interface StoryLengthConfig {
  id: StoryLength
  label: string
  examples: string
  chapterRange: string
  arcs: number
  description: string
}

export interface StorySetup {
  title: string
  genre: string
  premise: string
  length: StoryLength
  protagonist: string
  tone: string
}

export interface PanelBreakdownItem {
  type: string
  description: string
}

export interface DialogueLine {
  speaker: string
  line: string
}

export interface SceneOption {
  id: string
  title: string
  emotion: string
  pacing: string
  panels?: string
  dialogue?: string
  cameraAngles?: string
  pageCount?: string
  panelBreakdown?: PanelBreakdownItem[]
  dialogueLines?: DialogueLine[]
  mangaTechnique?: string
  arcConnection?: string
  pageRange?: string        // e.g. "1–8"
  purpose?: string          // "slow immersion into MC's world"
  pages?: { page: number | string; anchor?: string; density?: string; beats?: string[]; note?: string }[]
  closingNote?: string      // the editorial tone summary line
}

export interface Arc {
  number: number
  name: string
  chapterRange: string
  summary: string
  keyMoments: string[]
  endingHook: string
}

export type StoryArc = Arc

export interface StoryOutline {
  title: string
  logline: string
  totalChapters: string
  arcs: Arc[]
  powerSystem?: string
  worldNotes?: string
}