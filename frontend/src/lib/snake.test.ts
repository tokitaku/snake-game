import { describe, expect, it } from 'vitest';
import {
  createInitialState,
  getTargetLetter,
  placeFoods,
  placeTargetCell,
  stepGame,
  type GameState,
} from './snake';
import { DEFAULT_SETTINGS } from './settings';

describe('alphabet snake rules', () => {
  it('初期状態で正解1個とダミー2個が配置される', () => {
    const state = createInitialState(6, DEFAULT_SETTINGS, () => 0); // 乱数を固定して初期配置を安定化する。
    expect(state.targetLetterIndex).toBe(0);
    expect(getTargetLetter(state.targetLetterIndex)).toBe('A');
    expect(state.dummyCount).toBe(2);
    expect(state.foods).toHaveLength(3);
    expect(state.foods.filter((food) => food.kind === 'target')).toHaveLength(1);
    expect(state.foods.filter((food) => food.kind === 'dummy')).toHaveLength(2);
  });

  it('ターゲット取得時に成長・加点・文字進行する', () => {
    const state: GameState = {
      snake: [
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ],
      direction: 'right',
      pendingDirection: 'right',
      foods: [
        { cell: { x: 2, y: 1 }, letter: 'A', kind: 'target' }, // 次ヘッド位置に正解を置く。
        { cell: { x: 5, y: 5 }, letter: 'B', kind: 'dummy' },
        { cell: { x: 4, y: 4 }, letter: 'C', kind: 'dummy' },
      ],
      targetLetterIndex: 0,
      completedCycles: 0,
      dummyCount: 2,
      score: 0,
      gameOver: false,
    };

    const next = stepGame(state, 6, () => 0);
    expect(next.snake.length).toBe(3);
    expect(next.score).toBe(1);
    expect(next.targetLetterIndex).toBe(1);
    expect(getTargetLetter(next.targetLetterIndex)).toBe('B');
    expect(next.foods.filter((food) => food.kind === 'dummy')).toHaveLength(2);
    expect(next.gameOver).toBe(false);
  });

  it('ターゲット未取得時は蛇の長さが維持される', () => {
    const state: GameState = {
      snake: [
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ],
      direction: 'right',
      pendingDirection: 'right',
      foods: [
        { cell: { x: 5, y: 5 }, letter: 'A', kind: 'target' }, // 到達しない位置に正解を置く。
        { cell: { x: 6, y: 6 }, letter: 'B', kind: 'dummy' },
        { cell: { x: 7, y: 7 }, letter: 'C', kind: 'dummy' },
      ],
      targetLetterIndex: 0,
      completedCycles: 0,
      dummyCount: 2,
      score: 0,
      gameOver: false,
    };

    const next = stepGame(state, 10, () => 0);
    expect(next.snake.length).toBe(2);
    expect(next.score).toBe(0);
    expect(next.targetLetterIndex).toBe(0);
  });

  it('Z取得でAに戻り周回カウントが増える', () => {
    const state: GameState = {
      snake: [
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ],
      direction: 'right',
      pendingDirection: 'right',
      foods: [
        { cell: { x: 2, y: 1 }, letter: 'Z', kind: 'target' }, // 取得を確実に発生させる。
        { cell: { x: 5, y: 5 }, letter: 'A', kind: 'dummy' },
        { cell: { x: 4, y: 4 }, letter: 'B', kind: 'dummy' },
      ],
      targetLetterIndex: 25,
      completedCycles: 0,
      dummyCount: 2,
      score: 10,
      gameOver: false,
    };

    const next = stepGame(state, 6, () => 0);
    expect(next.targetLetterIndex).toBe(0);
    expect(getTargetLetter(next.targetLetterIndex)).toBe('A');
    expect(next.completedCycles).toBe(1);
    expect(next.score).toBe(11);
  });

  it('ダミー数を変えた初期化では正解1個に加えて同数のダミーが出る', () => {
    const state = createInitialState(8, { ...DEFAULT_SETTINGS, dummyCount: 5 }, () => 0); // 最大設定で個数を確認する。
    expect(state.foods).toHaveLength(6);
    expect(state.foods.filter((food) => food.kind === 'dummy')).toHaveLength(5);
  });

  it('ターゲット配置は蛇と重ならない', () => {
    const snake = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ];
    const target = placeTargetCell(snake, 4, () => 0); // 先頭候補を選ぶ乱数で判定する。
    const overlapped = snake.some((segment) => segment.x === target?.x && segment.y === target?.y);
    expect(target).not.toBeNull();
    expect(overlapped).toBe(false);
  });

  it('複数餌の配置は正解文字を含み、ダミー文字は重複しない', () => {
    const foods = placeFoods(
      [
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ],
      0,
      3,
      6,
      () => 0,
    ); // 常に先頭候補を選び、生成内容を安定化する。
    const dummyLetters = foods?.filter((food) => food.kind === 'dummy').map((food) => food.letter) ?? [];
    expect(foods?.find((food) => food.kind === 'target')?.letter).toBe('A');
    expect(new Set(dummyLetters).size).toBe(dummyLetters.length);
    expect(dummyLetters).not.toContain('A');
  });

  it('空きマスが少ない場合は正解を優先して置けるだけ配置する', () => {
    const foods = placeFoods(
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ],
      0,
      2,
      2,
      () => 0,
    ); // 2x2盤面の最後の1マスだけが空いている状態を作る。
    expect(foods).toHaveLength(1);
    expect(foods?.[0].kind).toBe('target');
  });

  it('ダミーに当たるとゲームオーバーになる', () => {
    const state: GameState = {
      snake: [
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ],
      direction: 'right',
      pendingDirection: 'right',
      foods: [
        { cell: { x: 2, y: 1 }, letter: 'B', kind: 'dummy' }, // 次ヘッド位置にダミーを置く。
        { cell: { x: 5, y: 5 }, letter: 'A', kind: 'target' },
      ],
      targetLetterIndex: 0,
      completedCycles: 0,
      dummyCount: 2,
      score: 0,
      gameOver: false,
    };

    const next = stepGame(state, 6, () => 0);
    expect(next.gameOver).toBe(true);
    expect(next.score).toBe(0);
  });

  it('壁衝突でゲームオーバーになる', () => {
    const state: GameState = {
      snake: [
        { x: 2, y: 0 },
        { x: 1, y: 0 },
      ],
      direction: 'up',
      pendingDirection: 'up',
      foods: [
        { cell: { x: 0, y: 2 }, letter: 'A', kind: 'target' },
        { cell: { x: 2, y: 2 }, letter: 'B', kind: 'dummy' },
      ],
      targetLetterIndex: 0,
      completedCycles: 0,
      dummyCount: 2,
      score: 0,
      gameOver: false,
    };

    const next = stepGame(state, 3, () => 0);
    expect(next.gameOver).toBe(true);
  });

  it('自己衝突でゲームオーバーになる', () => {
    const state: GameState = {
      snake: [
        { x: 2, y: 2 },
        { x: 2, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
      ],
      direction: 'up',
      pendingDirection: 'up',
      foods: [
        { cell: { x: 4, y: 4 }, letter: 'D', kind: 'target' },
        { cell: { x: 5, y: 5 }, letter: 'A', kind: 'dummy' },
      ],
      targetLetterIndex: 3,
      completedCycles: 0,
      dummyCount: 2,
      score: 2,
      gameOver: false,
    };

    const next = stepGame(state, 6, () => 0);
    expect(next.gameOver).toBe(true);
  });
});
