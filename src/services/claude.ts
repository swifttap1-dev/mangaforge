import type { StorySetup, SceneOption, StoryOutline, StoryArc } from '../types'
import type { ChapterBeat } from '../pages/ArcBuilderPage'
import { STORY_LENGTHS } from '../store/constants'

const MOCK_MODE = import.meta.env.VITE_USE_MOCK === 'true'

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL    = 'llama-3.3-70b-versatile'

async function callGroq(systemPrompt: string, userPrompt: string, maxTokens = 2500): Promise<string> {
  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
    }),
  })
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content ?? ''
  return text.replace(/```json\n?|```/g, '').trim()
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const MOCK_SCENES: SceneOption[] = [
  {
    id: 'scene_1',
    title: 'The Quiet Before',
    emotion: 'Betrayal crystallising into something cold — not rage, just the slow arrival of certainty',
    pacing: '3 scenes, 2 pages each — tight, each scene ends before it resolves',
    pageRange: '1–6',
    purpose: 'establish the relationship before breaking it — the reader needs to feel what\'s about to be lost',
    pages: [
      {
        page: 1,
        anchor: 'he already knew we were coming',
        density: 'medium (4–5)',
        beats: [
          'protagonist enters the dojo — mentor doesn\'t turn around',
          'the tea is already poured. Two cups.',
          '"I wondered when you\'d come" — before anyone speaks',
        ],
      },
      {
        page: 2,
        anchor: 'the accusation lands — and he doesn\'t deny it',
        density: 'medium (4–5)',
        beats: [
          'protagonist states what they found — flat, no emotion yet',
          'mentor is quiet for a long time',
          'he says "yes" — one word, nothing more',
        ],
      },
      {
        page: 3,
        anchor: 'the protagonist can\'t finish the sentence',
        density: 'light (2–3)',
        beats: [
          'protagonist starts to ask why — stops mid-sentence',
          'mentor finally turns around',
          'his expression isn\'t guilty. That\'s worse.',
        ],
      },
    ],
    closingNote: 'The reader doesn\'t know the mentor\'s reasoning yet — and neither does the protagonist. That gap is the story.',
    arcConnection: 'Setup phase — plant the wound without resolution. The mentor\'s calm here makes the eventual explanation hit harder.',
  },
  {
    id: 'scene_2',
    title: 'The Other Side',
    emotion: 'Controlled, private satisfaction — the feeling of a plan arriving on schedule',
    pacing: '2 scenes, 3 pages each — follows the antagonist, no protagonist present',
    pageRange: '1–6',
    purpose: 'show the antagonist\'s world moving independently — they aren\'t waiting for the protagonist',
    pages: [
      {
        page: 1,
        anchor: 'he\'s already three moves ahead and nobody in the room knows it',
        density: 'heavy (7–8)',
        beats: [
          'antagonist receives a report — reads it without reaction',
          'subordinate asks for instructions — antagonist gives them without looking up',
          'subordinate leaves. Antagonist looks up.',
          'not a smile — just a stillness. The plan is on schedule.',
        ],
      },
      {
        page: 2,
        anchor: 'the detail we almost miss — which is the most important thing on the page',
        density: 'medium (4–5)',
        beats: [
          'antagonist stands at a window — city below',
          'says something that sounds like nothing',
          'we recognise the name he mentions. The other person in the room doesn\'t know why it matters.',
        ],
      },
      {
        page: 3,
        anchor: 'he looks at something we can\'t see yet',
        density: 'light (2)',
        beats: [
          'antagonist alone, door closed',
          'expression drops — not fear, something more like tiredness',
          'he\'s looking at an object. We don\'t see what.',
        ],
      },
    ],
    closingNote: 'The reader knows something the protagonist doesn\'t. That gap is the tension for the next several chapters.',
    arcConnection: 'Plants the antagonist\'s agenda as pre-existing and already in motion — not reactive to the protagonist.',
  },
  {
    id: 'scene_3',
    title: 'The Pieces Fit',
    emotion: 'Dawning horror — the specific feeling of realising you were wrong about everything for a long time',
    pacing: '3 scenes, 1–2 pages each — fast cuts, builds to a full stop',
    pageRange: '1–5',
    purpose: 'the moment everything clicks — structured as acceleration then sudden silence',
    pages: [
      {
        page: 1,
        anchor: 'the first connection lands',
        density: 'heavy (8–9)',
        beats: [
          'protagonist finds a detail — document, object, something small',
          'cuts to a memory — quick, wordless',
          'cuts to another — faster',
          'cuts to a third — a conversation they half-remember',
          'something in the three memories doesn\'t line up with what they believed',
        ],
      },
      {
        page: '2–3',
        anchor: 'the full picture — everything reframed in one beat',
        density: 'medium (4–5)',
        beats: [
          'protagonist goes still',
          'one final memory — the one that makes it undeniable',
          'what they were told vs. what they now understand. The gap is enormous.',
          'no dialogue. Just understanding arriving.',
        ],
      },
      {
        page: 4,
        anchor: 'the mentor is still here. He waited.',
        density: 'light (2)',
        beats: [
          'protagonist looks up',
          'mentor hasn\'t left — has been in the room this whole time',
          '"You finally see it."',
        ],
      },
    ],
    closingNote: 'The mentor\'s line is a question disguised as a statement. What does he want the protagonist to see?',
    arcConnection: 'Climax-chapter scene — the confrontation the arc built toward. What follows is fallout, not escalation.',
  },
]

