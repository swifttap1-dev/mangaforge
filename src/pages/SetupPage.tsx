import type { StorySetup } from '../types'
import { GENRES, TONES, STORY_LENGTHS } from '../store/constants'
import { useStorySetup } from '../hooks/useStorySetup'

interface Props {
  onContinue: (setup: StorySetup) => void
}

export function SetupPage({ onContinue }: Props) {
  const { setup, updateSetup, setLength, isReady } = useStorySetup()

  return (
    <div className="setup-shell">
      <div className="setup-header">
        <div className="setup-brand">
          <div className="setup-brand__mark">MF</div>
          <span className="setup-brand__name">MangaForge</span>
        </div>
        <h1 className="setup-title">New story</h1>
        <p className="setup-subtitle">Configure your project before opening the workspace</p>
      </div>

      <div className="setup-form">
        {/* Title */}
        <div className="field">
          <label className="field__label">
            Story title <span className="field__optional">(optional)</span>
          </label>
          <input
            className="field__input"
            type="text"
            placeholder="e.g. The Last Swordbound"
            value={setup.title}
            onChange={e => updateSetup('title', e.target.value)}
          />
        </div>

        {/* Premise */}
        <div className="field">
          <label className="field__label">
            Premise <span className="field__required">*</span>
          </label>
          <textarea
            className="field__textarea"
            placeholder="What's your story about? Rough is fine — e.g. 'A disgraced samurai discovers he can absorb the abilities of anyone he defeats, but each power slowly replaces a memory of someone he loves.'"
            value={setup.premise}
            onChange={e => updateSetup('premise', e.target.value)}
            rows={4}
          />
        </div>

        {/* Protagonist */}
        <div className="field">
          <label className="field__label">Protagonist</label>
          <input
            className="field__input"
            type="text"
            placeholder="e.g. Hot-headed 17-year-old with a hidden past"
            value={setup.protagonist}
            onChange={e => updateSetup('protagonist', e.target.value)}
          />
        </div>

        {/* Genre + Tone */}
        <div className="field__row">
          <div className="field">
            <label className="field__label">Genre</label>
            <select
              className="field__select"
              value={setup.genre}
              onChange={e => updateSetup('genre', e.target.value)}
            >
              {GENRES.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field__label">Tone</label>
            <select
              className="field__select"
              value={setup.tone}
              onChange={e => updateSetup('tone', e.target.value)}
            >
              {TONES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Length grid */}
        <div className="field">
          <label className="field__label">Story length</label>
          <div className="length-grid">
            {STORY_LENGTHS.map(l => (
              <button
                key={l.id}
                className={`length-option ${setup.length === l.id ? 'length-option--active' : ''}`}
                onClick={() => setLength(l.id)}
              >
                <div className="length-option__name">{l.label}</div>
                <div className="length-option__range">{l.chapterRange} ch.</div>
                <div className="length-option__desc">{l.description}</div>
                <div className="length-option__arcs">
                  {Array.from({ length: l.arcs }).map((_, i) => (
                    <div key={i} className="length-option__arc-pip" />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn btn--primary btn--full"
          onClick={() => isReady && onContinue(setup)}
          disabled={!isReady}
          style={{ marginTop: 4 }}
        >
          Open workspace →
        </button>
      </div>
    </div>
  )
}