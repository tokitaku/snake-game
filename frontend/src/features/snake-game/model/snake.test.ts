import { describe, expect, it } from 'vitest';
import {
  createInitialState,
  setDirection,
  stepGame,
  type GameState,
} from '@/features/snake-game/model/snake';

describe('snake model', () => {
  it('createInitialState は中央開始と初期 food を返す', () => {
    const state = createInitialState(6, () => 0);

    expect(state.snake).toEqual([
      { x: 3, y: 3 },
      { x: 2, y: 3 },
    ]);
    expect(state.direction).toBe('right');
    expect(state.pendingDirection).toBe('right');
    expect(state.food).toEqual({ x: 0, y: 0 });
    expect(state.score).toBe(0);
    expect(state.gameOver).toBe(false);
  });

  it('setDirection は逆方向入力を無視する', () => {
    const initialState = createInitialState(6, () => 0);

    const ignoredState = setDirection(initialState, 'left');
    const updatedState = setDirection(initialState, 'up');

    expect(ignoredState).toBe(initialState);
    expect(updatedState.pendingDirection).toBe('up');
  });

  it('stepGame は通常移動で head を進める', () => {
    const initialState = createInitialState(6, () => 0);

    const nextState = stepGame(initialState, 6);

    expect(nextState.snake).toEqual([
      { x: 4, y: 3 },
      { x: 3, y: 3 },
    ]);
    expect(nextState.score).toBe(0);
    expect(nextState.gameOver).toBe(false);
  });

  it('stepGame は food を食べると加点し snake を伸ばす', () => {
    const state: GameState = {
      snake: [
        { x: 2, y: 2 },
        { x: 1, y: 2 },
      ],
      direction: 'right',
      pendingDirection: 'right',
      food: { x: 3, y: 2 },
      score: 0,
      gameOver: false,
    };

    const nextState = stepGame(state, 6, () => 0);

    expect(nextState.snake).toEqual([
      { x: 3, y: 2 },
      { x: 2, y: 2 },
      { x: 1, y: 2 },
    ]);
    expect(nextState.score).toBe(1);
    expect(nextState.food).toEqual({ x: 0, y: 0 });
    expect(nextState.gameOver).toBe(false);
  });

  it('stepGame は壁衝突と自己衝突を gameOver にする', () => {
    const wallState: GameState = {
      snake: [
        { x: 3, y: 1 },
        { x: 2, y: 1 },
      ],
      direction: 'right',
      pendingDirection: 'right',
      food: { x: 0, y: 0 },
      score: 0,
      gameOver: false,
    };
    const selfHitState: GameState = {
      snake: [
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 1, y: 3 },
        { x: 1, y: 2 },
        { x: 1, y: 1 },
      ],
      direction: 'up',
      pendingDirection: 'left',
      food: { x: 0, y: 0 },
      score: 0,
      gameOver: false,
    };

    expect(stepGame(wallState, 4).gameOver).toBe(true);
    expect(stepGame(selfHitState, 5).gameOver).toBe(true);
  });

  it('stepGame は盤面を埋めたら food なしで終了する', () => {
    const state: GameState = {
      snake: [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ],
      direction: 'right',
      pendingDirection: 'right',
      food: { x: 1, y: 0 },
      score: 2,
      gameOver: false,
    };

    const nextState = stepGame(state, 2, () => 0);

    expect(nextState.snake).toHaveLength(4);
    expect(nextState.food).toBeNull();
    expect(nextState.score).toBe(3);
    expect(nextState.gameOver).toBe(true);
  });
});