const MOCK_OUTLINE: StoryOutline = {
  title: 'The Last Swordbound',
  logline: 'A disgraced swordsman who absorbs the abilities of those he defeats must decide whether the power to save everyone is worth becoming the thing he hunts.',
  totalChapters: '120',
  powerSystem: 'Soulbinding — each defeated opponent leaves a fragment of their skill and a fragment of their memory. Too many bindings and the user loses their own identity.',
  worldNotes: 'A post-collapse empire where the old order of Swordbound warriors was outlawed after one of them destroyed a city.',
  arcs: [
    {
      number: 1, name: 'The Disgraced Blade', chapterRange: 'Ch. 1–22',
      summary: 'We meet our protagonist scraping by as a bounty hunter, hiding what he is. A job goes wrong and forces him to use his ability publicly for the first time in years.',
      keyMoments: [
        'First use of Soulbinding in 5 years — costs him his anonymity',
        'Meeting the first rival who recognises what he is and doesn\'t report him',
        'Discovery that someone is manufacturing fake Swordbound incidents',
      ],
      endingHook: 'The person framing the Swordbound is revealed to be his former mentor.',
    },
    {
      number: 2, name: 'Wanted', chapterRange: 'Ch. 23–55',
      summary: 'On the run with a growing bounty, investigating the conspiracy while the empire tightens its net.',
      keyMoments: [
        'First time absorbing an ally\'s skill — they offer it willingly',
        'The empire\'s elite hunter is introduced',
        'A city is destroyed, blamed on him',
      ],
      endingHook: 'He defeats the hunter and could absorb her. He doesn\'t. She starts to doubt her mission.',
    },
    {
      number: 3, name: 'The Old Order', chapterRange: 'Ch. 56–90',
      summary: 'Protagonist discovers other surviving Swordbound — some are exactly the monsters the empire claims they are.',
      keyMoments: [
        'Meeting a Swordbound who has absorbed too many — barely human',
        'The mentor\'s true goal revealed',
        'Protagonist absorbs a dying Swordbound\'s final memory',
      ],
      endingHook: 'The mentor activates a weapon that only a Swordbound can stop.',
    },
    {
      number: 4, name: 'What Remains', chapterRange: 'Ch. 91–120',
      summary: 'The final confrontation — not just against the mentor, but against what the protagonist has become.',
      keyMoments: [
        'He absorbs the mentor\'s ability — understands him completely, still has to stop him',
        'The moment he almost loses himself — saved by a memory',
        'Final choice: fully absorb the weapon\'s power or find another way',
      ],
      endingHook: 'He survives — but wakes up not remembering his own name. The last panel: the hunter tells it to him.',
    },
  ],
}

