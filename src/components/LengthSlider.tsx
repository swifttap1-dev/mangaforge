import type { StoryLength, StoryLengthConfig } from '../types'
import { STORY_LENGTHS } from '../store/constants'

interface Props {
  value: StoryLength
  onChange: (length: StoryLength) => void
}

export function LengthSlider({ value, onChange }: Props) {
  const index = STORY_LENGTHS.findIndex(l => l.id === value)
  const current: StoryLengthConfig = STORY_LENGTHS[index]

  return (
    <div className="length-slider">
      <div className="length-slider__header">
        <span className="length-slider__label">Story length</span>
        <span className="length-slider__tier">{current.label}</span>
      </div>

      <input
        type="range"
        min={0}
        max={3}
        step={1}
        value={index}
        onChange={e => onChange(STORY_LENGTHS[Number(e.target.value)].id)}
        className="length-slider__input"
      />

      <div className="length-slider__ends">
        <span>Sprint</span>
        <span>Epic</span>
      </div>

      <div className="length-slider__card">
        <div className="length-slider__card-top">
          <div>
            <p className="length-slider__tier-name">{current.label}</p>
            <p className="length-slider__examples">{current.examples}</p>
          </div>
          <div className="length-slider__chapters">
            <span className="length-slider__chapter-count">{current.chapterRange}</span>
            <span className="length-slider__chapter-label">chapters</span>
          </div>
        </div>
        <p className="length-slider__desc">{current.description}</p>
        <div className="length-slider__arcs">
          {Array.from({ length: current.arcs }).map((_, i) => (
            <div key={i} className="length-slider__arc-block" />
          ))}
        </div>
      </div>
    </div>
  )
}