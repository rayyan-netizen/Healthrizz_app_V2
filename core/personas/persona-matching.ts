import type {
  PersonaId,
  OnboardingResponse,
  PersonaMatch,
  PrimaryLane,
  SecondaryTag,
  GoalType,
} from '@core/types/persona';

interface PersonaWeights {
  [key: string]: Record<PersonaId, number>;
}

const ALL_PERSONAS: PersonaId[] = [
  'texture_troubler',
  'swap_seeker',
  'mini_muscle',
  'sensory_star',
  'gut_guardian',
  'sugar_sprinter',
  'dry_dino',
  'balanced_buddy',
  'rushed_muncher',
  'lunchbox_influencer',
  'anxious_eater',
];

function emptyScores(): Record<PersonaId, number> {
  const o = {} as Record<PersonaId, number>;
  ALL_PERSONAS.forEach((p) => (o[p] = 0));
  return o;
}

const PERSONA_INDICATORS: PersonaWeights = {
  eats_only_few_foods: { ...emptyScores(), texture_troubler: 10, sensory_star: 8, anxious_eater: 6, gut_guardian: 3, swap_seeker: 2, sugar_sprinter: 1, rushed_muncher: 1, lunchbox_influencer: 1 },
  eats_variety: { ...emptyScores(), balanced_buddy: 8, mini_muscle: 3, rushed_muncher: 2, lunchbox_influencer: 2, sugar_sprinter: 1 },
  picky_but_trying: { ...emptyScores(), texture_troubler: 6, anxious_eater: 7, sensory_star: 5, balanced_buddy: 4, swap_seeker: 2, gut_guardian: 2, rushed_muncher: 2, lunchbox_influencer: 2, mini_muscle: 1, sugar_sprinter: 1 },
  adventurous: { ...emptyScores(), balanced_buddy: 9, mini_muscle: 4, rushed_muncher: 1, lunchbox_influencer: 1 },
  texture_aversions: { ...emptyScores(), texture_troubler: 10, sensory_star: 9, anxious_eater: 7, swap_seeker: 2, gut_guardian: 1 },
  texture_okay: { ...emptyScores(), balanced_buddy: 5, mini_muscle: 2, rushed_muncher: 1 },
  texture_sensitive: { ...emptyScores(), sensory_star: 10, texture_troubler: 8, anxious_eater: 6, swap_seeker: 2, gut_guardian: 1 },
  texture_loves: { ...emptyScores(), balanced_buddy: 3, mini_muscle: 2, rushed_muncher: 1 },
  rarely_drinks_water: { ...emptyScores(), dry_dino: 10, gut_guardian: 6, rushed_muncher: 5, sugar_sprinter: 4, texture_troubler: 2, sensory_star: 1, anxious_eater: 1 },
  sometimes_drinks: { ...emptyScores(), dry_dino: 6, rushed_muncher: 4, gut_guardian: 3, sugar_sprinter: 2, balanced_buddy: 2, texture_troubler: 1, mini_muscle: 1, lunchbox_influencer: 1 },
  drinks_regularly: { ...emptyScores(), balanced_buddy: 6, mini_muscle: 4, rushed_muncher: 2, lunchbox_influencer: 1 },
  water_champion: { ...emptyScores(), balanced_buddy: 8, mini_muscle: 5, rushed_muncher: 1 },
  none_or_few: { ...emptyScores(), balanced_buddy: 7, mini_muscle: 3, rushed_muncher: 2, lunchbox_influencer: 1 },
  some_sweets: { ...emptyScores(), balanced_buddy: 5, rushed_muncher: 3, lunchbox_influencer: 3, mini_muscle: 2, sugar_sprinter: 2, anxious_eater: 1, swap_seeker: 1, gut_guardian: 1, dry_dino: 1 },
  moderate_sweets: { ...emptyScores(), sugar_sprinter: 8, rushed_muncher: 4, lunchbox_influencer: 5, dry_dino: 3, gut_guardian: 2, balanced_buddy: 2, anxious_eater: 2, texture_troubler: 1, sensory_star: 1, swap_seeker: 1, mini_muscle: 1 },
  lots_of_sweets: { ...emptyScores(), sugar_sprinter: 10, lunchbox_influencer: 6, rushed_muncher: 4, dry_dino: 3, gut_guardian: 2, anxious_eater: 2, texture_troubler: 1, sensory_star: 1, swap_seeker: 1, mini_muscle: 1, balanced_buddy: 1 },
  very_active: { ...emptyScores(), mini_muscle: 10, rushed_muncher: 4, balanced_buddy: 3, lunchbox_influencer: 1, swap_seeker: 1, sugar_sprinter: 1, sensory_star: 1 },
  moderately_active: { ...emptyScores(), balanced_buddy: 6, mini_muscle: 4, rushed_muncher: 3, lunchbox_influencer: 2, sugar_sprinter: 1 },
  less_active: { ...emptyScores(), balanced_buddy: 4, texture_troubler: 2, sensory_star: 2, anxious_eater: 2, gut_guardian: 2, dry_dino: 2, rushed_muncher: 1, lunchbox_influencer: 1, sugar_sprinter: 1 },
  mixed_activity: { ...emptyScores(), balanced_buddy: 7, mini_muscle: 3, rushed_muncher: 2, lunchbox_influencer: 2 },
  dairy_sensitive: { ...emptyScores(), swap_seeker: 10, gut_guardian: 5, texture_troubler: 2, sensory_star: 3, anxious_eater: 2, lunchbox_influencer: 1 },
  gluten_sensitive: { ...emptyScores(), swap_seeker: 10, gut_guardian: 6, texture_troubler: 2, sensory_star: 3, anxious_eater: 2, lunchbox_influencer: 1 },
  other_sensitivities: { ...emptyScores(), swap_seeker: 8, gut_guardian: 5, anxious_eater: 3, texture_troubler: 2, sensory_star: 2, balanced_buddy: 1, lunchbox_influencer: 1 },
  no_sensitivities: { ...emptyScores(), balanced_buddy: 5, mini_muscle: 2, rushed_muncher: 1, lunchbox_influencer: 1 },
  great_energy: { ...emptyScores(), balanced_buddy: 8, mini_muscle: 5, rushed_muncher: 2, lunchbox_influencer: 1 },
  good_energy: { ...emptyScores(), balanced_buddy: 6, mini_muscle: 3, rushed_muncher: 2, lunchbox_influencer: 1, gut_guardian: 1 },
  variable_energy: { ...emptyScores(), gut_guardian: 7, rushed_muncher: 4, dry_dino: 4, sugar_sprinter: 3, balanced_buddy: 2, texture_troubler: 2, sensory_star: 1, anxious_eater: 2, swap_seeker: 2, mini_muscle: 1, lunchbox_influencer: 1 },
  low_energy: { ...emptyScores(), gut_guardian: 10, dry_dino: 7, rushed_muncher: 3, sugar_sprinter: 2, texture_troubler: 2, sensory_star: 1, anxious_eater: 2, swap_seeker: 2, mini_muscle: 1 },
  excited_try_new: { ...emptyScores(), balanced_buddy: 8, mini_muscle: 3, rushed_muncher: 1, lunchbox_influencer: 1 },
  curious: { ...emptyScores(), balanced_buddy: 6, mini_muscle: 2, rushed_muncher: 2, lunchbox_influencer: 2, texture_troubler: 1, sensory_star: 1, anxious_eater: 1, swap_seeker: 1 },
  cautious: { ...emptyScores(), anxious_eater: 6, texture_troubler: 4, sensory_star: 4, balanced_buddy: 3, swap_seeker: 2, gut_guardian: 1, mini_muscle: 1, sugar_sprinter: 1, dry_dino: 1, rushed_muncher: 1, lunchbox_influencer: 2 },
  anxious_around_food: { ...emptyScores(), anxious_eater: 10, sensory_star: 7, texture_troubler: 6, swap_seeker: 3, gut_guardian: 2, lunchbox_influencer: 2, rushed_muncher: 1, sugar_sprinter: 1, dry_dino: 1 },
  fruits_veggies: { ...emptyScores(), balanced_buddy: 7, mini_muscle: 2, rushed_muncher: 1, lunchbox_influencer: 1 },
  proteins: { ...emptyScores(), mini_muscle: 8, balanced_buddy: 4, rushed_muncher: 2, gut_guardian: 1, lunchbox_influencer: 1 },
  carbs: { ...emptyScores(), sugar_sprinter: 4, rushed_muncher: 3, balanced_buddy: 3, lunchbox_influencer: 2, mini_muscle: 1, dry_dino: 1 },
  everything: { ...emptyScores(), balanced_buddy: 9, mini_muscle: 3, rushed_muncher: 1, lunchbox_influencer: 1 },
  vegetarian: { ...emptyScores(), swap_seeker: 6, balanced_buddy: 4, gut_guardian: 2, texture_troubler: 1, sensory_star: 1, anxious_eater: 1, rushed_muncher: 1, lunchbox_influencer: 2 },
  vegan: { ...emptyScores(), swap_seeker: 8, balanced_buddy: 3, gut_guardian: 2, texture_troubler: 1, sensory_star: 1, anxious_eater: 1, lunchbox_influencer: 1 },
  allergies: { ...emptyScores(), swap_seeker: 9, anxious_eater: 5, gut_guardian: 3, texture_troubler: 2, sensory_star: 2, balanced_buddy: 2, lunchbox_influencer: 2 },
  no_restrictions: { ...emptyScores(), balanced_buddy: 6, mini_muscle: 3, rushed_muncher: 2, lunchbox_influencer: 2 },
};