const MOCK_CHAPTERS: ChapterBeat[] = [
  { chapter: 'Ch. 1', role: 'Setup', title: 'The Nameless Job', summary: 'We open on the protagonist mid-job — tracking a criminal through a rain-soaked city. Everything about how he works tells us he\'s hiding: gloves, hood, careful not to use his full ability. The job pays poorly. He takes it anyway.', endNote: 'Establishes the hiding and the poverty. Sets up why a dangerous job offer later is hard to refuse.' },
  { chapter: 'Ch. 2', role: 'Setup', title: 'The Shape of a Scar', summary: 'A quiet chapter. We see the protagonist\'s living situation — small, functional, no attachments. A flashback fragment (not explained yet) shows a training ground burning. He doesn\'t sleep well.', endNote: 'Seeds the backstory without revealing it. The reader knows something happened.' },
  { chapter: 'Ch. 3', role: 'Escalation', title: 'The Job He Should Have Refused', summary: 'A client approaches with a contract that pays three months\' rent for one night\'s work. The target is described as dangerous. The protagonist takes it. The target turns out to be another Swordbound — one who recognises him immediately.', endNote: 'First Swordbound-vs-Swordbound encounter. Sets up that the protagonist is known in circles he thought he\'d left.' },
  { chapter: 'Ch. 4', role: 'Escalation', title: 'What the Binding Costs', summary: 'The fight. The protagonist wins but only by using Soulbinding — and someone sees. He absorbs the other Swordbound\'s ability but also gets a flash of their memories: the framing conspiracy, a name, a symbol.', endNote: 'The ability is now public. The conspiracy becomes personal — he has information he didn\'t want.' },
  { chapter: 'Ch. 5', role: 'Escalation', title: 'Burned Cover', summary: 'By morning his name is on a wanted board. The client disappears. The one witness to the fight is a young woman who offers him a deal instead of turning him in.', endNote: 'The rival/ally dynamic begins. She knows more than she\'s saying.' },
  { chapter: 'Ch. 6', role: 'Escalation', title: 'The Third Name', summary: 'Following the memory fragment, the protagonist investigates the symbol he absorbed. It leads to a location — and evidence that three other "Swordbound incidents" were staged using corpses.', endNote: 'The conspiracy scope expands. Someone is building a case for a purge.' },
  { chapter: 'Ch. 7–9', role: 'Escalation', title: 'On the Run', summary: 'A chase arc. The empire\'s regular forces are on him. He and the woman (reluctant alliance) move from safehouse to safehouse. We learn her name and partial backstory. He doesn\'t share his.', endNote: 'Relationship dynamic established: she talks, he doesn\'t. She finds this infuriating.' },
  { chapter: 'Ch. 10', role: 'Escalation', title: 'The First Binding That Matters', summary: 'A fight he almost loses. He has to Bind someone in front of her. She sees what it actually does — not power theft, but memory theft. She goes quiet. He waits for her to leave. She doesn\'t.', endNote: 'The ability\'s true cost is now known to an ally. Changes the dynamic going forward.' },
  { chapter: 'Ch. 11–14', role: 'Escalation', title: 'The Conspiracy Takes Shape', summary: 'Investigation chapters. They trace the staged incidents to a government faction. A name emerges that the protagonist recognises — someone from his past. He shuts down. She pushes. He tells her almost nothing.', endNote: 'The mentor connection is now imminent. The protagonist\'s shutdown signals the reader something personal is coming.' },
  { chapter: 'Ch. 15–18', role: 'Escalation', title: 'The Mentor\'s Shadow', summary: 'They track the conspiracy to a location and find evidence that implicates someone the protagonist clearly knows. He reads the documents. We see his face, not the documents. Then he burns them.', endNote: 'The reader knows what he knows now. The burning is the point of no return — he\'s chosen not to pretend he doesn\'t know.' },
  { chapter: 'Ch. 19–21', role: 'Climax', title: 'The Confrontation He Came For', summary: 'He goes alone to find the mentor. She follows, too late to stop him. The meeting is quiet — no immediate fight. The mentor knew he was coming. There\'s tea on the table. The conversation we\'ve been building toward.', endNote: 'This is the emotional climax of the arc. The mentor neither confirms nor denies at first. Then he does. And explains nothing.' },
  { chapter: 'Ch. 22', role: 'Fallout', title: 'What He Does With Knowing', summary: 'Aftermath. The protagonist doesn\'t chase the mentor — not yet. He sits in the empty meeting place for a long time. She finds him. Neither speaks for a while. The arc ends not with action but with him standing up, and them walking in the same direction.', endNote: 'Sets the tone for Arc 2: they are now actively moving toward something rather than running from it. The mentor is the direction.' },
]

const MOCK_TROPES = [
  {
    id: 'trope_1', title: 'The Hidden Prodigy Awakens', framework: 'Kishōtenketsu',
    beats: [
      { label: 'Ki — Introduction', content: 'Ordinary student Hayato is mocked for being talentless in a world where everyone has ranked abilities.' },
      { label: 'Shō — Development', content: 'A dangerous situation forces Hayato to act. His power activates — but he can\'t control it, and the cost is immediate.' },
      { label: 'Ten — Twist', content: 'His power isn\'t weak — it\'s been suppressed by a seal placed on him as a child, for reasons nobody will explain.' },
      { label: 'Ketsu — Conclusion', content: 'Hayato doesn\'t just gain power. He gains a question that will drive the whole story: who sealed him, and why?' },
    ],
    escalation: 'Don\'t reveal the full power immediately. Each arc should unseal one more layer, with a cost each time. True mastery should feel earned and dangerous.',
  },
]

const MOCK_CHARACTER_SCENE =
  `Kenji doesn't answer immediately. That's the first sign.\n\nWhen he finally speaks, it's quieter than usual. Not soft. Controlled.\n\n"You're going to ask me not to do it."\n\nHe's not looking at you. He's looking at the window, at the grey light coming through it. His hand is very still on the table.\n\n"And I'm going to tell you I've already decided."\n\nIt isn't cruelty. That's what makes it harder. There's something almost apologetic in the way he says it — like he understands exactly what this costs you, and he's paying that cost deliberately, and he's sorry for it, and he's going to do it anyway.\n\n"So let's not waste time on the part where you try to talk me out of it."`

// ── Public API ─────────────────────────────────────────────────────────────────

