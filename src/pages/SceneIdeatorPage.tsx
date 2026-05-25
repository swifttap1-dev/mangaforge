import { useState, useEffect } from 'react'
import type { StorySetup, SceneOption, StoryOutline } from '../types'
import type { ChapterBeat } from './ArcBuilderPage'
import { generateScenes } from '../services/claude'

const PACE_LABELS = ['very fast', 'fast', 'balanced', 'slow', 'very slow'] as const
export type PaceBias = typeof PACE_LABELS[number]

const PACE_DESCRIPTIONS: Record<number, string> = {
  0: 'Many scenes, 1–3 pages each. Cuts hard. Reader barely settles before moving.',
  1: 'Scenes run short. Action-heavy moments compress. Dialogue trims. Momentum first.',
  2: 'Natural distribution — some scenes linger, others cut quick depending on content.',
  3: 'Fewer scenes, each given room to breathe. Silence and atmosphere get page time.',
  4: 'Very few scenes. Pages dwell. Emotion lands slowly. Quiet is used as a storytelling tool.',
}

interface Props {
  setup: StorySetup
  outline: StoryOutline | null
  activeArcIndex: number | null
  activeChapterIndex: number | null
  arcChapters: Record<number, ChapterBeat[]>
  onSetActiveChapter: (i: number | null) => void
}