const QUESTION_WEIGHTS: Record<string, number> = {
  eating_habits: 1.2,
  texture_preferences: 1.3,
  hydration: 1.1,
  sugar_intake: 1.1,
  activity_level: 1.2,
  food_sensitivities: 1.2,
  digestive_health: 1.1,
  food_anxiety: 1.3,
  favorite_foods: 0.8,
  dietary_restrictions: 1.0,
};

export function calculatePersonaScores(
  responses: OnboardingResponse[]
): PersonaMatch[] {
  const scores = emptyScores();

  responses.forEach((response) => {
    if (response.question_id === 'nickname') return;
    const questionWeight = QUESTION_WEIGHTS[response.question_id] || 1.0;
    const apply = (value: string) => {
      const indicator = PERSONA_INDICATORS[value];
      if (!indicator) return;
      ALL_PERSONAS.forEach((persona) => {
        const baseScore = indicator[persona] || 0;
        scores[persona] += baseScore * questionWeight;
      });
    };
    if (Array.isArray(response.response)) {
      response.response.forEach((v: string) => apply(v));
    } else if (typeof response.response === 'string') {
      apply(response.response);
    }
  });

  const maxScore = Math.max(...Object.values(scores));
  const normalized: Record<PersonaId, number> = (
    maxScore > 0
      ? (Object.fromEntries(
          Object.entries(scores).map(([persona, score]) => [
            persona,
            (score / maxScore) * 100,
          ])
        ) as Record<PersonaId, number>)
      : scores
  );

  const matches: PersonaMatch[] = Object.entries(normalized)
    .map(([persona_id, score]) => ({
      persona_id: persona_id as PersonaId,
      score: Math.round(score * 100) / 100,
      is_primary: false,
    }))
    .sort((a, b) => b.score - a.score);

  if (matches.length > 0 && matches[0].score > 0) {
    matches[0].is_primary = true;
  }
  if (matches.length > 0 && matches[0].score < 20) {
    matches[0] = { persona_id: 'balanced_buddy', score: 50, is_primary: true };
  }

  return matches;
}

