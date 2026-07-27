import type { LessonComplete, LessonSlide, LessonQuizQuestion } from '@core/learning/types-lessons';

/**
 * Trimmed from HealthRizz-Mobile's local-lessons.ts: that file carries all
 * 9 sessions verbatim from the web app. Only Splash Springs (water) is
 * ported here so far — add the other 8 sessions the same way once their
 * assets are copied over.
 */

const E = { created_at: '', updated_at: '' } as const;

// Splash Springs – 12 slides; SVGs 7–18 each used once in assets/lessons/presentations/Splash-Springs-Lesson
const S1 = '/lessons/presentations/Splash-Springs-Lesson';
const HYDRO_MASCOT = '/brand/mascots/Hydro Rizzler_1.png';
const SPLASH_ACCENT = '#3b82f6';

const session1Slides: LessonSlide[] = [
  {
    id: 'local-water-01', lesson_id: 'local-l1-session-1-intro', order: 1,
    image_url: `${S1}/7.svg`,
    alt_text: "Welcome to Splash Springs!\n• Your body is a water-powered machine.\n• Water helps you feel strong and ready to play. Let's learn how!",
    audio_url: null, duration_seconds: 7, has_interaction: false, interaction_type: null, ...E,
    zoneLabel: 'Splash Springs', mascotImage: HYDRO_MASCOT, accentColor: SPLASH_ACCENT, mascotTip: "Let's dive in!",
  },
  {
    id: 'local-water-08b', lesson_id: 'local-l1-session-1-intro', order: 2,
    image_url: `${S1}/8.png`,
    alt_text: "Water is your body's best friend!\n• Every day you can choose water to drink.\n• It pairs with healthy foods to help you grow and play.",
    audio_url: null, duration_seconds: 7, has_interaction: false, interaction_type: null, ...E,
    zoneLabel: 'Splash Springs', mascotImage: HYDRO_MASCOT, accentColor: SPLASH_ACCENT, mascotTip: 'Drink up!',
  },
  {
    id: 'local-water-02', lesson_id: 'local-l1-session-1-intro', order: 3,
    image_url: `${S1}/9.png`,
    alt_text: "Healthy foods help your body grow strong!\n• Your body needs them to grow and have energy.\n• Good food is like good fuel.",
    audio_url: null, duration_seconds: 7, has_interaction: false, interaction_type: null, ...E,
    zoneLabel: 'Splash Springs', mascotImage: HYDRO_MASCOT, accentColor: SPLASH_ACCENT, mascotTip: 'Did you know?',
    coach_line: 'Hydro Rizzler says: Food and water are your superpowers!',
  },
  {
    id: 'local-water-03', lesson_id: 'local-l1-session-1-intro', order: 4,
    image_url: `${S1}/10.png`,
    alt_text: "Food and water work together!\n• Drinking water with meals helps your body use the good stuff from food.\n• Eat healthy foods and sip water to feel strong.",
    audio_url: null, duration_seconds: 7, has_interaction: false, interaction_type: null, ...E,
    zoneLabel: 'Splash Springs', mascotImage: HYDRO_MASCOT, accentColor: SPLASH_ACCENT, mascotTip: 'Teamwork!',
  },
  {
    id: 'local-water-07', lesson_id: 'local-l1-session-1-intro', order: 5,
    image_url: `${S1}/11.png`,
    alt_text: "Water helps your body work and feel strong!\n• Drinking water helps you when you play and move.\n• It's a power drink for your body.",
    audio_url: null, duration_seconds: 7, has_interaction: false, interaction_type: null, ...E,
    coach_line: 'Hydro Rizzler says: Kids have more water in their bodies than adults!',
    zoneLabel: 'Splash Springs', mascotImage: HYDRO_MASCOT, accentColor: SPLASH_ACCENT, mascotTip: 'Remember this!',
  },
  {
    id: 'local-water-08', lesson_id: 'local-l1-session-1-intro', order: 6,
    image_url: `${S1}/12.svg`, alt_text: 'Quick check!',
    audio_url: null, duration_seconds: null, has_interaction: true, interaction_type: null, ...E,
    micro_check: {
      prompt:
        "What percentage of an adult's body is made of water?",
      options: ['20%', '40%', '60%', '90%'],
      correct_index: 2,
    },
    zoneLabel: 'Splash Springs', mascotImage: HYDRO_MASCOT, accentColor: SPLASH_ACCENT, mascotTip: 'Can you answer this?',
  },
  {
    id: 'local-water-09', lesson_id: 'local-l1-session-1-intro', order: 7,
    image_url: `${S1}/13.png`,
    alt_text: "Fruits give you energy to play and grow!\n• They are healthy foods that help your body.\n• Eat fruits and drink water to feel good.",
    audio_url: null, duration_seconds: 7, has_interaction: false, interaction_type: null, ...E,
    zoneLabel: 'Splash Springs', mascotImage: HYDRO_MASCOT, accentColor: SPLASH_ACCENT, mascotTip: 'Yum!',
  },
  {
    id: 'local-water-14b', lesson_id: 'local-l1-session-1-intro', order: 8,
    image_url: `${S1}/14.png`,
    alt_text: "Eat the rainbow!\n• Different colors help your body in different ways.\n• Try fruits and veggies of many colors with your water.",
    audio_url: null, duration_seconds: 7, has_interaction: false, interaction_type: null, ...E,
    zoneLabel: 'Splash Springs', mascotImage: HYDRO_MASCOT, accentColor: SPLASH_ACCENT, mascotTip: 'Colorful!',
  },
  {
    id: 'local-water-14', lesson_id: 'local-l1-session-1-intro', order: 9,
    image_url: `${S1}/16.png`,
    alt_text: "Balance means eating different healthy foods!\n• You don't have to eat only one food.\n• Variety helps your body get what it needs.",
    audio_url: null, duration_seconds: 7, has_interaction: false, interaction_type: null, ...E,
    zoneLabel: 'Splash Springs', mascotImage: HYDRO_MASCOT, accentColor: SPLASH_ACCENT, mascotTip: 'Mix it up!',
    coach_line: 'Hydro Rizzler says: Different foods team up to keep you strong!',
  },
  {
    id: 'local-water-17', lesson_id: 'local-l1-session-1-intro', order: 10,
    image_url: `${S1}/17.png`,
    alt_text: "Healthy choices can be fun!\n• Try one new healthy food or drink at a time.\n• Healthy foods help you feel strong and play longer.",
    audio_url: null, duration_seconds: 7, has_interaction: false, interaction_type: null, ...E,
    zoneLabel: 'Splash Springs', mascotImage: HYDRO_MASCOT, accentColor: SPLASH_ACCENT, mascotTip: 'Remember this!',
  },
  {
    id: 'local-water-18', lesson_id: 'local-l1-session-1-intro', order: 11,
    image_url: `${S1}/15.png`, alt_text: 'Quick check!',
    audio_url: null, duration_seconds: null, has_interaction: true, interaction_type: null, ...E,
    micro_check: {
      prompt: 'Which food is very hydrating?',
      options: ['Cookies', 'Watermelon', 'Chips', 'Candy'],
      correct_index: 1,
    },
    zoneLabel: 'Splash Springs', mascotImage: HYDRO_MASCOT, accentColor: SPLASH_ACCENT, mascotTip: 'Can you answer this?',
  },
  {
    id: 'local-water-21', lesson_id: 'local-l1-session-1-intro', order: 12,
    image_url: `${S1}/18.png`,
    alt_text: "You did it! You explored Splash Springs!\n• You learned how food and water help your body.\n• Keep exploring. Your adventure continues!",
    audio_url: null, duration_seconds: 7, has_interaction: false, interaction_type: null, ...E,
    zoneLabel: 'Splash Springs', mascotImage: HYDRO_MASCOT, accentColor: SPLASH_ACCENT, mascotTip: "You're a Splash Pro!",
  },
];

