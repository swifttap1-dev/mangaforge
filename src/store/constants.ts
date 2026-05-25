import type { StoryLengthConfig } from '../types'

export const STORY_LENGTHS: StoryLengthConfig[] = [
  {
    id: 'sprint',
    label: 'Sprint',
    examples: 'Chainsaw Man, JJK, Dungeon Meshi',
    chapterRange: '30–80',
    arcs: 2,
    description: 'No filler. Every chapter moves the plot. Tight 2-act structure with a shocking ending.',
  },
  {
    id: 'midrun',
    label: 'Mid-run',
    examples: 'Attack on Titan, Demon Slayer',
    chapterRange: '80–200',
    arcs: 4,
    description: 'One major twist per arc. Mix of action and breather arcs. Midpoint paradigm shift.',
  },
  {
    id: 'longhaul',
    label: 'Long-haul',
    examples: 'One Piece, My Hero Academia',
    chapterRange: '200–600',
    arcs: 7,
    description: 'Modular arcs with mini-climaxes. Progressive power system. Threads a larger mystery.',
  },
  {
    id: 'epic',
    label: 'Epic',
    examples: 'Naruto, Bleach, Dragon Ball',
    chapterRange: '600–1000+',
    arcs: 10,
    description: 'World-builder first. Lore bible before plot. Power system must scale across hundreds of chapters.',
  },
]

export const GENRES = [
  'Shonen', 'Shojo', 'Seinen', 'Josei',
  'Isekai', 'Fantasy', 'Sci-Fi', 'Horror',
  'Slice of Life', 'Sports', 'Romance', 'Thriller',
]

export const TONES = [
  'Dark & gritty', 'Hopeful & epic', 'Comedic', 'Philosophical',
  'Action-heavy', 'Character-driven', 'Mystery-driven', 'Emotional',
]