export async function generateScenes(
  setup: StorySetup,
  sceneDescription: string,
  arc?: StoryArc,
  chapter?: ChapterBeat,
  pageBudget: number = 19,
  pace: 'very fast' | 'fast' | 'balanced' | 'slow' | 'very slow' = 'balanced',
): Promise<SceneOption[]> {
  if (MOCK_MODE) {
    await new Promise(r => setTimeout(r, 1600))
    return MOCK_SCENES
  }

  const lengthConfig = STORY_LENGTHS.find(l => l.id === setup.length)!

  const arcBlock = arc ? `\nARC CONTEXT:\n- Arc name: ${arc.name} (${arc.chapterRange})\n- Arc summary: ${arc.summary}\n- Key moments in this arc: ${arc.keyMoments.join(' / ')}\n- Arc ending hook: ${arc.endingHook}` : ''

  const chapterBlock = chapter ? `\nCHAPTER CONTEXT:\n- Chapter: ${chapter.chapter} — "${chapter.title}"\n- Role in arc: ${chapter.role}\n- What happens: ${chapter.summary}\n- What it sets up: ${chapter.endNote}\nThe scene must fit this chapter's role (${chapter.role}) and serve what it needs to accomplish.` : ''

  // Mathematical pacing: derive hard scene count and per-scene page ranges from budget
  type PaceConfig = { scenesMin: number; scenesMax: number; maxPagesPerScene: number; densityBias: string }
const paceConfig: Record<string, PaceConfig> = {
  'very fast': {
    scenesMin: 3,
    scenesMax: Math.min(5, Math.floor(pageBudget / 3)),
    maxPagesPerScene: 3,
    densityBias: 'heavy (7–9 panels) — compress multiple beats per page'
  },
  'fast': {
    scenesMin: 3,
    scenesMax: Math.min(6, Math.floor(pageBudget / 3)),
    maxPagesPerScene: 5,
    densityBias: 'medium-heavy (5–7 panels) — each page covers 2–3 beats'
  },
  'balanced': {
    scenesMin: Math.max(2, Math.floor(pageBudget / 7)),
    scenesMax: Math.min(7, Math.floor(pageBudget / 4)),
    maxPagesPerScene: 8,
    densityBias: 'mixed — dense for action/dialogue, light for emotional peaks'
  },
  'slow': {
    scenesMin: Math.max(1, Math.floor(pageBudget / 10)),
    scenesMax: Math.min(5, Math.floor(pageBudget / 5)),
    maxPagesPerScene: 12,
    densityBias: 'light-medium (2–5 panels) — pages breathe, moments linger'
  },
  'very slow': {
    scenesMin: 1,
    scenesMax: Math.min(3, Math.max(2, Math.floor(pageBudget / 8))),
    maxPagesPerScene: pageBudget,
    densityBias: 'very light (1–3 panels) — silence and space carry the weight'
  }
}

  const pc = paceConfig[pace]
  const scenesMin = pc.scenesMin
  const scenesMax = pc.scenesMax
  const maxPPS    = pc.maxPagesPerScene

  const system = `You are a manga series writer who thinks like a visual storyteller. You understand that a manga page is a unit of emphasis and rhythm, not a unit of plot. A single page can contain an entire conversation, a quick action sequence, several reaction beats, or almost nothing at all — depending on what the story needs to emphasize. You write scene outlines that reflect how manga actually works: pages have internal structure, panel density varies by emotional weight, and the question every page answers is "what does this page end on?" — not "what single thing happens here." Respond ONLY with a valid JSON array. No preamble, no markdown fences.`

  const user = `Generate 3 distinct scene outline options for the moment described below.\n\nSTORY — use ONLY what is written here. Do not invent characters, factions, names, or lore that aren't in this setup:\n- Title: ${setup.title || 'Untitled'}\n- Genre: ${setup.genre}\n- Tone: ${setup.tone}\n- Premise: ${setup.premise}\n- Protagonist: ${setup.protagonist}\n- Length: ${lengthConfig.label} (${lengthConfig.chapterRange} chapters)${arcBlock}${chapterBlock}\n\nCHAPTER TO DEVELOP: "${sceneDescription}"\n\nMATHEMATICAL PACING CONSTRAINTS — these are calculated hard limits, not suggestions:\n- Total page budget: ${pageBudget} pages across all scenes in this option\n- Scene count: ${scenesMin}–${scenesMax} scenes per option (derived from budget ÷ pace)\n- Max pages per scene: ${maxPPS} pages (any scene longer than this is too slow for "${pace}" pacing)\n- Panel density bias: ${pc.densityBias}\n- Budget check: before finalising, sum the pages across all scenes. If the total exceeds ${pageBudget}, cut pages. This is non-negotiable.\n\nHOW MANGA PAGES ACTUALLY WORK — read this before writing anything:\nA manga page is NOT "one thing happens." A manga page is a mini-arc with an anchor moment it builds toward.\n\nEach page has:\n1. An ANCHOR — the dominant moment the page emphasises or ends on. This is what the reader's eye goes to. It could be a reveal, a reaction, a line of dialogue, a silence, a visual that lands hard. One per page.\n2. A DENSITY — how many panels: light (1–3), medium (4–6), heavy (7–9). Dense pages compress many beats. Light pages give one moment room to breathe.\n3. BEATS — the 2–6 things that happen on this page, building toward the anchor. These are specific story events, not descriptions.\n\nExamples of correct page thinking:\nPage with anchor "the detective realises the message was sent from inside the building":\n- beats: phone buzzes / reads message / looks up / cuts to building exterior / realization hits\n- density: heavy (6 panels)\n- NOT: "P1: detective receives message. P2: detective reacts."\n\nPage with anchor "she already knew":\n- beats: he finishes explaining / she doesn't react / long pause / she says she knew two days ago\n- density: light (3 panels — the silence is the point)\n- NOT: "P7: character reveals information"\n\nA bystander noticing something does NOT get its own page. That's 1 panel inside a page about something else.\nA character "looking concerned" is NOT a beat — it's a reaction that belongs inside another beat.\nA single emotion or reaction almost never justifies a full page unless it's a major reveal moment.\n\nWHAT DESERVES A FULL-PAGE ANCHOR:\n- A major reveal that recontextualises what came before\n- A confrontation moment where power shifts\n- A confession, betrayal, or death\n- A visual that carries more weight than words can\n- A silence that's harder than anything said\n- A cliffhanger page-turn moment\n\nWHAT DOES NOT DESERVE A FULL PAGE:\n- A character receiving information and reacting\n- A character moving from one place to another\n- A bystander observing\n- Atmospheric mood-setting without story content\n- Any single reaction shot\n\nSTORYTELLING RULES — Non-negotiable:\n1. Use only the story setup above. No invented factions, backstory, or names beyond what's given.\n2. One of the 3 options must primarily follow a character other than the protagonist — the antagonist, a secondary character, or a perspective the MC doesn't have access to.\n3. Each option must be structurally different — different shape, not just different tone. Different scene count, different emphasis, different entry point into the moment.\n4. Characters don't explain themselves. Motivations show through action and choice, not internal monologue or stated reflection.\n5. End each scene on an open question, not a resolved beat. Page-turn hooks matter.\n\nReturn a JSON array of exactly 3 objects:\n[{
  "id": "scene_1",
  "title": "short evocative title",
  "emotion": "the specific texture of this scene — what it actually feels like, not a single word",
  "pacing": "X scenes, Y–Z pages each — and why this distribution fits the content",
  "pageRange": "e.g. '1–5'",
  "purpose": "one sentence — what this scene accomplishes that couldn't be cut",
  "pages": [{
    "page": 1,
    "anchor": "the dominant moment this page builds to or ends on",
    "density": "light (1–3) | medium (4–6) | heavy (7–9)",
    "beats": ["beat 1", "beat 2", "beat 3"]
  }],
  "closingNote": "what the reader carries out — one editorial line",
  "arcConnection": "what this plants or pays off in the larger arc — specific to this story"
}]\n\nEvery page in the pageRange must have an entry. Beats should be specific story events (what happens, what is revealed, what changes) — not descriptions of how characters look or feel.`

  const raw = await callGroq(system, user, 6000)
  console.log('Outline raw response:', raw.slice(0, 500)) // add this line
  try {
    return JSON.parse(raw) as SceneOption[]
  } catch {
    // If JSON is still truncated, attempt to recover by closing the array
    const recovered = raw.trimEnd().replace(/,?\s*$/, '') + ']'
    try {
      return JSON.parse(recovered) as SceneOption[]
    } catch {
      throw new Error('Response was too long and got cut off. Try reducing the page budget or switching to a slower pacing setting.')
    }
  }
}

