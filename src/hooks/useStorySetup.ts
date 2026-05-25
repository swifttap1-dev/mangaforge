import { useState, useCallback } from 'react'
import type { StorySetup, StoryLength } from '../types'

const DEFAULT_SETUP: StorySetup = {
  title: '',
  genre: 'Shonen',
  premise: '',
  length: 'midrun',
  protagonist: '',
  tone: 'Action-heavy',
}

export function useStorySetup() {
  const [setup, setSetup] = useState<StorySetup>(DEFAULT_SETUP)

  const updateSetup = useCallback(<K extends keyof StorySetup>(
    key: K,
    value: StorySetup[K]
  ) => {
    setSetup(prev => ({ ...prev, [key]: value }))
  }, [])

  const setLength = useCallback((length: StoryLength) => {
    setSetup(prev => ({ ...prev, length }))
  }, [])

  // Premise must be at least 10 chars before continuing
  const isReady = setup.premise.trim().length >= 10

  return { setup, updateSetup, setLength, isReady }
}