import { useState } from 'react'
import type { StorySetup, StoryOutline, StoryArc } from '../types'
import { generateStoryOutline, generateArcChapters, regenerateSingleChapter } from '../services/claude'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ChapterBeat {
  chapter: string    // "Ch. 3"
  title: string      // "The Price of Silence"
  role: string       // Setup | Escalation | Climax | Fallout | Transition
  summary: string    // what happens
  endNote: string    // what it sets up
}

// ── EditableText ───────────────────────────────────────────────────────────────

function EditableText({
  value, onChange, multiline = false, className = '', placeholder = '',
}: {
  value: string; onChange: (v: string) => void
  multiline?: boolean; className?: string; placeholder?: string
}) {
  const [editing, setEditing] = useState(false)

  if (!editing) {
    return (
      <span
        className={`editable-text ${className}`}
        onClick={() => setEditing(true)}
        title="Click to edit"
      >
        {value || <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>{placeholder || 'Click to edit'}</span>}
      </span>
    )
  }
  if (multiline) {
    return (
      <textarea
        autoFocus
        className={`editable-textarea ${className}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        rows={3}
      />
    )
  }
  return (
    <input
      autoFocus
      className={`editable-input ${className}`}
      value={value}
      onChange={e => onChange(e.target.value)}
      onBlur={() => setEditing(false)}
      onKeyDown={e => { if (e.key === 'Enter') setEditing(false) }}
    />
  )
}

// ── Role pill colours ──────────────────────────────────────────────────────────

const ROLE_COLOR: Record<string, string> = {
  Setup:       'var(--teal)',
  Escalation:  'var(--purple)',
  Climax:      'var(--accent)',
  Fallout:     'var(--gold)',
  Transition:  'var(--text-tertiary)',
}

// ── Arc detail view ────────────────────────────────────────────────────────────

function ArcDetailView({
  arc, arcIndex, totalArcs, outline, setup,
  chapters, onSetChapters, onUpdateArc, onBack,
}: {
  arc: StoryArc
  arcIndex: number
  totalArcs: number
  outline: StoryOutline
  setup: StorySetup
  chapters: ChapterBeat[]
  onSetChapters: (chs: ChapterBeat[]) => void
  onUpdateArc: (updated: StoryArc) => void
  onBack: () => void
}) {
  const [genLoading, setGenLoading]     = useState(false)
  const [regenIdx, setRegenIdx]         = useState<number | null>(null)
  const [error, setError]               = useState<string | null>(null)
  const [expandedCh, setExpandedCh]     = useState<number | null>(null)
  const [chapterEditPrompt, setChapterEditPrompt] = useState<Record<number, string>>({})

  async function handleGenerateChapters() {
    setGenLoading(true)
    setError(null)
    try {
      const prevArc = arcIndex > 0 ? outline.arcs[arcIndex - 1] : null
      const nextArc = arcIndex < outline.arcs.length - 1 ? outline.arcs[arcIndex + 1] : null
      const result  = await generateArcChapters(setup, outline, arc, prevArc, nextArc)
      onSetChapters(result)
      setExpandedCh(0)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setGenLoading(false)
    }
  }

  async function handleRegenChapter(i: number) {
    setRegenIdx(i)
    setError(null)
    try {
      const prevCh = i > 0 ? chapters[i - 1] : null
      const nextCh = i < chapters.length - 1 ? chapters[i + 1] : null
      const instruction = chapterEditPrompt[i]?.trim() || undefined
      const updated = await regenerateSingleChapter(setup, outline, arc, chapters[i], prevCh, nextCh, instruction)
      const newChs = chapters.map((ch, idx) => idx === i ? updated : ch)
      onSetChapters(newChs)
      // clear the prompt after successful regen
      setChapterEditPrompt(prev => ({ ...prev, [i]: '' }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setRegenIdx(null)
    }
  }

  function updateChapter(i: number, field: keyof ChapterBeat, value: string) {
    onSetChapters(chapters.map((ch, idx) => idx === i ? { ...ch, [field]: value } : ch))
  }

  function updateKeyMoment(i: number, value: string) {
    const updated = [...arc.keyMoments]
    updated[i] = value
    onUpdateArc({ ...arc, keyMoments: updated })
  }

  function addKeyMoment() {
    onUpdateArc({ ...arc, keyMoments: [...arc.keyMoments, ''] })
  }

  function removeKeyMoment(i: number) {
    onUpdateArc({ ...arc, keyMoments: arc.keyMoments.filter((_, idx) => idx !== i) })
  }

  // Visual arc shape bar
  // Visual arc shape bar (role order not currently used)

  return (
    <div className="arc-detail">
      {/* Breadcrumb */}
      <div className="arc-detail__breadcrumb">
        <button className="btn btn--ghost" onClick={onBack} style={{ fontSize: 11, padding: '4px 0' }}>
          ← All arcs
        </button>
        <span className="arc-detail__breadcrumb-sep">/</span>
        <span className="arc-detail__breadcrumb-current">Arc {arc.number} · {arc.name}</span>
      </div>

      {/* Arc header — all editable */}
      <div className="arc-detail__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span className="tag tag--muted text-mono" style={{ fontSize: 10 }}>Arc {arc.number} of {totalArcs}</span>
          <EditableText
            value={arc.chapterRange}
            onChange={v => onUpdateArc({ ...arc, chapterRange: v })}
            className="arc-detail__chapter-range"
            placeholder="Ch. range"
          />
        </div>
        <EditableText
          value={arc.name}
          onChange={v => onUpdateArc({ ...arc, name: v })}
          className="arc-detail__name"
          placeholder="Arc name"
        />

        <div className="arc-detail__meta-block" style={{ marginTop: 14 }}>
          <p className="card__section-label" style={{ marginBottom: 6 }}>Summary</p>
          <EditableText
            value={arc.summary}
            onChange={v => onUpdateArc({ ...arc, summary: v })}
            multiline
            className="arc-detail__summary"
            placeholder="What this arc is about…"
          />
        </div>

        {/* Key moments */}
        <div className="arc-detail__meta-block" style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <p className="card__section-label">Key moments</p>
            <button className="btn btn--ghost btn--sm" onClick={addKeyMoment} style={{ fontSize: 11 }}>+ Add</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {arc.keyMoments.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11, paddingTop: 3, flexShrink: 0 }}>→</span>
                <EditableText
                  value={m}
                  onChange={v => updateKeyMoment(i, v)}
                  className="arc-detail__moment"
                  placeholder="Key moment…"
                />
                <button
                  className="btn btn--ghost"
                  style={{ fontSize: 11, padding: '2px 4px', flexShrink: 0, color: 'var(--text-tertiary)' }}
                  onClick={() => removeKeyMoment(i)}
                >×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Ending hook */}
        <div className="arc-detail__hook" style={{ marginTop: 14 }}>
          <span className="arc-item__hook-label">Arc ending hook</span>
          <EditableText
            value={arc.endingHook}
            onChange={v => onUpdateArc({ ...arc, endingHook: v })}
            multiline
            className="arc-detail__hook-text"
            placeholder="The cliffhanger or revelation that closes this arc…"
          />
        </div>
      </div>

      {/* Chapter breakdown */}
      <div className="arc-detail__chapters">
        <div className="arc-detail__chapters-header">
          <div>
            <p className="section-heading__label" style={{ marginBottom: 2 }}>Chapter breakdown</p>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              {chapters.length > 0
                ? `${chapters.length} chapters · click any field to edit · regen individual chapters`
                : 'Generate a beat-by-beat chapter map for this arc'}
            </p>
          </div>
          <button
            className="btn btn--primary btn--sm"
            onClick={handleGenerateChapters}
            disabled={genLoading}
          >
            {genLoading ? 'Generating…' : chapters.length > 0 ? '↺ Regen all' : 'Generate chapters'}
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}

        {/* Arc shape bar */}
        {chapters.length > 0 && (
          <div className="arc-shape-bar">
            {chapters.map((ch, i) => (
              <div
                key={i}
                className="arc-shape-bar__segment"
                style={{ background: ROLE_COLOR[ch.role] ?? 'var(--surface-4)' }}
                title={`${ch.chapter} · ${ch.role} · ${ch.title}`}
                onClick={() => { setExpandedCh(i); }}
              />
            ))}
          </div>
        )}

        {/* Skeleton */}
        {genLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 10 }}>
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="loading-card" style={{ padding: '12px 14px' }}>
                <div className="skeleton skeleton--title" style={{ width: '30%' }} />
                <div className="skeleton skeleton--line mt-8" style={{ width: '75%' }} />
              </div>
            ))}
          </div>
        )}

        {/* Chapter list */}
        {chapters.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10 }}>
            {chapters.map((ch, i) => (
              <div
                key={i}
                className={`chapter-item ${expandedCh === i ? 'chapter-item--open' : ''}`}
              >
                <button
                  className="chapter-item__header"
                  onClick={() => setExpandedCh(expandedCh === i ? null : i)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    <span className="chapter-item__num text-mono">{ch.chapter}</span>
                    <span
                      className="chapter-item__role"
                      style={{ color: ROLE_COLOR[ch.role] ?? 'var(--text-tertiary)' }}
                    >
                      {ch.role}
                    </span>
                    <span className="chapter-item__title">{ch.title}</span>
                  </div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: 11, flexShrink: 0 }}>
                    {expandedCh === i ? '↑' : '↓'}
                  </span>
                </button>

                {expandedCh === i && (
                  <div className="chapter-item__body">
                    <div className="chapter-item__fields-row">
                      {/* Chapter label */}
                      <div className="chapter-item__field">
                        <p className="card__section-label">Chapter</p>
                        <EditableText
                          value={ch.chapter}
                          onChange={v => updateChapter(i, 'chapter', v)}
                          className="chapter-item__edit-text"
                          placeholder="Ch. N"
                        />
                      </div>
                      {/* Role */}
                      <div className="chapter-item__field">
                        <p className="card__section-label">Role</p>
                        <select
                          className="field__select"
                          style={{ fontSize: 12, padding: '5px 8px' }}
                          value={ch.role}
                          onChange={e => updateChapter(i, 'role', e.target.value)}
                        >
                          {['Setup', 'Escalation', 'Climax', 'Fallout', 'Transition'].map(r => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="chapter-item__field" style={{ marginTop: 10 }}>
                      <p className="card__section-label">Title</p>
                      <EditableText
                        value={ch.title}
                        onChange={v => updateChapter(i, 'title', v)}
                        className="chapter-item__edit-text"
                        placeholder="Chapter title"
                      />
                    </div>

                    <div className="chapter-item__field" style={{ marginTop: 10 }}>
                      <p className="card__section-label">What happens</p>
                      <EditableText
                        value={ch.summary}
                        onChange={v => updateChapter(i, 'summary', v)}
                        multiline
                        className="chapter-item__edit-text"
                        placeholder="What happens in this chapter…"
                      />
                    </div>

                    <div className="chapter-item__field" style={{ marginTop: 10 }}>
                      <p className="card__section-label">Sets up</p>
                      <EditableText
                        value={ch.endNote}
                        onChange={v => updateChapter(i, 'endNote', v)}
                        className="chapter-item__edit-text"
                        placeholder="What this chapter sets up…"
                      />
                    </div>

                    <div className="chapter-item__regen-row">
                      <input
                        className="chapter-item__edit-prompt"
                        placeholder={'e.g. "make this happen from the rival\'s POV" or "cut the fight, focus on the conversation"'}
                        value={chapterEditPrompt[i] ?? ''}
                        onChange={e => setChapterEditPrompt(prev => ({ ...prev, [i]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleRegenChapter(i) }}
                      />
                      <button
                        className="btn btn--ghost btn--sm"
                        style={{ fontSize: 11, color: 'var(--text-tertiary)', flexShrink: 0 }}
                        disabled={regenIdx === i}
                        onClick={() => handleRegenChapter(i)}
                      >
                        {regenIdx === i ? 'Regenerating…' : '↺ Regenerate'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── ArcBuilderPage (outline view + drill-down) ─────────────────────────────────

interface Props {
  setup: StorySetup
  outline: StoryOutline | null
  setOutline: (o: StoryOutline | null) => void
  activeArcIndex: number | null
  setActiveArcIndex: (i: number | null) => void
  arcChapters: Record<number, ChapterBeat[]>
  setChaptersForArc: (arcIndex: number, chapters: ChapterBeat[]) => void
}

export function ArcBuilderPage({
  setup, outline, setOutline,
  activeArcIndex, setActiveArcIndex,
  arcChapters, setChaptersForArc,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    setOutline(null)
    setActiveArcIndex(null)
    try {
      const result = await generateStoryOutline(setup)
      setOutline(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function updateArc(index: number, updated: StoryArc) {
    if (!outline) return
    setOutline({ ...outline, arcs: outline.arcs.map((a, i) => i === index ? updated : a) })
  }

  // ── Drill-down into an arc ─────────────────────────────────────────────────
  if (activeArcIndex !== null && outline) {
    const arc = outline.arcs[activeArcIndex]
    if (arc) return (
      <>
        <div className="main__header">
          <span className="main__header-title">Arc {arc.number} · {arc.name}</span>
          <span className="main__header-meta">{arc.chapterRange}</span>
        </div>
        <div className="main__body" style={{ maxWidth: 820 }}>
          <ArcDetailView
            arc={arc}
            arcIndex={activeArcIndex}
            totalArcs={outline.arcs.length}
            outline={outline}
            setup={setup}
            chapters={arcChapters[activeArcIndex] ?? []}
            onSetChapters={chs => setChaptersForArc(activeArcIndex, chs)}
            onUpdateArc={updated => updateArc(activeArcIndex, updated)}
            onBack={() => setActiveArcIndex(null)}
          />
        </div>
      </>
    )
  }

  // ── Outline overview ───────────────────────────────────────────────────────
  const pacingNote: Record<string, string> = {
    sprint:   'Tight, no filler — every arc hits hard.',
    midrun:   'Balanced pacing with a midpoint twist.',
    longhaul: 'Modular arcs threading a larger mystery.',
    epic:     'World-first, lore-deep, decades of story.',
  }

  return (
    <>
      <div className="main__header">
        <span className="main__header-title">Arc Builder</span>
        <span className="main__header-meta">
          {outline
            ? `${outline.arcs.length} arcs · click an arc to enter it`
            : 'Story structure overview'}
        </span>
      </div>

      <div className="main__body">
        {!outline && !loading && (
          <>
            <div className="section-heading">
              <p className="section-heading__label">Arc structure</p>
              <p className="section-heading__desc">
                {pacingNote[setup.length] ?? 'Generate a complete arc breakdown for your story.'}{' '}
                Once generated, enter any arc to map its chapter-by-chapter beats.
              </p>
            </div>
            <button className="btn btn--primary" onClick={handleGenerate}>
              Generate arc outline
            </button>
          </>
        )}

        {error && <div className="error-box">{error}</div>}

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1,2,3,4].map(i => (
              <div key={i} className="loading-card">
                <div className="skeleton skeleton--title" />
                <div className="skeleton skeleton--line mt-8" />
              </div>
            ))}
          </div>
        )}

        {outline && (
          <>
            {/* Editable meta strip */}
            <div className="meta-strip">
              <div className="meta-block meta-block--span">
                <p className="meta-block__label">Logline</p>
                <EditableText
                  value={outline.logline}
                  onChange={v => setOutline({ ...outline, logline: v })}
                  multiline className="meta-block__value" placeholder="Logline…"
                />
              </div>
              <div className="meta-block">
                <p className="meta-block__label">Est. chapters</p>
                <EditableText
                  value={outline.totalChapters}
                  onChange={v => setOutline({ ...outline, totalChapters: v })}
                  className="meta-block__value--large"
                />
              </div>
              <div className="meta-block">
                <p className="meta-block__label">Total arcs</p>
                <p className="meta-block__value--large">{outline.arcs.length}</p>
              </div>
              {outline.powerSystem && (
                <div className="meta-block meta-block--span">
                  <p className="meta-block__label">Power system</p>
                  <EditableText
                    value={outline.powerSystem}
                    onChange={v => setOutline({ ...outline, powerSystem: v })}
                    multiline className="meta-block__value"
                  />
                </div>
              )}
              {outline.worldNotes && (
                <div className="meta-block meta-block--span">
                  <p className="meta-block__label">World notes</p>
                  <EditableText
                    value={outline.worldNotes}
                    onChange={v => setOutline({ ...outline, worldNotes: v })}
                    multiline className="meta-block__value"
                  />
                </div>
              )}
            </div>

            {/* Arc overview cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {outline.arcs.map((arc, i) => {
                const chaps = arcChapters[i]
                const hasChapters = !!(chaps?.length)
                return (
                  <div key={i} className="arc-overview-card">
                    <div className="arc-overview-card__left">
                      <span className="arc-item__number">Arc {arc.number}</span>
                      <div>
                        <p className="arc-item__name">{arc.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                          {arc.chapterRange}
                          {hasChapters && (
                            <span style={{ color: 'var(--accent)', marginLeft: 8 }}>
                              · {chaps.length} chapters mapped
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="arc-overview-card__right">
                      {hasChapters && (
                        <div className="arc-mini-bar">
                          {chaps.map((ch, ci) => (
                            <div
                              key={ci}
                              className="arc-mini-bar__seg"
                              style={{ background: ROLE_COLOR[ch.role] ?? 'var(--surface-4)' }}
                              title={ch.role}
                            />
                          ))}
                        </div>
                      )}
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, marginRight: 14 }}>
                        {arc.summary}
                      </p>
                      <button
                        className="btn btn--secondary btn--sm"
                        style={{ flexShrink: 0 }}
                        onClick={() => setActiveArcIndex(i)}
                      >
                        Enter arc →
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <button className="btn btn--ghost btn--sm" onClick={handleGenerate}>
              ↺ Regenerate outline
            </button>
          </>
        )}
      </div>
    </>
  )
}