export async function generateStoryOutline(setup: StorySetup): Promise<StoryOutline> {
  if (MOCK_MODE) {
    await new Promise(r => setTimeout(r, 1800))
    return MOCK_OUTLINE
  }

  const lengthConfig = STORY_LENGTHS.find(l => l.id === setup.length)!

  const system = `You are a professional manga story architect. Respond ONLY with valid JSON. No preamble, no markdown.`

  const user = `Generate a complete manga story outline as valid JSON only. No preamble, no markdown fences.

STORY SETUP:
- Title: ${setup.title || 'Untitled'}
- Genre: ${setup.genre}
- Tone: ${setup.tone}
- Premise: ${setup.premise}
- Protagonist: ${setup.protagonist}

Generate exactly ${lengthConfig.arcs} arcs covering the full story from beginning to end. Each arc should feel distinct and escalate meaningfully.

Return this exact JSON structure:
{
  "title": "${setup.title || 'Untitled'}",
  "logline": "one compelling sentence — the core dramatic premise",
  "totalChapters": "${lengthConfig.chapterRange.split('–')[1] ?? '100'}",
  "powerSystem": "if the genre/premise implies one, describe it in 1–2 sentences. Otherwise omit this field.",
  "worldNotes": "1–2 sentences of world-building context if relevant. Otherwise omit.",
  "arcs": [
    {
      "number": 1,
      "name": "evocative arc name",
      "chapterRange": "Ch. 1–N",
      "summary": "2–3 sentences — what happens in this arc, who changes, what's at stake",
      "keyMoments": [
        "specific plot beat that must occur",
        "specific reveal or turning point",
        "specific character moment"
      ],
      "endingHook": "the cliffhanger or revelation that closes this arc and pulls into the next"
    }
  ]
}

Rules:
- Chapter ranges must be contiguous and cover 1 through ${lengthConfig.chapterRange.split('–')[1] ?? '100'} total
- Each arc needs a specific INCITING EVENT (what kicks it off), a specific MIDPOINT TURN (what changes halfway), and a specific ENDING STATE (where characters end up — not just "things escalate")
- keyMoments must be scenes you could storyboard: who is present, what happens, what is revealed or decided. "Things intensify" is not a keyMoment. "Character A discovers Character B has been lying about X, while Character C watches from the doorway" is.
- Summaries must name specific actions taken by specific characters — no genre placeholders like "stakes grow higher", "our hero faces challenges", "the truth is revealed"
- Every named character must want something concrete and visible. Those wants must be in tension with each other — that tension is what the arc is about.
- Each arc must end in a different emotional register than it started — a shift in who has power, what is known, or what is possible
- The final arc must resolve the core premise established in the logline`


  const attemptParse = (txt: string) => {
    try {
      return JSON.parse(txt) as StoryOutline
    } catch {
      return null
    }
  }

const tryRecoverParse = (raw: string): StoryOutline | null => {
  const isValid = (obj: any): obj is StoryOutline =>
    obj &&
    Array.isArray(obj.arcs) &&
    obj.arcs.length >= lengthConfig.arcs &&
    obj.arcs.every((a: any) =>
      a.summary && a.summary.length > 20 &&        // not a placeholder
      Array.isArray(a.keyMoments) && a.keyMoments.length > 0 &&
      a.keyMoments[0].length > 10                  // not "Plot"
    )

  let parsed = attemptParse(raw)
  if (parsed && isValid(parsed)) return parsed

  const cleaned = raw.replace(/```json\n?|```/g, '').trim()
  parsed = attemptParse(cleaned)
  if (parsed && isValid(parsed)) return parsed

  const first = cleaned.indexOf('{')
  if (first === -1) return null

  for (let i = cleaned.length - 1; i > first; i--) {
    if (cleaned[i] === '}') {
      const candidate = cleaned.slice(first, i + 1)
      parsed = attemptParse(candidate)
      if (parsed && isValid(parsed)) return parsed
    }
  }

  return null
}

  const raw = await callGroq(system, user, 6000)
  let parsed = tryRecoverParse(raw)
  if (parsed) return parsed

  // Second attempt: ultra-minimal fallback with explicit truncation handling
  try {
    const arcChaptersPerArc = Math.floor(parseInt(lengthConfig.chapterRange.split('–')[1] ?? '100') / lengthConfig.arcs)
    const fallbackUser = `Output ONLY valid JSON, no explanations. ${lengthConfig.arcs} arcs, each arc ~${arcChaptersPerArc} chapters:
{
  "title": "${setup.title || 'Untitled'}",
  "logline": "${setup.premise}",
  "totalChapters": "${lengthConfig.chapterRange.split('–')[1] ?? '100'}",
  "arcs": [${Array.from({length: lengthConfig.arcs}, (_, i) => {
    const startCh = i * arcChaptersPerArc + 1
    const endCh = (i + 1) * arcChaptersPerArc
    return `{"number":${i+1},"name":"Arc ${i+1}","chapterRange":"Ch. ${startCh}–${endCh}","summary":"Arc plot.","keyMoments":["Plot"],"endingHook":"Cliffhanger"}`
  }).join(',')}]
}`
    const fallbackRaw = await callGroq(system, fallbackUser, 3000)
    parsed = tryRecoverParse(fallbackRaw)
    if (parsed) return parsed
  } catch {
    // ignore
  }

  throw new Error('Outline was too long to generate in one pass. Try a shorter story length.')
}