const session1Quiz: LessonQuizQuestion[] = [
  {
    id: 'local-q1',
    lesson_id: 'local-l1-session-1-intro',
    slide_id: null,
    question_text: 'Where does the SAFEST drinking water usually come from?',
    question_image_url: null,
    options: [
      { id: 'opt-1', text: 'Tap water', is_correct: true },
      { id: 'opt-2', text: 'Filtered water', is_correct: false },
      { id: 'opt-3', text: 'Bottled water', is_correct: false },
      { id: 'opt-4', text: 'Boiled water', is_correct: false },
    ],
    order: 1,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'local-q2',
    lesson_id: 'local-l1-session-1-intro',
    slide_id: null,
    question_text: 'Which fruit or vegetable has the MOST water in it?',
    question_image_url: null,
    options: [
      { id: 'opt-1', text: 'Cauliflower', is_correct: false },
      { id: 'opt-2', text: 'Spinach', is_correct: false },
      { id: 'opt-3', text: 'Watermelon', is_correct: false },
      { id: 'opt-4', text: 'Cucumber', is_correct: true },
    ],
    order: 2,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'local-q3',
    lesson_id: 'local-l1-session-1-intro',
    slide_id: null,
    question_text: 'Which part of your body contains the MOST water?',
    question_image_url: null,
    options: [
      { id: 'opt-1', text: 'Heart', is_correct: false },
      { id: 'opt-2', text: 'Teeth', is_correct: false },
      { id: 'opt-3', text: 'Lungs', is_correct: false },
      { id: 'opt-4', text: 'Brain', is_correct: true },
    ],
    order: 3,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'local-q4',
    lesson_id: 'local-l1-session-1-intro',
    slide_id: null,
    question_text: 'What does water help our bodies do?',
    question_image_url: null,
    options: [
      {
        id: 'opt-1',
        text: 'Detoxification (cleaning out bad stuff from our bodies)',
        is_correct: false,
      },
      {
        id: 'opt-2',
        text: 'Digestion (breaking down our food)',
        is_correct: false,
      },
      { id: 'opt-3', text: 'Keeping our skin healthy', is_correct: false },
      { id: 'opt-4', text: 'All of the above', is_correct: true },
    ],
    order: 4,
    created_at: '',
    updated_at: '',
  },
];

const localLessons: LessonComplete[] = [
  // Map route /learn/water-lesson (Splash Springs)
  {
    id: 'local-water-lesson',
    slug: 'water-lesson',
    title: 'Splash Springs – Water & Healthy Basics',
    description: 'Learn how water and healthy foods help your body stay refreshed and ready to play.',
    duration_minutes: 8,
    type: 'presentation',
    content_type: 'slides',
    persona_tags: ['balanced_buddy', 'energy_explorer', 'color_craver'],
    goal_tags: ['hydro_rizzler'],
    world_id: null,
    order: 1,
    is_active: true,
    created_at: '',
    updated_at: '',
    primaryZoneLabel: 'Splash Springs',
    primaryMascotImage: '/brand/mascots/Hydro Rizzler_1.png',
    slides: session1Slides,
    quiz_questions: session1Quiz,
  },
];

export function getLocalLessonBySlug(slug: string): LessonComplete | null {
  return localLessons.find((lesson) => lesson.slug === slug) || null;
}
