/**
 * Encouragement messages for submap pages (text box on each submap).
 */

import type { TopicKey } from './canonicalSessions';
import { CANONICAL_SESSIONS } from './canonicalSessions';

const GENERIC: string[] = [
  "You're doing great! Keep going!",
  "You've got this!",
  "Keep it up! You're learning pretty quick!",
  "So proud of you!",
  "You're on a roll!",
];

const BY_TOPIC: Record<TopicKey, string[]> = {
  water: [
    "Splash Springs is all about staying refreshed!",
    "Every sip counts here at Splash Springs!",
  ],
  phytonutrients: [
    "Rainbow Garden loves colorful foods!",
    "Eating the rainbow keeps you strong.",
  ],
  protein: [
    "Protein Peaks help your muscles grow strong!",
    "You're building strength at Protein Peaks!",
  ],
  carbohydrates: [
    "Carbs give you energy to play and learn!",
    "Fuel up and keep exploring!",
  ],
  fats: [
    "Healthy Fats help your brain and body!",
    "Good fats are friends!",
  ],
  'balanced-nutrition': [
    "Plate Plaza is where it all comes together!",
    "A little of everything makes a happy plate!",
  ],
  'reading-labels': [
    "Aisle Adventures help you read labels like a pro!",
    "Knowing what's in your food is a superpower!",
  ],
  'fiber-prebiotics-probiotics': [
    "Microbe Mines help your tummy feel good!",
    "Happy tummy, happy you!",
  ],
  'recap-habits': [
    "Habit Haven is where daily wins live!",
    "Small habits add up to big wins!",
  ],
};

import type { RizzlerId } from './canonicalSessions';

const RIZZLER_DISPLAY_NAME: Record<RizzlerId, string> = {
  hydro: 'Hydro Rizzler',
  phyto: 'Phyto Rizzler',
  pro: 'Pro Rizzler',
  health: 'Health Rizzler',
};

export function getRizzlerName(topicKey: TopicKey | string): string {
  const session = CANONICAL_SESSIONS.find((s) => s.topicKey === topicKey);
  return session ? RIZZLER_DISPLAY_NAME[session.rizzler] : 'Health Rizzler';
}

export interface RizzlerMascot {
  name: string;
  imagePath: string;
}

export function getRizzlerMascot(topicKey: TopicKey | string): RizzlerMascot {
  const session = CANONICAL_SESSIONS.find((s) => s.topicKey === topicKey);
  if (!session) return { name: 'Health Rizzler', imagePath: '/brand/mascots/health-rizzler.png' };
  return {
    name: RIZZLER_DISPLAY_NAME[session.rizzler],
    imagePath: session.rizzlerImage,
  };
}

const WELCOME_MESSAGES: Record<TopicKey, string> = {
  water: "Welcome to Splash Springs! Let's dive into hydration!",
  phytonutrients: "Welcome to Rainbow Garden! Time to eat the rainbow!",
  protein: "Welcome to Protein Peaks! Let's build some strength!",
  carbohydrates: "Welcome to Energy Express! Let's fuel up!",
  fats: "Welcome to Good Fats Grove! Your brain will thank you!",
  'balanced-nutrition': "Welcome to Plate Plaza! Let's balance it all out!",
  'reading-labels': "Welcome to Aisle Adventures! Let's decode some labels!",
  'fiber-prebiotics-probiotics': "Welcome to Microbe Mines! Your tummy's gonna love this!",
  'recap-habits': "Welcome to Habit Haven! Small wins, big results!",
};

export function getWelcomeMessage(topicKey: TopicKey | string): string {
  return WELCOME_MESSAGES[topicKey as TopicKey] ?? "Welcome, explorer! Let's learn something awesome!";
}

const VALID_TOPIC_KEYS: TopicKey[] = CANONICAL_SESSIONS.map((s) => s.topicKey);

/**
 * Derive topicKey from quiz ID for mascot/hint association.
 * Handles: water-quiz, node-water-quiz, nutrition-session-N-quiz, l1-session-N-*.
 */