export async function generateArcChapters(
  setup: StorySetup,
  outline: StoryOutline,
  arc: StoryArc,
  prevArc: StoryArc | null,
  nextArc: StoryArc | null,
): Promise<ChapterBeat[]> {
  if (MOCK_MODE) {
    await new Promise(r => setTimeout(r, 2000))
    return MOCK_CHAPTERS
  }

  // Parse chapter range to give the AI a real chapter count to reason with
  const rangeMatch = arc.chapterRange.match(/(\d+)[–\-](\d+)/)
  const chapterCount = rangeMatch
    ? parseInt(rangeMatch[2]) - parseInt(rangeMatch[1]) + 1
    : null
  const isLastArc = !nextArc

  const system = `You are a professional manga series editor specialising in chapter-level story structure. You think about how real manga series are paced: a chapter is roughly 18–20 pages, so every chapter you add costs the reader real reading time. You never pad. You group chapters that share the same beat. You end arcs cleanly without lingering. Respond ONLY with a valid JSON array. No preamble, no markdown.`

  const user = `Break this arc into chapter-by-beat groups.\n\nFULL STORY:\n- Title: ${outline.title}\n- Logline: ${outline.logline}\n- Genre: ${setup.genre} · Tone: ${setup.tone}\n- Premise: ${setup.premise}\n- Protagonist: ${setup.protagonist}\n${outline.powerSystem ? `- Power system: ${outline.powerSystem}` : ''}\n${outline.worldNotes ? `- World: ${outline.worldNotes}` : ''}\n\nALL ARCS (for continuity):\n${outline.arcs.map(a => `Arc ${a.number}: ${a.name} (${a.chapterRange}) — ${a.summary}`).join('\n')}\n\nTHIS ARC:\n- Arc ${arc.number}: ${arc.name}\n- Chapter range: ${arc.chapterRange}${chapterCount ? ` (${chapterCount} chapters)` : ''}\n- Summary: ${arc.summary}\n- Key moments that MUST appear: ${arc.keyMoments.join(' / ')}\n- Arc ending hook: ${arc.endingHook}\n${isLastArc ? '- This is the FINAL arc of the series.' : ''}\n\n${prevArc ? `Previous arc ends with: ${prevArc.endingHook}` : 'This is the first arc.'}\n${nextArc ? `Next arc begins: ${nextArc.summary.split('.')[0]}` : ''}\n\nPACING RULES — these are hard constraints:\n1. Each chapter is ~18–20 manga pages. Every chapter you add is real reading time. Do not pad.\n2. Grouping rules:\n   - Group chapters only when they share the exact same beat and nothing meaningfully changes between them (e.g. a chase that runs 3 chapters with no turning point).\n   - A single grouped entry must never span more than 4 chapters (e.g. "Ch. 7–10" is the maximum). If a beat takes 5+ chapters, it contains multiple distinct moments — split it.\n   - Escalation must be broken into separate entries, each representing a distinct turning point, reversal, or reveal. "Things intensify" is not a beat — find what actually changes on each beat: who gains the upper hand, what gets revealed, what the protagonist loses or learns. Each Escalation entry should feel like a different gear in the story.\n3. Role distribution — hard limits:\n   - Setup: 2–4 chapters\n   - Escalation: broken into 3–6 distinct beat entries, each 2–4 chapters max\n   - Climax: 1–3 chapters (the peak, not an extended battle arc)\n   - Fallout: 2–3 chapters MAXIMUM — immediate aftermath only\n   - Transition: 0–2 chapters only if genuinely bridging to a next arc\n4. After the Climax, the story is winding down — hard limits:\n   - Fallout: 2–3 chapters MAXIMUM. This is the immediate aftermath only. Not a new act.\n   - Transition: 1–2 chapters ONLY if a next arc exists and needs a bridge. Otherwise zero.\n   - ${isLastArc
       ? 'This is the FINAL ARC. After the climax resolves, the series ends. Maximum 3 chapters total after the climax — epilogue, closure, done. Think JJK: Sukuna dies at 268, manga ends at 271. That ratio. Do not write a second story after the main conflict resolves.'
       : 'Once the arc ending hook is delivered, stop. The next arc\'s Setup will handle the transition.'}\n5. The chapter range ${arc.chapterRange} describes where this arc sits in the series timeline. It is NOT a quota of chapters to fill. Use as many chapters as the story needs — which for post-climax material means very few.\n\nReturn a JSON array — as few entries as the story actually needs:\n[{\n  "chapter": "Ch. N" or "Ch. N–M" for grouped chapters,\n  "title": "chapter title",\n  "role": "Setup|Escalation|Climax|Fallout|Transition",\n  "summary": "specific 2–3 sentences — what actually happens, not vague",\n  "endNote": "1 sentence — what this sets up or closes off"\n}]`

  const raw = await callGroq(system, user, 4000)
  try {
    return JSON.parse(raw) as ChapterBeat[]
  } catch {
    // Attempt recovery on truncated array
    const recovered = raw.trimEnd().replace(/,?\s*$/, '') + ']'
    try {
      return JSON.parse(recovered) as ChapterBeat[]
    } catch {
      throw new Error('Chapter breakdown was cut off. Try regenerating — if it keeps failing, the arc range may be too large.')
    }
  }
}

