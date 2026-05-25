import { useState, useEffect } from 'react'
import type { StorySetup } from '../types'
import { generateCharacterScene } from '../services/claude'

interface Character {
  id: string
  name: string
  role: string
  firstAppearance: string
  relationships: string
  currentState: string
  rules: string
}

function makeId() {
  return Math.random().toString(36).slice(2, 8)
}

function emptyCharacter(): Character {
  return {
    id: makeId(),
    name: 'New character',
    role: '',
    firstAppearance: '',
    relationships: '',
    currentState: '',
    rules: '',
  }
}

const EMOJI_FOR_ROLE: Record<string, string> = {
  protagonist: '★',
  antagonist: '◆',
  rival: '◈',
  mentor: '◎',
  ally: '◉',
}

function avatarFor(role: string) {
  const key = role.toLowerCase().trim()
  for (const [k, v] of Object.entries(EMOJI_FOR_ROLE)) {
    if (key.includes(k)) return v
  }
  return '○'
}

interface Props {
  setup: StorySetup
}

export function CodexPage({ setup }: Props) {
  const initialCharacters: Character[] = (() => {
    try {
      const raw = localStorage.getItem('mangaforge:codex')
      if (raw) return JSON.parse(raw) as Character[]
    } catch (e) {}
    return [emptyCharacter()]
  })()

  const [characters, setCharacters] = useState<Character[]>(initialCharacters)
  const [activeId, setActiveId]     = useState<string>(initialCharacters[0].id)
  const [aiPrompt, setAiPrompt]     = useState('')
  const [aiResult, setAiResult]     = useState('')
  const [aiLoading, setAiLoading]   = useState(false)
  const [aiError, setAiError]       = useState<string | null>(null)

  const active = characters.find(c => c.id === activeId) ?? null

  function updateActive(field: keyof Character, value: string) {
    setCharacters(prev =>
      prev.map(c => c.id === activeId ? { ...c, [field]: value } : c)
    )
  }

  function addCharacter() {
    const nc = emptyCharacter()
    setCharacters(prev => [...prev, nc])
    setActiveId(nc.id)
    setAiResult('')
  }

  function deleteActive() {
    if (characters.length === 1) return
    const remaining = characters.filter(c => c.id !== activeId)
    setCharacters(remaining)
    setActiveId(remaining[0].id)
    setAiResult('')
  }

  // persist characters locally
  useEffect(() => {
    try { localStorage.setItem('mangaforge:codex', JSON.stringify(characters)) } catch (e) {}
  }, [characters])

  async function handleAiGenerate() {
    if (!active || !aiPrompt.trim()) return
    setAiLoading(true)
    setAiError(null)
    setAiResult('')
    try {
      const result = await generateCharacterScene(setup, active, aiPrompt)
      setAiResult(result)
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setAiLoading(false)
    }
  }

  function handleAiKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAiGenerate()
  }

  return (
    <>
      <div className="main__header">
        <span className="main__header-title">Character Codex</span>
        <span className="main__header-meta">Story bible · {characters.length} {characters.length === 1 ? 'character' : 'characters'}</span>
      </div>

      <div className="main__body" style={{ maxWidth: 'none' }}>
        <div className="codex-layout">
          {/* Sidebar: character list */}
          <div>
            <div className="codex-sidebar">
              {characters.map(c => (
                <button
                  key={c.id}
                  className={`codex-entry-item ${activeId === c.id ? 'codex-entry-item--active' : ''}`}
                  onClick={() => { setActiveId(c.id); setAiResult('') }}
                >
                  <div className="codex-entry-item__avatar">{avatarFor(c.role)}</div>
                  <div>
                    <div className="codex-entry-item__name">{c.name || 'Unnamed'}</div>
                    <div className="codex-entry-item__role">{c.role || 'No role set'}</div>
                  </div>
                </button>
              ))}
            </div>

            <button
              className="btn btn--secondary btn--sm btn--full"
              style={{ marginTop: 10 }}
              onClick={addCharacter}
            >
              + Add character
            </button>
          </div>

          {/* Detail panel */}
          {active ? (
            <div className="codex-detail">
              <div className="codex-detail__topbar">
                <input
                  className="codex-detail__name"
                  value={active.name}
                  onChange={e => updateActive('name', e.target.value)}
                  placeholder="Character name"
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="tag tag--muted">{active.role || 'no role'}</span>
                  {characters.length > 1 && (
                    <button className="btn btn--ghost btn--sm" onClick={deleteActive}>
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <div className="codex-detail__body">
                {/* Role */}
                <div className="codex-field">
                  <label className="codex-field__label">Role</label>
                  <input
                    className="codex-field__input"
                    value={active.role}
                    onChange={e => updateActive('role', e.target.value)}
                    placeholder="e.g. Protagonist, Rival, Mentor"
                  />
                </div>

                {/* First appearance */}
                <div className="codex-field">
                  <label className="codex-field__label">First appearance</label>
                  <input
                    className="codex-field__input"
                    value={active.firstAppearance}
                    onChange={e => updateActive('firstAppearance', e.target.value)}
                    placeholder="e.g. Ch. 3 — appears at the dojo, already knows the protagonist's name"
                  />
                </div>

                {/* Relationships */}
                <div className="codex-field">
                  <label className="codex-field__label">Relationships</label>
                  <textarea
                    className="codex-field__textarea"
                    rows={3}
                    value={active.relationships}
                    onChange={e => updateActive('relationships', e.target.value)}
                    placeholder={`e.g.\nKenji: former mentor, now the enemy — he still can't hate him\nRisa: reluctant ally, doesn't know the full truth yet`}
                  />
                </div>

                {/* Current state */}
                <div className="codex-field">
                  <label className="codex-field__label">Current state</label>
                  <textarea
                    className="codex-field__textarea"
                    rows={2}
                    value={active.currentState}
                    onChange={e => updateActive('currentState', e.target.value)}
                    placeholder="Where they are in the story right now — arc, emotional state, what they're hiding"
                  />
                </div>

                {/* Character rules */}
                <div className="codex-field">
                  <label className="codex-field__label">Character rules</label>
                  <textarea
                    className="codex-field__textarea"
                    rows={2}
                    value={active.rules}
                    onChange={e => updateActive('rules', e.target.value)}
                    placeholder="Things they would never do, hard lines in their values…"
                  />
                </div>

                {/* AI write-from-character */}
                <div className="codex-ai-box">
                  <p className="codex-ai-box__label">AI writer — in-character scene assist</p>
                  <div className="codex-ai-box__prompt">
                    <input
                      className="codex-ai-box__input"
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      onKeyDown={handleAiKey}
                      placeholder={`How does ${active.name || 'this character'} react when…`}
                    />
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={handleAiGenerate}
                      disabled={aiLoading || !aiPrompt.trim()}
                    >
                      {aiLoading ? '…' : 'Write'}
                    </button>
                  </div>

                  {aiError && (
                    <div className="error-box" style={{ marginTop: 10 }}>{aiError}</div>
                  )}

                  {aiLoading && (
                    <div style={{ marginTop: 12 }}>
                      <div className="skeleton skeleton--line" />
                      <div className="skeleton skeleton--line mt-4" />
                      <div className="skeleton skeleton--line skeleton--short mt-4" />
                    </div>
                  )}

                  {aiResult && (
                    <div className="codex-ai-box__result">{aiResult}</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="codex-empty">
              <div className="codex-empty__icon">⊞</div>
              <div className="codex-empty__text">Select a character to view their entry</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}