export function suggestGoals(
  primaryPersona: PersonaId,
  secondaryPersona?: PersonaId
): Array<{ goal_type: GoalType; priority: number }> {
  const goalMap: Record<PersonaId, GoalType[]> = {
    texture_troubler: ['phyto_rizzler'],
    swap_seeker: ['phyto_rizzler', 'pro_rizzler'],
    mini_muscle: ['pro_rizzler', 'hydro_rizzler'],
    sensory_star: ['phyto_rizzler'],
    gut_guardian: ['phyto_rizzler', 'hydro_rizzler'],
    sugar_sprinter: ['phyto_rizzler'],
    dry_dino: ['hydro_rizzler'],
    balanced_buddy: ['phyto_rizzler', 'hydro_rizzler', 'pro_rizzler'],
    rushed_muncher: ['pro_rizzler', 'hydro_rizzler'],
    lunchbox_influencer: ['phyto_rizzler'],
    anxious_eater: ['phyto_rizzler'],
  };

  const goals = new Set<GoalType>();
  const priorities: Partial<Record<GoalType, number>> = {};

  goalMap[primaryPersona]?.forEach((g) => {
    goals.add(g);
    priorities[g] = 1;
  });

  if (secondaryPersona) {
    goalMap[secondaryPersona]?.forEach((g) => {
      goals.add(g);
      if (!priorities[g]) priorities[g] = 2;
    });
  }

  return Array.from(goals).map((g) => ({
    goal_type: g,
    priority: priorities[g] ?? 3,
  }));
}

