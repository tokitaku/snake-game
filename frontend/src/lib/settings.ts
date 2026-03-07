export type GameSpeed = 'slow' | 'normal' | 'fast';
export type DummyCount = 2 | 3 | 4 | 5;

export type GameSettings = {
  speed: GameSpeed;
  dummyCount: DummyCount;
};

export const DEFAULT_SETTINGS: GameSettings = {
  speed: 'normal',
  dummyCount: 2,
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

export const DUMMY_COUNT_LABELS: Record<DummyCount, string> = {
  2: '2個 (合計3個)',
  3: '3個 (合計4個)',
  4: '4個 (合計5個)',
  5: '5個 (合計6個)',
};
