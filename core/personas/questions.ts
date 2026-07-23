/**
 * Onboarding questions Q3-Q12 (Q1=nickname lives in profile.tsx, Q2=age in age.tsx).
 * Each option `value` feeds into computeHabitScores() in persona-matching.ts to
 * derive Hydro / Phyto / Pro deficit scores -- lowest score = recommended streak.
 */

export interface QuestionOption {
  value: string;
  label: string;
}

export interface KidQuestion {
  id: string;
  question: string;
  helper?: string;
  type: 'single' | 'multi';
  options: QuestionOption[];
}

export const QUESTIONS: KidQuestion[] = [
  // Q3
  {
    id: 'food_reaction',
    question: 'How do you react when food shows up on your plate?',
    type: 'single',
    options: [
      { value: 'react_adventurous', label: "Let's go! I love to try stuff! 😄" },
      { value: 'react_curious',     label: 'I look at it for a bit. I might try it later. 🤔' },
      { value: 'react_safe',        label: 'I eat my usual stuff. 😐' },
      { value: 'react_cautious',    label: 'Nope. That food is sus. 🙅' },
    ],
  },
  // Q4
  {
    id: 'food_allergies',
    question: 'Are there foods your body says NO WAY to?',
    helper: 'A grown-up can help here',
    type: 'multi',
    options: [
      { value: 'allergy_dairy', label: 'Dairy 🥛' },
      { value: 'allergy_nuts',  label: 'Nuts 🥜' },
      { value: 'allergy_other', label: 'Something else 🧄' },
      { value: 'allergy_none',  label: 'Nope, all good! 👍' },
    ],
  },
  // Q5
  {
    id: 'fruit_veg_frequency',
    question: 'How many different fruits or veggies do you eat in a week?',
    type: 'single',
    options: [
      { value: 'fv_zero_two',   label: 'Umm... 1 or 2? 🤔' },
      { value: 'fv_three_five', label: 'About 3 to 5 🙂' },
      { value: 'fv_six_plus',   label: "6 or more -- I'm a plant fan! 🌿" },
    ],
  },
  // Q6
  {
    id: 'texture_weirdness',
    question: 'Which foods feel weird to eat?',
    type: 'multi',
    options: [
      { value: 'texture_mushy',   label: 'Mushy or slimy stuff 🤢' },
      { value: 'texture_crunchy', label: 'Super crunchy things 😬' },
      { value: 'texture_smelly',  label: 'Strong smells 👃' },
      { value: 'texture_fine',    label: "I'm okay with everything! 😎" },
    ],
  },
  // Q7
  {
    id: 'chef_style',
    question: "If YOU were the chef, you'd make food that's...",
    type: 'single',
    options: [
      { value: 'chef_meat',     label: 'Nothing but meat! 🥩' },
      { value: 'chef_colorful', label: 'Colorful and fun 🌈' },
      { value: 'chef_sweet',    label: 'Super sweet or cheesy 🧀' },
      { value: 'chef_carbs',    label: 'Lots of bread and pasta 🍞' },
    ],
  },
  // Q8
  {
    id: 'water_at_school',
    question: 'At school, how often do you drink water?',
    type: 'single',
    options: [
      { value: 'water_forget',    label: 'I forget oops 😅' },
      { value: 'water_sometimes', label: 'Sometimes 🤷' },
      { value: 'water_always',    label: 'All the time! 💧' },
    ],
  },
  // Q9
  {
    id: 'tummy_feel',
    question: 'How does your tummy usually feel?',
    type: 'single',
    options: [
      { value: 'tummy_bad',  label: 'Not great... 😣' },
      { value: 'tummy_okay', label: 'Sometimes okay 😐' },
      { value: 'tummy_good', label: 'Happy camper! 😊' },
    ],
  },
  // Q10
  {
    id: 'bathroom_frequency',
    question: 'How often do you use the bathroom?',
    type: 'single',
    options: [
      { value: 'bathroom_rarely',  label: 'Not sure / every few days 🤔' },
      { value: 'bathroom_regular', label: 'Every day ✅' },
    ],
  },
  // Q11
  {
    id: 'sports_activity',
    question: 'Do you play sports or train your body?',
    type: 'single',
    options: [
      { value: 'sport_compete', label: 'Yes! I train or compete 🏆' },
      { value: 'sport_fun',     label: 'I play for fun 🎮' },
      { value: 'sport_none',    label: 'Not really 📺' },
    ],
  },
  // Q12
  {
    id: 'food_motivation',
    question: 'Do you care if food helps you get stronger or faster?',
    type: 'single',
    options: [
      { value: 'motivation_high', label: 'Yes! That matters to me 💪' },
      { value: 'motivation_low',  label: 'Not really 🤷' },
    ],
  },
];