export function getTopicKeyFromQuizId(quizId: string): TopicKey | null {
  // Direct topic-quiz: water-quiz, protein-quiz
  const stripped = quizId.replace(/-quiz$/, '');
  if (VALID_TOPIC_KEYS.includes(stripped as TopicKey)) return stripped as TopicKey;
  // node-X-quiz pattern
  const fromNode = quizId.replace(/^node-/, '').replace(/-quiz$/, '');
  if (VALID_TOPIC_KEYS.includes(fromNode as TopicKey)) return fromNode as TopicKey;
  // nutrition-session-N-quiz or l1-session-N-*: map session number to topic
  const sessionMatch = quizId.match(/session-(\d+)/);
  if (sessionMatch) {
    const n = parseInt(sessionMatch[1], 10);
    const session = CANONICAL_SESSIONS.find((s) => s.sessionNumber === n);
    if (session) return session.topicKey;
  }
  return null;
}

/**
 * Keyword → hint phrase for quiz questions. Order matters: first match wins.
 * Phrase is used as: "{rizzlerName} says: {phrase}"
 */
const QUIZ_HINT_KEYWORDS: Array<{ keywords: RegExp; phrase: string }> = [
  { keywords: /\b(water|hydrated|hydrat|drink|thirsty|sip)\b/i, phrase: 'Think about what keeps your body refreshed and working well!' },
  { keywords: /\b(protein|muscle|muscles|strong|chicken|beans|eggs)\b/i, phrase: 'Think about what helps your muscles grow strong!' },
  { keywords: /\b(fruit|fruits|vegetable|colorful|phytonutrient|rainbow)\b/i, phrase: 'Think about colorful foods that give you energy to play and grow!' },
  { keywords: /\b(balance|variety|different\s*food|balanced\s*diet)\b/i, phrase: 'Think about eating different kinds of healthy foods together!' },
  { keywords: /\b(carb|carbohydrate|energy|fuel|flour|grain)\b/i, phrase: 'Think about what gives your body energy to play and learn!' },
  { keywords: /\b(fat|fats|brain)\b/i, phrase: 'Think about good fats that help your brain and body!' },
  { keywords: /\b(label|labels|ingredient|read\s*food)\b/i, phrase: 'Think about what you can learn from the food label!' },
  { keywords: /\b(fiber|tummy|gut|probiotic|prebiotic|microbe)\b/i, phrase: 'Think about what helps your tummy feel good!' },
  { keywords: /\b(habit|habits|progress|track|stars|badge)\b/i, phrase: 'Think about small steps that add up to big wins!' },
  { keywords: /\b(healthy\s*food|grow|strong|energy)\b/i, phrase: 'Think about what helps your body grow and feel strong!' },
];

/**
 * Generate a dynamic hint based on the current quiz question text and topic.
 * Returns a phrase to display as "{rizzlerName} says: {hint}"
 */
export function getQuizHintForQuestion(questionText: string, rizzlerName: string): string {
  const text = questionText || '';
  for (const { keywords, phrase } of QUIZ_HINT_KEYWORDS) {
    if (keywords.test(text)) {
      return `${rizzlerName} says: ${phrase}`;
    }
  }
  return `${rizzlerName} says: Think about what you learned in the lesson!`;
}

/** Style keys used for dialogue box position/size (percentages or other CSS values). */
export type DialogueBoxPosition = {
  left?: string;
  top?: string;
  transform?: string;
  width?: string;
  maxWidth?: string;
};

/** Default dialogue box position/size (used when a topic has no override). */
const DEFAULT_DIALOGUE_BOX_STYLE: DialogueBoxPosition = {
  left: '50%',
  top: '8%',
  transform: 'translateX(-50%)',
  width: '85%',
  maxWidth: '24rem',
};

/**
 * Per-subpage dialogue box position/size. Override only the keys you need per topic.
 * Rizzler is at top-left, so the dialogue box sits top-center by default.
 */
export const DIALOGUE_BOX_POSITION_BY_TOPIC: Partial<Record<TopicKey, DialogueBoxPosition>> = {};

export function getDialogueBoxStyle(topicKey: TopicKey | string): DialogueBoxPosition {
  const overrides = DIALOGUE_BOX_POSITION_BY_TOPIC[topicKey as TopicKey];
  return overrides ? { ...DEFAULT_DIALOGUE_BOX_STYLE, ...overrides } : { ...DEFAULT_DIALOGUE_BOX_STYLE };
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomEncouragement(topicKey: TopicKey | string): string {
  const generic = pick(GENERIC);
  const topicMessages = BY_TOPIC[topicKey as TopicKey];
  if (!topicMessages?.length) return generic;
  if (Math.random() < 0.5) return generic;
  return `${generic} ${pick(topicMessages)}`;
}