export function SceneIdeatorPage({
  setup, outline, activeArcIndex, activeChapterIndex, arcChapters, onSetActiveChapter,
}: Props) {
  const [sceneDesc, setSceneDesc]   = useState('')
  const [scenes, setScenes]         = useState<SceneOption[]>([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [selected, setSelected]     = useState<string | null>(null)
  const [pageBudget, setPageBudget] = useState(19)
  const [paceIndex, setPaceIndex]   = useState(2) // 0=very fast … 4=very slow
  const [arcContext, setArcContext]  = useState<number | 'none'>(
    activeArcIndex !== null ? activeArcIndex : 'none'
  )
  const [chapterContext, setChapterContext] = useState<number | 'none'>(
    activeChapterIndex !== null ? activeChapterIndex : 'none'
  )

  const activeArc = outline && arcContext !== 'none' ? outline.arcs[arcContext as number] : null
  const chaptersForArc = arcContext !== 'none' ? arcChapters[arcContext as number] : undefined
  const activeChapter = chaptersForArc && chapterContext !== 'none'
    ? chaptersForArc[chapterContext as number]
    : null

  // Load saved scenes from localStorage
  const initialSavedScenes = (() => {
    try {
      const raw = localStorage.getItem('mangaforge:saved-scenes')
      return raw ? JSON.parse(raw) as SceneOption[] : []
    } catch (e) {}
    return []
  })()

  const [savedScenes, setSavedScenes] = useState<SceneOption[]>(initialSavedScenes)
  const [showSavedScenes, setShowSavedScenes] = useState(false)

  // Persist saved scenes to localStorage
  useEffect(() => {
    try { localStorage.setItem('mangaforge:saved-scenes', JSON.stringify(savedScenes)) } catch (e) {}
  }, [savedScenes])

  function saveScene(scene: SceneOption) {
    setSavedScenes(prev => {
      const exists = prev.find(s => s.id === scene.id)
      if (exists) {
        // update existing
        return prev.map(s => s.id === scene.id ? scene : s)
      }
      // add new
      return [...prev, scene]
    })
  }

  function removeSavedScene(sceneId: string) {
    setSavedScenes(prev => prev.filter(s => s.id !== sceneId))
  }

  function exportSceneAsText(scene: SceneOption): string {
    let text = `# ${scene.title}\n\n`

    if (scene.purpose) {
      text += `**Purpose:** ${scene.purpose}\n\n`
    }

    if (scene.emotion || scene.pacing) {
      text += `**Tone:** `
      if (scene.emotion) text += `${scene.emotion}`
      if (scene.emotion && scene.pacing) text += `, `
      if (scene.pacing) text += `${scene.pacing}`
      text += `\n\n`
    }

    if (scene.pageRange) {
      text += `**Pages:** ${scene.pageRange}\n\n`
    }

    if (Array.isArray(scene.pages) && scene.pages.length > 0) {
      text += `## Page Breakdown\n\n`
      scene.pages.forEach((pg: any) => {
        text += `### Page ${pg.page}\n`
        if (pg.density) text += `*Density: ${pg.density}*\n`
        if (pg.anchor) text += `\n**Anchor:** ${pg.anchor}\n`
        if (Array.isArray(pg.beats) && pg.beats.length > 0) {
          text += `\n**Beats:**\n`
          pg.beats.forEach((beat: string) => {
            text += `- ${beat}\n`
          })
        }
        text += `\n`
      })
    }

    if (scene.closingNote) {
      text += `**Closing Note:** *${scene.closingNote}*\n\n`
    }

    if (scene.arcConnection) {
      text += `**Arc Connection:** ${scene.arcConnection}\n\n`
    }

    return text
  }

  function downloadSceneText(scene: SceneOption) {
    const text = exportSceneAsText(scene)
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scene-${scene.title.toLowerCase().replace(/\s+/g, '-')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Check which setup fields are missing — the AI freestyles without these
  const missingSetup = [
    !setup.title       && 'title',
    !setup.genre       && 'genre',
    !setup.tone        && 'tone',
    !setup.premise     && 'premise',
    !setup.protagonist && 'protagonist',
  ].filter(Boolean) as string[]

  const setupIncomplete = missingSetup.length > 0

  function handleArcChange(val: number | 'none') {
    setArcContext(val)
    setChapterContext('none')
    onSetActiveChapter(null)
  }

  async function handleGenerate() {
    if (!sceneDesc.trim()) return
    setLoading(true)
    setError(null)
    setScenes([])
    setSelected(null)
    try {
      const results = await generateScenes(
        setup, sceneDesc,
        activeArc ?? undefined, activeChapter ?? undefined,
        pageBudget, PACE_LABELS[paceIndex],
      )
      setScenes(results)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate()
  }

  return (
    <>
      <div className="main__header">
        <span className="main__header-title">Chapter Ideator</span>
        <span className="main__header-meta">
          {activeChapter
            ? `${activeArc?.name} · ${activeChapter.chapter} · ${activeChapter.title}`
            : activeArc
              ? `Arc context: ${activeArc.name}`
              : 'No arc context set'}
        </span>
      </div>

      <div className="main__body">
        {/* Arc + chapter context selectors */}
        {outline && outline.arcs.length > 0 && (
          <div className="scene-context-panel">
            <div className="scene-context-panel__row">
              <div style={{ flex: 1 }}>
                <p className="card__section-label" style={{ marginBottom: 6 }}>Arc context</p>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  <button
                    className={`context-pill ${arcContext === 'none' ? 'context-pill--active' : ''}`}
                    onClick={() => handleArcChange('none')}
                  >None</button>
                  {outline.arcs.map((arc, i) => (
                    <button
                      key={i}
                      className={`context-pill ${arcContext === i ? 'context-pill--active' : ''}`}
                      onClick={() => handleArcChange(i)}
                    >
                      Arc {arc.number} · {arc.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {chaptersForArc && chaptersForArc.length > 0 && (
              <div className="scene-context-panel__row" style={{ marginTop: 12 }}>
                <div style={{ flex: 1 }}>
                  <p className="card__section-label" style={{ marginBottom: 6 }}>Chapter context</p>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    <button
                      className={`context-pill ${chapterContext === 'none' ? 'context-pill--active' : ''}`}
                      onClick={() => setChapterContext('none')}
                    >None</button>
                    {chaptersForArc.map((ch, i) => (
                      <button
                        key={i}
                        className={`context-pill ${chapterContext === i ? 'context-pill--active' : ''}`}
                        onClick={() => setChapterContext(i)}
                        title={ch.title}
                      >
                        {ch.chapter} · {ch.role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(activeArc || activeChapter) && (
              <div className="scene-context-panel__summary">
                {activeChapter ? (
                  <>
                    <span className="tag tag--accent" style={{ fontSize: 10, marginRight: 6 }}>{activeChapter.chapter}</span>
                    <span className="tag tag--muted" style={{ fontSize: 10, marginRight: 8 }}>{activeChapter.role}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{activeChapter.summary}</span>
                  </>
                ) : activeArc ? (
                  <>
                    <span className="tag tag--muted" style={{ fontSize: 10, marginRight: 8 }}>{activeArc.chapterRange}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{activeArc.summary}</span>
                  </>
                ) : null}
              </div>
            )}
          </div>
        )}

        <div className="section-heading" style={{ marginTop: outline ? 20 : 0 }}>
          <p className="section-heading__label">Describe what this chapter is about</p>
          <p className="section-heading__desc">
            Rough idea is fine — you'll get 3 full chapter layouts broken into pages with
            anchors, panel density, and beat-by-beat notes. Set your page budget and pacing first.{' '}
            <span className="text-mono" style={{ fontSize: 11 }}>⌘ Enter</span> to generate.
          </p>
        </div>

        {/* Page budget + pace controls */}
        <div className="scene-controls">
          <div className="scene-controls__group">
            <label className="card__section-label">Page budget</label>
            <div className="scene-controls__budget">
              <button
                className="scene-controls__nudge"
                onClick={() => setPageBudget(b => Math.max(4, b - 1))}
                disabled={pageBudget <= 4}
              >−</button>
              <span className="scene-controls__budget-val text-mono">{pageBudget}</span>
              <button
                className="scene-controls__nudge"
                onClick={() => setPageBudget(b => Math.min(40, b + 1))}
                disabled={pageBudget >= 40}
              >+</button>
              <span className="scene-controls__budget-hint">pages total</span>
            </div>
          </div>

          <div className="scene-controls__group" style={{ flex: 1 }}>
            <label className="card__section-label">
              Pacing — <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{PACE_LABELS[paceIndex]}</span>
            </label>
            <div className="scene-controls__pace">
              <span className="scene-controls__pace-label">fast</span>
              <input
                type="range"
                min={0} max={4} step={1}
                value={paceIndex}
                onChange={e => setPaceIndex(Number(e.target.value))}
                className="scene-controls__slider"
              />
              <span className="scene-controls__pace-label">slow</span>
            </div>
            <p className="scene-controls__pace-desc">{PACE_DESCRIPTIONS[paceIndex]}</p>
          </div>
        </div>

        {/* Setup completeness warning */}
        {setupIncomplete && (
          <div className="setup-warning">
            <span className="setup-warning__icon">⚠</span>
            <div>
              <p className="setup-warning__title">Story setup is incomplete</p>
              <p className="setup-warning__body">
                The AI will invent its own story if these are missing:{' '}
                <span className="setup-warning__fields">{missingSetup.join(', ')}</span>.
                Fill them in on the Setup page for grounded results.
              </p>
            </div>
          </div>
        )}

        <div className="prompt-bar">
          <textarea
            className="prompt-bar__textarea"
            placeholder="e.g. 'The detective realises the student has been watching him the whole time'"
            value={sceneDesc}
            onChange={e => setSceneDesc(e.target.value)}
            onKeyDown={handleKey}
            rows={3}
          />
          <button
            className="btn btn--primary"
            onClick={handleGenerate}
            disabled={loading || !sceneDesc.trim()}
          >
            {loading ? 'Generating…' : 'Generate chapter'}
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}

        {/* Saved scenes panel */}
        {savedScenes.length > 0 && (
          <div style={{ marginBottom: 16, borderRadius: 'var(--r-md)', border: '1px solid var(--border-mid)', padding: 12, background: 'var(--surface-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                Saved Scenes ({savedScenes.length})
              </p>
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => setShowSavedScenes(!showSavedScenes)}
                style={{ fontSize: 11 }}
              >
                {showSavedScenes ? 'Hide' : 'Show'}
              </button>
            </div>
            {showSavedScenes && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {savedScenes.map(savedScene => (
                  <div
                    key={savedScene.id}
                    style={{
                      padding: 8,
                      background: 'var(--surface-3)',
                      borderRadius: 'var(--r-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {savedScene.title}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        {savedScene.purpose || 'No purpose set'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => downloadSceneText(savedScene)}
                        style={{ fontSize: 11 }}
                      >
                        ↓ Export
                      </button>
                      <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => removeSavedScene(savedScene.id)}
                        style={{ fontSize: 11, color: 'var(--text-tertiary)' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <div className="error-box">{error}</div>}

        {loading && (
          <div className="loading-cards">
            {[1, 2, 3].map(i => (
              <div key={i} className="loading-card">
                <div className="skeleton skeleton--title" />
                <div className="skeleton skeleton--line mt-8" />
                <div className="skeleton skeleton--line skeleton--short mt-4" />
                <div className="skeleton skeleton--line mt-8" />
                <div className="skeleton skeleton--line mt-4" />
                <div className="skeleton skeleton--line skeleton--short mt-4" />
              </div>
            ))}
          </div>
        )}

        {scenes.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {scenes.map(scene => (
              <div
                key={scene.id}
                className={`card card--interactive ${selected === scene.id ? 'card--selected' : ''}`}
                onClick={() => setSelected(scene.id === selected ? null : scene.id)}
              >
                {/* Header */}
                <div className="card__header">
                  <div>
                    <h3 className="card__title">{scene.title}</h3>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      {scene.pageRange && (
                        <span className="tag tag--muted" style={{ fontSize: 10 }}>
                          pp. {scene.pageRange}
                        </span>
                      )}
                      {Array.isArray(scene.pages) && scene.pages.length > 0 && (
                        <span className="tag tag--muted" style={{ fontSize: 10 }}>
                          {scene.pages.reduce((acc, pg) => {
                            // count spread pages (e.g. "3–4") as 2
                            if (typeof pg.page === 'string' && pg.page.includes('–')) {
                              const [a, b] = pg.page.split('–').map(Number)
                              return acc + (b - a + 1)
                            }
                            return acc + 1
                          }, 0)} pages
                        </span>
                      )}
                      {savedScenes.some(s => s.id === scene.id) && (
                        <span className="tag tag--accent" style={{ fontSize: 10 }}>✓ Saved</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={(e) => { e.stopPropagation(); saveScene(scene) }}
                      style={{ fontSize: 11 }}
                    >
                      {savedScenes.some(s => s.id === scene.id) ? '✓ Saved' : '+ Save'}
                    </button>
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={(e) => { e.stopPropagation(); downloadSceneText(scene) }}
                      style={{ fontSize: 11 }}
                    >
                      ↓ Export
                    </button>
                    {selected === scene.id && <div className="card__check">✓</div>}
                  </div>
                </div>

                {/* Purpose */}
                {scene.purpose && (
                  <div className="card__section">
                    <p className="card__section-label">Purpose</p>
                    <p className="card__section-body" style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                      {scene.purpose}
                    </p>
                  </div>
                )}

                {/* Tone tags */}
                <div className="card__tags">
                  {scene.emotion && <span className="tag tag--purple">{scene.emotion}</span>}
                  {scene.pacing && <span className="tag tag--teal">{scene.pacing}</span>}
                </div>

                {/* Page-by-page breakdown */}
                {Array.isArray(scene.pages) && scene.pages.length > 0 && (
                  <div className="card__section">
                    <p className="card__section-label">Page breakdown</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
                      {scene.pages.map((pg: any, pi: number) => (
                        <div key={pi} className="page-row">
                          <div className="page-row__header">
                            <span className="panel-row__num text-mono">P{pg.page}</span>
                            {pg.density && (
                              <span className={`tag tag--muted page-row__density`} style={{ fontSize: 10 }}>
                                {pg.density}
                              </span>
                            )}
                          </div>
                          {pg.anchor && (
                            <p className="page-row__anchor">↳ {pg.anchor}</p>
                          )}
                          {Array.isArray(pg.beats) && pg.beats.length > 0 && (
                            <ul className="page-row__beats">
                              {pg.beats.map((beat: string, bi: number) => (
                                <li key={bi} className="page-row__beat">{beat}</li>
                              ))}
                            </ul>
                          )}
                          {/* fallback for old format */}
                          {!pg.anchor && !pg.beats && pg.note && (
                            <p className="page-row__desc">{pg.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Closing note — the "reader takeaway" line */}
                {scene.closingNote && (
                  <div className="card__section">
                    <p
                      className="card__section-body"
                      style={{ color: 'var(--accent)', fontSize: 12, fontStyle: 'italic' }}
                    >
                      {scene.closingNote}
                    </p>
                  </div>
                )}

                {/* Arc connection if present */}
                {scene.arcConnection && (
                  <div className="card__section">
                    <p className="card__section-label">Arc / chapter connection</p>
                    <p className="card__section-body" style={{ color: 'var(--accent)', fontSize: 12 }}>
                      {scene.arcConnection}
                    </p>
                  </div>
                )}
              </div>
            ))}

            <button
              className="btn btn--secondary btn--sm"
              style={{ alignSelf: 'flex-start', marginTop: 4 }}
              onClick={handleGenerate}
            >
              ↺ Regenerate chapter
            </button>
          </div>
        )}
      </div>
    </>
  )
}