const LANE_TO_PRIMARY_PERSONA: Record<PrimaryLane, PersonaId> = {
  safety: 'swap_seeker',
  gi_hydration: 'gut_guardian',
  selectivity: 'texture_troubler',
  performance: 'mini_muscle',
  sugar_ultra_processed: 'sugar_sprinter',
  typical: 'balanced_buddy',
};

const LANE_TO_SECONDARY_PERSONA: Partial<Record<PrimaryLane, PersonaId>> = {
  gi_hydration: 'dry_dino',
  selectivity: 'sensory_star',
};

const TAG_PERSONA_BOOST: Record<SecondaryTag, Partial<Record<PersonaId, number>>> = {
  texture_sensitivity: { texture_troubler: 15, sensory_star: 10 },
  low_fruit_veg_exposure: { swap_seeker: 10, lunchbox_influencer: 5 },
  low_water_routine: { dry_dino: 15, gut_guardian: 5 },
  routine_rigidity: { anxious_eater: 8, texture_troubler: 5 },
  emotional_reward_snacking: { sugar_sprinter: 15, lunchbox_influencer: 5 },
  distracted_eating: { rushed_muncher: 10 },
  sleep_stressed_schedule_overload: { rushed_muncher: 5, gut_guardian: 5 },
};

// ---------------------------------------------------------------------------
// Habit-deficit scoring (drives streak recommendation on goals screen)
// ---------------------------------------------------------------------------

export interface HabitScores {
  hydro: number;
  phyto: number;
  pro: number;
}

/**
 * Scores each habit dimension based on Q3–Q12 responses.
 * Higher = child is already doing well. LOWEST score = most lacking = recommended streak.
 *
 * Hydro  = Q8 + Q9 + Q10
 * Phyto  = Q5 + Q7 + Q8
 * Pro    = Q7 + Q11 + Q12
 */
