export type GameSpeed = 'slow' | 'normal' | 'fast';
export type QuestionFormat = 'sequential' | 'random';

export type GameSettings = {
  speed: GameSpeed;
  questionFormat: QuestionFormat;
};

export const DEFAULT_SETTINGS: GameSettings = {
  speed: 'normal',
  questionFormat: 'sequential',
};

export const SPEED_VALUES: Record<GameSpeed, number> = {
  slow: 200,
  normal: 120,
  fast: 60,
};

export const SPEED_LABELS: Record<GameSpeed, string> = {
  slow: '遅い (Slow)',
  normal: '普通 (Normal)',
  fast: '速い (Fast)',
};

export const QUESTION_FORMAT_LABELS: Record<QuestionFormat, string> = {
  sequential: 'A-Z順番 (Sequential)',
  random: 'ランダム (Random)',
};
