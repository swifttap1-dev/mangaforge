import { useState, useEffect, useRef } from 'react'
import type { StorySetup, StoryOutline } from './types'
import type { ChapterBeat } from './pages/ArcBuilderPage'
import { SetupPage } from './pages/SetupPage'
import { SceneIdeatorPage } from './pages/SceneIdeatorPage'
import { ArcBuilderPage } from './pages/ArcBuilderPage'
import { TropesPage } from './pages/TropesPage'
import { CodexPage } from './pages/CodexPage'
import './styles/main.css'

type Page = 'scene' | 'arcs' | 'tropes' | 'codex'

const NAV_ITEMS: { id: Page; icon: string; label: string }[] = [
  { id: 'scene',  icon: '◈', label: 'Scene Ideator'   },
  { id: 'arcs',   icon: '◎', label: 'Arc Builder'     },
  { id: 'tropes', icon: '◉', label: 'Tropes & Beats'  },
  { id: 'codex',  icon: '⊞', label: 'Character Codex' },
]

export default function App() {
  const [page, setPage]             = useState<Page>('arcs')
  const [storySetup, setStorySetup] = useState<StorySetup | null>(null)
  const [outline, setOutline]       = useState<StoryOutline | null>(null)
  const [arcChapters, setArcChapters] = useState<Record<number, ChapterBeat[]>>({})
  const [activeArcIndex, setActiveArcIndex] = useState<number | null>(null)
  const [activeChapterIndex, setActiveChapterIndex] = useState<number | null>(null)

  const storageKey = 'mangaforge:workspace'
  const saveTimer = useRef<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Load saved workspace on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.storySetup) setStorySetup(parsed.storySetup)
        if (parsed.outline) setOutline(parsed.outline)
        if (parsed.arcChapters) setArcChapters(parsed.arcChapters)
        if (typeof parsed.activeArcIndex === 'number') setActiveArcIndex(parsed.activeArcIndex)
        if (typeof parsed.activeChapterIndex === 'number') setActiveChapterIndex(parsed.activeChapterIndex)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  // Autosave with debounce
  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      try {
        const payload = { storySetup, outline, arcChapters, activeArcIndex, activeChapterIndex }
        localStorage.setItem(storageKey, JSON.stringify(payload))
      } catch (e) {
        // ignore
      }
      saveTimer.current = null
    }, 500) as unknown as number
    return () => { if (saveTimer.current) window.clearTimeout(saveTimer.current) }
  }, [storySetup, outline, arcChapters, activeArcIndex, activeChapterIndex])

  function saveNow() {
    try {
      const payload = { storySetup, outline, arcChapters, activeArcIndex, activeChapterIndex }
      localStorage.setItem(storageKey, JSON.stringify(payload))
    } catch (e) {
      // ignore
    }
  }

  function handleExport() {
    try {
      const payload = { storySetup, outline, arcChapters, activeArcIndex, activeChapterIndex }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mangaforge-story.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      // ignore
    }
  }

  function handleImportFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files && ev.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'))
        if (parsed.storySetup) setStorySetup(parsed.storySetup)
        if (parsed.outline) setOutline(parsed.outline)
        if (parsed.arcChapters) setArcChapters(parsed.arcChapters)
        if (typeof parsed.activeArcIndex === 'number') setActiveArcIndex(parsed.activeArcIndex)
        if (typeof parsed.activeChapterIndex === 'number') setActiveChapterIndex(parsed.activeChapterIndex)
      } catch (e) {
        // ignore
      }
    }
    reader.readAsText(f)
    // clear the input so the same file can be picked again
    ev.currentTarget.value = ''
  }

  function clearSaved() {
    try { localStorage.removeItem(storageKey) } catch (e) {}
  }

  function handleSetupComplete(setup: StorySetup) {
    setStorySetup(setup)
    setOutline(null)
    setArcChapters({})
    setActiveArcIndex(null)
    setActiveChapterIndex(null)
    setPage('arcs')
  }

  function goToArc(index: number) {
    setActiveArcIndex(index)
    setActiveChapterIndex(null)
    setPage('arcs')
  }

  function setChaptersForArc(arcIndex: number, chapters: ChapterBeat[]) {
    setArcChapters(prev => ({ ...prev, [arcIndex]: chapters }))
  }

  if (!storySetup) {
    return <SetupPage onContinue={handleSetupComplete} />
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__logo-mark">MF</div>
          <span className="sidebar__logo-text">MangaForge</span>
        </div>

        <div className="sidebar__section">
          <p className="sidebar__section-label">Workspace</p>
          <nav className="sidebar__nav">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`sidebar__nav-item ${
                  page === item.id && (item.id !== 'arcs' || activeArcIndex === null)
                    ? 'sidebar__nav-item--active' : ''
                }`}
                onClick={() => {
                  setPage(item.id)
                  if (item.id === 'arcs') setActiveArcIndex(null)
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {outline && outline.arcs.length > 0 && (
          <div className="sidebar__section">
            <p className="sidebar__section-label">Arcs</p>
            <nav className="sidebar__nav">
              {outline.arcs.map((arc, i) => {
                const hasChapters = !!(arcChapters[i]?.length)
                return (
                  <button
                    key={i}
                    className={`sidebar__nav-item ${
                      page === 'arcs' && activeArcIndex === i ? 'sidebar__nav-item--active' : ''
                    }`}
                    onClick={() => goToArc(i)}
                    title={arc.chapterRange}
                  >
                    <span className="nav-icon" style={{
                      fontSize: 10, fontFamily: 'var(--font-mono)',
                      color: hasChapters ? 'var(--accent)' : 'var(--text-tertiary)',
                    }}>
                      {hasChapters ? '●' : arc.number}
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>
                      {arc.name}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>
        )}

        <div className="sidebar__context">
          <p className="sidebar__context-label">Story</p>
          <div className="sidebar__context-value">
            <div style={{ fontWeight: 500, fontSize: 12, color: 'var(--text-primary)', marginBottom: 6 }}>
              {storySetup.title || 'Untitled'}
            </div>
            <span className="sidebar__context-tag">{storySetup.genre}</span>
            <span className="sidebar__context-tag">{storySetup.tone}</span>
            <span className="sidebar__context-tag">{storySetup.length}</span>
            {outline && (
              <span className="sidebar__context-tag" style={{ color: 'var(--accent)' }}>
                {outline.arcs.length} arcs
              </span>
            )}
            {Object.keys(arcChapters).length > 0 && (
              <span className="sidebar__context-tag" style={{ color: 'var(--teal)' }}>
                {Object.keys(arcChapters).length} mapped
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              className="btn btn--ghost"
              style={{ fontSize: 11 }}
              onClick={() => { setStorySetup(null); setOutline(null); setArcChapters({}) }}
            >
              ← New story
            </button>

            <button
              className="btn btn--ghost"
              style={{ fontSize: 11 }}
              onClick={() => saveNow()}
            >
              Save
            </button>

            <button
              className="btn btn--ghost"
              style={{ fontSize: 11 }}
              onClick={() => handleExport()}
            >
              Export
            </button>

            <button
              className="btn btn--ghost"
              style={{ fontSize: 11 }}
              onClick={() => fileInputRef.current?.click()}
            >
              Import
            </button>

            <button
              className="btn btn--ghost"
              style={{ fontSize: 11 }}
              onClick={() => clearSaved()}
            >
              Clear saved
            </button>
          </div>
          <input
            ref={el => { fileInputRef.current = el }}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={handleImportFile}
          />
        </div>
      </aside>

      <main className="main">
        {page === 'scene' && (
          <SceneIdeatorPage
            setup={storySetup}
            outline={outline}
            activeArcIndex={activeArcIndex}
            activeChapterIndex={activeChapterIndex}
            arcChapters={arcChapters}
            onSetActiveChapter={setActiveChapterIndex}
          />
        )}
        {page === 'arcs' && (
          <ArcBuilderPage
            setup={storySetup}
            outline={outline}
            setOutline={setOutline}
            activeArcIndex={activeArcIndex}
            setActiveArcIndex={(i) => { setActiveArcIndex(i); setActiveChapterIndex(null) }}
            arcChapters={arcChapters}
            setChaptersForArc={setChaptersForArc}
          />
        )}
        {page === 'tropes' && <TropesPage setup={storySetup} />}
        {page === 'codex'  && <CodexPage  setup={storySetup} />}
      </main>
    </div>
  )
}