export async function regenerateSingleChapter(
  _setup: StorySetup,
  _outline: StoryOutline,
  arc: StoryArc,
  chapter: ChapterBeat,
  prevChapter: ChapterBeat | null,
  nextChapter: ChapterBeat | null,
  instruction?: string,
): Promise<ChapterBeat> {
  if (MOCK_MODE) {
    await new Promise(r => setTimeout(r, 900))
    return { ...chapter, title: chapter.title + ' (regenerated)', summary: chapter.summary + ' [New take: the scene is reframed from the perspective of a secondary character who witnesses the event without understanding its full significance.]' }
  }

  const system = `You are a manga series editor. Regenerate a single chapter beat with a fresh angle, keeping it consistent with its neighbours and the arc's pacing. Each chapter is ~18–20 manga pages — don't invent scope that doesn't fit. Respond ONLY with a valid JSON object. No preamble, no markdown.`

  const instructionBlock = instruction
    ? `\nSPECIFIC INSTRUCTION FOR THIS REGENERATION: "${instruction}"\nApply this instruction while keeping the chapter's role and position in the arc.`
    : ''

  const user = `Regenerate this chapter beat${instruction ? ' following the specific instruction below' : ' with a fresh angle'}. Keep the same role and position in the arc.${instruction ? '' : ' Find a different approach — not a different role, not a bigger scope, just a more interesting version of the same beat.'}\n${instructionBlock}\n\nARC: ${arc.name} (${arc.chapterRange})\nArc summary: ${arc.summary}\nKey moments: ${arc.keyMoments.join(' / ')}\n\n${prevChapter ? `PREVIOUS: ${prevChapter.chapter} "${prevChapter.title}" [${prevChapter.role}] — ${prevChapter.summary}` : 'This is the first chapter of the arc.'}\n\nCHAPTER TO REGENERATE:\n- ${chapter.chapter}: "${chapter.title}" [${chapter.role}]\n- Current: ${chapter.summary}\n- Currently sets up: ${chapter.endNote}\n\n${nextChapter ? `NEXT: ${nextChapter.chapter} "${nextChapter.title}" [${nextChapter.role}] — ${nextChapter.summary}` : 'This is the last chapter of the arc.'}\n\nThe role is ${chapter.role} — stay within that scope. ${
  chapter.role === 'Fallout' || chapter.role === 'Transition'
    ? 'This is a wind-down beat. Do not introduce new major complications or expand the story.'
    : chapter.role === 'Climax'
    ? 'This is the peak moment. Keep it focused — no scope creep.'
    : ''
}\n\nReturn a single JSON object:\n{\n  "chapter": "${chapter.chapter}",\n  "title": "new chapter title",\n  "role": "${chapter.role}",\n  "summary": "new 2–3 sentence summary",\n  "endNote": "what this version sets up or closes off"\n}`

  const raw = await callGroq(system, user, 1200)
  try {
    return JSON.parse(raw) as ChapterBeat
  } catch {
    throw new Error('Chapter regeneration failed. Try again.')
  }
}

