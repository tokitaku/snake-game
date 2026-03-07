import { describe, expect, it } from 'vitest';
import {
  createInitialState,
  getTargetLetter,
  placeFoods,
  placeTargetCell,
  setDirection,
  stepGame,
  type GameState,
} from '@/features/snake-game/model/snake';
import { DEFAULT_SETTINGS } from '@/features/snake-game/model/settings';

describe('snake model', () => {
  it('初期状態で正解1個とダミー2個が配置される', () => {
    const state = createInitialState(6, DEFAULT_SETTINGS, () => 0); // 乱数を固定して初期配置を安定化する。

    expect(state.snake).toEqual([
      { x: 3, y: 3 },
      { x: 2, y: 3 },
    ]);
    expect(state.direction).toBe('right');
    expect(state.pendingDirection).toBe('right');
    expect(state.targetLetterIndex).toBe(0);
    expect(getTargetLetter(state.targetLetterIndex)).toBe('A');
    expect(state.dummyCount).toBe(2);
    expect(state.foods).toHaveLength(3);
    expect(state.foods.filter((food) => food.kind === 'target')).toHaveLength(1);
    expect(state.foods.filter((food) => food.kind === 'dummy')).toHaveLength(2);
    expect(state.score).toBe(0);
    expect(state.gameOver).toBe(false);
  });

  it('setDirection は逆方向入力を無視する', () => {
    const initialState = createInitialState(6, DEFAULT_SETTINGS, () => 0);

    const ignoredState = setDirection(initialState, 'left');
    const updatedState = setDirection(initialState, 'up');

    expect(ignoredState).toBe(initialState);
    expect(updatedState.pendingDirection).toBe('up');
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
        { cell: { x: 4, y: 4 }, letter: 'B', kind: 'dummy' },
        { cell: { x: 3, y: 3 }, letter: 'C', kind: 'dummy' },
      ],
      targetLetterIndex: 0,
      completedCycles: 0,
      dummyCount: 2,
      score: 0,
      gameOver: false,
    };

    const nextState = stepGame(state, 10);

    expect(nextState.snake).toEqual([
      { x: 2, y: 1 },
      { x: 1, y: 1 },
    ]);
    expect(nextState.score).toBe(0);
    expect(nextState.targetLetterIndex).toBe(0);
    expect(nextState.gameOver).toBe(false);
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

    const nextState = stepGame(state, 6, () => 0);

    expect(nextState.snake).toHaveLength(3);
    expect(nextState.score).toBe(1);
    expect(nextState.targetLetterIndex).toBe(1);
    expect(getTargetLetter(nextState.targetLetterIndex)).toBe('B');
    expect(nextState.foods.filter((food) => food.kind === 'dummy')).toHaveLength(2);
    expect(nextState.gameOver).toBe(false);
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

    const nextState = stepGame(state, 6, () => 0);

    expect(nextState.targetLetterIndex).toBe(0);
    expect(getTargetLetter(nextState.targetLetterIndex)).toBe('A');
    expect(nextState.completedCycles).toBe(1);
    expect(nextState.score).toBe(11);
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
    const dummyLetters =
      foods?.filter((food) => food.kind === 'dummy').map((food) => food.letter) ?? [];

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

    const nextState = stepGame(state, 6, () => 0);

    expect(nextState.gameOver).toBe(true);
    expect(nextState.score).toBe(0);
  });

  it('壁衝突と自己衝突を gameOver にする', () => {
    const wallState: GameState = {
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
    const selfHitState: GameState = {
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

    expect(stepGame(wallState, 3).gameOver).toBe(true);
    expect(stepGame(selfHitState, 6).gameOver).toBe(true);
  });

  it('盤面を埋めたら food なしで終了する', () => {
    const state: GameState = {
      snake: [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ],
      direction: 'right',
      pendingDirection: 'right',
      foods: [{ cell: { x: 1, y: 0 }, letter: 'A', kind: 'target' }],
      targetLetterIndex: 0,
      completedCycles: 0,
      dummyCount: 2,
      score: 2,
      gameOver: false,
    };

    const nextState = stepGame(state, 2, () => 0);

    expect(nextState.snake).toHaveLength(4);
    expect(nextState.foods).toHaveLength(0);
    expect(nextState.score).toBe(3);
    expect(nextState.gameOver).toBe(true);
  });
});
