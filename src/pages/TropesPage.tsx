import { useState } from 'react'
import type { StorySetup } from '../types'
import { generateTropeDirections } from '../services/claude'

interface TropeDirection {
  id: string
  title: string
  framework: string
  beats: { label: string; content: string }[]
  escalation: string
}

interface Props {
  setup: StorySetup
}

const FRAMEWORKS = [
  { id: 'kishotenketsu', label: 'Kishōtenketsu', desc: 'Intro → Development → Twist → Conclusion — no conflict required' },
  { id: 'shonen',        label: 'Shōnen Power Arc', desc: 'Training → Reveal → Loss → Breakthrough → Victory' },
  { id: 'shojo',         label: 'Shōjo Emotional Arc', desc: 'Encounter → Tension → Misunderstanding → Resolution → Bond' },
  { id: 'seinen',        label: 'Seinen Deconstruction', desc: 'Expectation → Subversion → Moral ambiguity → Open ending' },
]

export function TropesPage({ setup }: Props) {
  const [idea, setIdea]               = useState('')
  const [framework, setFramework]     = useState('kishotenketsu')
  const [directions, setDirections]   = useState<TropeDirection[]>([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  async function handleGenerate() {
    if (!idea.trim()) return
    setLoading(true)
    setError(null)
    setDirections([])
    try {
      const results = await generateTropeDirections(setup, idea, framework)
      setDirections(results)
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
        <span className="main__header-title">Tropes & Beats</span>
        <span className="main__header-meta">Plot engine tuned to anime/manga narrative structures</span>
      </div>

      <div className="main__body">
        <div className="section-heading">
          <p className="section-heading__label">How to use</p>
          <p className="section-heading__desc">
            Enter a vague idea or a flat plot moment. Select a narrative framework.
            Get three fully-mapped story directions — each one beat-for-beat, with escalation suggestions.
          </p>
        </div>

        {/* Framework selector */}
        <div className="field" style={{ marginBottom: 16 }}>
          <label className="field__label">Narrative framework</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {FRAMEWORKS.map(f => (
              <button
                key={f.id}
                onClick={() => setFramework(f.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '9px 12px',
                  background: framework === f.id ? 'var(--surface-3)' : 'var(--surface-2)',
                  border: `1px solid ${framework === f.id ? 'var(--border-focus)' : 'var(--border-mid)'}`,
                  borderRadius: 'var(--r-md)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--font-ui)',
                  transition: 'all 0.1s',
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: framework === f.id ? 'var(--accent)' : 'var(--surface-4)',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{f.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <div className="prompt-bar">
          <textarea
            className="prompt-bar__textarea"
            placeholder={`e.g. 'A high schooler gets magic powers' or 'The protagonist's training arc feels flat'`}
            value={idea}
            onChange={e => setIdea(e.target.value)}
            onKeyDown={handleKey}
            rows={3}
          />
          <button
            className="btn btn--primary"
            onClick={handleGenerate}
            disabled={loading || !idea.trim()}
          >
            {loading ? 'Generating…' : 'Generate'}
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}

        {/* Skeleton */}
        {loading && (
          <div className="loading-cards">
            {[1, 2, 3].map(i => (
              <div key={i} className="loading-card">
                <div className="skeleton skeleton--title" />
                <div className="skeleton skeleton--line mt-8" />
                <div className="skeleton skeleton--line skeleton--short" />
                <div className="skeleton skeleton--line mt-8" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {directions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {directions.map((dir) => (
              <div key={dir.id} className="trope-card">
                <div className="trope-card__header">
                  <h3 className="trope-card__direction">{dir.title}</h3>
                  <span className="trope-card__framework">{dir.framework}</span>
                </div>

                <ul className="trope-card__beats">
                  {dir.beats.map((beat, i) => (
                    <li key={i} className="beat-item">
                      <span className="beat-item__num">{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <div className="beat-item__label">{beat.label}</div>
                        <div className="beat-item__content">{beat.content}</div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="trope-card__escalation">
                  <span className="trope-card__escalation-label">Escalation suggestion</span>
                  {dir.escalation}
                </div>
              </div>
            ))}

            <button
              className="btn btn--secondary btn--sm"
              style={{ alignSelf: 'flex-start' }}
              onClick={handleGenerate}
            >
              ↺ Regenerate
            </button>
          </div>
        )}
      </div>
    </>
  )
}