export function computeHabitScores(responses: OnboardingResponse[]): HabitScores {
  let hydro = 5;
  let phyto = 5;
  let pro = 5;

  const get = (id: string): string | undefined => {
    const r = responses.find((x) => x.question_id === id);
    return typeof r?.response === 'string' ? r.response : undefined;
  };
  const has = (id: string, value: string): boolean => {
    const r = responses.find((x) => x.question_id === id);
    if (!r) return false;
    if (Array.isArray(r.response)) return r.response.includes(value);
    return r.response === value;
  };

  // Q5: fruit & veg → Phyto
  const q5 = get('fruit_veg_frequency');
  if (q5 === 'fv_zero_two') phyto -= 3;
  else if (q5 === 'fv_three_five') phyto -= 1;
  else if (q5 === 'fv_six_plus') phyto += 1;

  // Q7: chef style → Phyto + Pro
  const q7 = get('chef_style');
  if (q7 === 'chef_meat') pro += 2;           // already protein-leaning = less need
  else if (q7 === 'chef_colorful') phyto += 1; // plant-curious = phyto signal
  else if (q7 === 'chef_sweet' || q7 === 'chef_carbs') {
    pro -= 1; // avoids protein-dense foods
    hydro -= 1; // processed preferences = hydro signal
  }

  // Q8: water at school → Hydro + (weak Phyto)
  const q8 = get('water_at_school');
  if (q8 === 'water_forget') { hydro -= 3; phyto -= 1; }
  else if (q8 === 'water_sometimes') { hydro -= 1; }
  else if (q8 === 'water_always') { hydro += 1; phyto += 1; }

  // Q9: tummy feel → Hydro + Phyto
  const q9 = get('tummy_feel');
  if (q9 === 'tummy_bad') { hydro -= 1; phyto -= 1; }
  else if (q9 === 'tummy_good') { hydro += 1; phyto += 1; }

  // Q10: bathroom frequency → Hydro
  const q10 = get('bathroom_frequency');
  if (q10 === 'bathroom_rarely') hydro -= 1;

  // Q11: sports activity → Pro
  const q11 = get('sports_activity');
  if (q11 === 'sport_compete') pro -= 2;  // high need = low score = recommend Pro
  else if (q11 === 'sport_fun') pro -= 1;
  else if (q11 === 'sport_none') pro += 1; // less need

  // Q12: food motivation → Pro
  const q12 = get('food_motivation');
  if (q12 === 'motivation_high') pro -= 1; // strong candidate for Pro Rizzler
  else if (q12 === 'motivation_low') pro += 1;

  // Q4: protein-source allergies → flag Pro if dairy/nuts blocked
  if (has('food_allergies', 'allergy_dairy') || has('food_allergies', 'allergy_nuts')) {
    pro -= 1; // harder to hit protein targets = more need
  }

  return { hydro, phyto, pro };
}

export type RecommendedHabit = 'hydro' | 'phyto' | 'pro';

/** Returns the habit the child is most lacking in (lowest score). */
export function getRecommendedHabit(responses: OnboardingResponse[]): RecommendedHabit {
  const scores = computeHabitScores(responses);
  if (scores.hydro <= scores.phyto && scores.hydro <= scores.pro) return 'hydro';
  if (scores.phyto <= scores.pro) return 'phyto';
  return 'pro';
}

// ---------------------------------------------------------------------------

export function computePersonaMatchesFromLaneAndTags(
  primaryLane: PrimaryLane,
  secondaryTags: SecondaryTag[]
): PersonaMatch[] {
  const scores = emptyScores();
  const primary = LANE_TO_PRIMARY_PERSONA[primaryLane];
  const secondary = LANE_TO_SECONDARY_PERSONA[primaryLane];

  scores[primary] = 100;
  if (secondary) scores[secondary] = 65;

  secondaryTags.forEach((tag) => {
    const boost = TAG_PERSONA_BOOST[tag];
    if (!boost) return;
    Object.entries(boost).forEach(([persona, add]) => {
      scores[persona as PersonaId] = (scores[persona as PersonaId] || 0) + (add ?? 0);
    });
  });

  const sorted = (Object.entries(scores) as [PersonaId, number][])
    .sort((a, b) => b[1] - a[1])
    .filter(([, s]) => s > 0);

  const max = Math.max(...sorted.map(([, s]) => s), 1);
  return sorted.map(([persona_id], i) => ({
    persona_id,
    score: Math.round((sorted[i][1] / max) * 100 * 100) / 100,
    is_primary: i === 0,
  }));
}
