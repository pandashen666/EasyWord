export type Word = { id: string; book: 'cet4' | 'cet6'; word: string; phonetic: string; partOfSpeech: string; meaning: string; example: string; translation: string }

// Starter vocabulary for the prototype. Keep IDs stable when importing a full CET4/CET6 dictionary.
export const WORDS: Word[] = [
  { id: 'cet4-abandon', book: 'cet4', word: 'abandon', phonetic: '/əˈbændən/', partOfSpeech: 'v.', meaning: '放弃；抛弃', example: 'She decided to abandon the plan and try something new.', translation: '她决定放弃这个计划，尝试一些新事物。' },
  { id: 'cet4-absorb', book: 'cet4', word: 'absorb', phonetic: '/əbˈzɔːrb/', partOfSpeech: 'v.', meaning: '吸收；理解', example: 'It takes time to absorb new information.', translation: '理解新信息需要时间。' },
  { id: 'cet4-achieve', book: 'cet4', word: 'achieve', phonetic: '/əˈtʃiːv/', partOfSpeech: 'v.', meaning: '实现；达到', example: 'With patience, you can achieve your goals.', translation: '只要有耐心，你就能实现目标。' },
  { id: 'cet4-adapt', book: 'cet4', word: 'adapt', phonetic: '/əˈdæpt/', partOfSpeech: 'v.', meaning: '适应；改编', example: 'Children adapt quickly to a new environment.', translation: '孩子们能很快适应新环境。' },
  { id: 'cet4-benefit', book: 'cet4', word: 'benefit', phonetic: '/ˈbenɪfɪt/', partOfSpeech: 'n./v.', meaning: '益处；使受益', example: 'Regular reading can benefit your vocabulary.', translation: '定期阅读有助于扩大词汇量。' },
  { id: 'cet4-challenge', book: 'cet4', word: 'challenge', phonetic: '/ˈtʃælɪndʒ/', partOfSpeech: 'n./v.', meaning: '挑战；质疑', example: 'Learning a language is a rewarding challenge.', translation: '学习一门语言是一项有回报的挑战。' },
  { id: 'cet4-complex', book: 'cet4', word: 'complex', phonetic: '/kəmˈpleks/', partOfSpeech: 'adj./n.', meaning: '复杂的；综合体', example: 'The problem seems complex at first.', translation: '这个问题起初看起来很复杂。' },
  { id: 'cet4-evidence', book: 'cet4', word: 'evidence', phonetic: '/ˈevɪdəns/', partOfSpeech: 'n.', meaning: '证据；迹象', example: 'There is strong evidence to support the idea.', translation: '有充分证据支持这个观点。' },
  { id: 'cet4-focus', book: 'cet4', word: 'focus', phonetic: '/ˈfoʊkəs/', partOfSpeech: 'n./v.', meaning: '集中；焦点', example: 'Try to focus on one task at a time.', translation: '试着一次专注于一项任务。' },
  { id: 'cet4-improve', book: 'cet4', word: 'improve', phonetic: '/ɪmˈpruːv/', partOfSpeech: 'v.', meaning: '改善；提高', example: 'A little practice every day will improve your fluency.', translation: '每天练习一点会提升你的流利度。' },
  { id: 'cet6-abstract', book: 'cet6', word: 'abstract', phonetic: '/ˈæbstrækt/', partOfSpeech: 'adj./n.', meaning: '抽象的；摘要', example: 'The article begins with an abstract of the research.', translation: '文章开头是研究摘要。' },
  { id: 'cet6-advocate', book: 'cet6', word: 'advocate', phonetic: '/ˈædvəkeɪt/', partOfSpeech: 'v./n.', meaning: '提倡；拥护者', example: 'Many scientists advocate immediate action on climate change.', translation: '许多科学家提倡立即采取气候行动。' },
  { id: 'cet6-consensus', book: 'cet6', word: 'consensus', phonetic: '/kənˈsensəs/', partOfSpeech: 'n.', meaning: '共识；一致意见', example: 'The team reached a consensus after a long discussion.', translation: '经过长时间讨论，团队达成了共识。' },
  { id: 'cet6-diminish', book: 'cet6', word: 'diminish', phonetic: '/dɪˈmɪnɪʃ/', partOfSpeech: 'v.', meaning: '减少；削弱', example: 'The new evidence does not diminish her contribution.', translation: '新证据并没有削弱她的贡献。' },
  { id: 'cet6-inevitable', book: 'cet6', word: 'inevitable', phonetic: '/ɪnˈevɪtəbl/', partOfSpeech: 'adj.', meaning: '不可避免的', example: 'Some change is inevitable as a company grows.', translation: '公司发展过程中一些变化不可避免。' },
  { id: 'cet6-integrity', book: 'cet6', word: 'integrity', phonetic: '/ˈɪnˌteɡrəti/', partOfSpeech: 'n.', meaning: '正直；完整性', example: 'She is respected for her honesty and integrity.', translation: '她因诚实正直而受到尊重。' },
  { id: 'cet6-notion', book: 'cet6', word: 'notion', phonetic: '/ˈnoʊʃn/', partOfSpeech: 'n.', meaning: '观念；看法', example: 'I disagree with the notion that success comes overnight.', translation: '我不认同成功一蹴而就的观念。' },
  { id: 'cet6-substantial', book: 'cet6', word: 'substantial', phonetic: '/səbˈstænʃl/', partOfSpeech: 'adj.', meaning: '大量的；实质的', example: 'The project requires a substantial investment of time.', translation: '这个项目需要投入大量时间。' },
  { id: 'cet6-sustain', book: 'cet6', word: 'sustain', phonetic: '/səˈsteɪn/', partOfSpeech: 'v.', meaning: '维持；支撑', example: 'The local economy cannot sustain rapid growth forever.', translation: '当地经济无法永远维持高速增长。' },
  { id: 'cet6-undermine', book: 'cet6', word: 'undermine', phonetic: '/ˌʌndərˈmaɪn/', partOfSpeech: 'v.', meaning: '逐渐削弱；暗中破坏', example: 'A lack of sleep can undermine your concentration.', translation: '睡眠不足会削弱你的注意力。' },
]