export async function generateTropeDirections(
  setup: StorySetup,
  idea: string,
  framework: string,
): Promise<any[]> {
  if (MOCK_MODE) {
    await new Promise(r => setTimeout(r, 1600))
    return MOCK_TROPES
  }

  const frameworkDescriptions: Record<string, string> = {
    kishotenketsu: 'Kishōtenketsu: Ki (Introduction), Shō (Development), Ten (Twist — a non-conflict turn that recontextualises everything), Ketsu (Conclusion)',
    shonen: 'Shōnen Power Arc: Training, Reveal (power/enemy), Loss, Breakthrough (mental or emotional shift), Victory (costly or incomplete)',
    shojo: 'Shōjo Emotional Arc: Encounter, Tension, Misunderstanding (the dark moment), Resolution (vulnerability required), Bond',
    seinen: 'Seinen Deconstruction: Expectation (genre trope set up), Subversion, Moral ambiguity, Open ending',
  }

  const system = `You are a manga narrative architect specialising in anime and manga storytelling frameworks. Respond ONLY with a valid JSON array. No preamble, no markdown.`

  const user = `Generate 3 distinct story directions using the specified framework.\n\nSTORY: Genre: ${setup.genre} · Tone: ${setup.tone}\nPremise: ${setup.premise} · Protagonist: ${setup.protagonist}\n\nIDEA: "${idea}"\nFRAMEWORK: ${frameworkDescriptions[framework] ?? framework}\n\nReturn a JSON array of exactly 3 objects:\n[{\n  "id": "trope_1",\n  "title": "short punchy direction title",\n  "framework": "framework label",\n  "beats": [{ "label": "beat name", "content": "2–3 specific sentences" }],\n  "escalation": "1–2 sentences on long-term escalation"\n}]`

  const raw = await callGroq(system, user)
  return JSON.parse(raw)
}

export async function generateCharacterScene(
  setup: StorySetup,
  character: { name: string; role: string; firstAppearance: string; relationships?: string; currentState?: string; rules: string },
  prompt: string,
): Promise<string> {
  if (MOCK_MODE) {
    await new Promise(r => setTimeout(r, 1200))
    return MOCK_CHARACTER_SCENE
  }

  const system = `You are a manga script writer. Write character-consistent scene prose in a literary manga style: short paragraphs, precise, emotionally loaded. Plain text only — no JSON, no markdown.`

  const relationshipsBlock = character.relationships?.trim()
    ? `\nRelationships:\n${character.relationships}`
    : ''

  const currentStateBlock = character.currentState?.trim()
    ? `\nCurrent state in the story: ${character.currentState}`
    : ''

  const firstAppearanceBlock = character.firstAppearance?.trim()
    ? `\nFirst appearance: ${character.firstAppearance}`
    : ''

  const user = `Write a short scene beat (150–250 words) strictly consistent with this character:\n\nCHARACTER: ${character.name} · Role: ${character.role}${firstAppearanceBlock}\nCharacter rules: ${character.rules}${relationshipsBlock}${currentStateBlock}\n\nSTORY: ${setup.premise}\nSCENE PROMPT: ${prompt}\n\nStay true to this character's voice and their current situation. If the scene involves another character listed in their relationships, reflect that dynamic. Do not invent traits or history that contradict the sheet.`

  return await callGroq(system, user, 600)
}
