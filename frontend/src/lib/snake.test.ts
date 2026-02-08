import { describe, expect, it } from 'vitest';
import {
  createInitialState,
  getTargetLetter,
  placeTargetCell,
  stepGame,
  type GameState,
} from './snake';

describe('alphabet snake rules', () => {
  it('初期状態のターゲット文字はA', () => {
    const state = createInitialState(6, () => 0); // 乱数を固定して初期配置を安定化する。
    expect(state.targetLetterIndex).toBe(0);
    expect(getTargetLetter(state.targetLetterIndex)).toBe('A');
    expect(state.targetCell).not.toBeNull();
  });

  it('ターゲット取得時に成長・加点・文字進行する', () => {
    const state: GameState = {
      snake: [
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ],
      direction: 'right',
      pendingDirection: 'right',
      targetCell: { x: 2, y: 1 }, // 次ヘッド位置にターゲットを置く。
      targetLetterIndex: 0,
      completedCycles: 0,
      score: 0,
      gameOver: false,
    };

    const next = stepGame(state, 6, () => 0);
    expect(next.snake.length).toBe(3);
    expect(next.score).toBe(1);
    expect(next.targetLetterIndex).toBe(1);
    expect(getTargetLetter(next.targetLetterIndex)).toBe('B');
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
      targetCell: { x: 5, y: 5 }, // 到達しない位置に置く。
      targetLetterIndex: 0,
      completedCycles: 0,
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
      targetCell: { x: 2, y: 1 }, // 取得を確実に発生させる。
      targetLetterIndex: 25,
      completedCycles: 0,
      score: 10,
      gameOver: false,
    };

    const next = stepGame(state, 6, () => 0);
    expect(next.targetLetterIndex).toBe(0);
    expect(getTargetLetter(next.targetLetterIndex)).toBe('A');
    expect(next.completedCycles).toBe(1);
    expect(next.score).toBe(11);
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

  it('壁衝突でゲームオーバーになる', () => {
    const state: GameState = {
      snake: [
        { x: 2, y: 0 },
        { x: 1, y: 0 },
      ],
      direction: 'up',
      pendingDirection: 'up',
      targetCell: { x: 0, y: 2 },
      targetLetterIndex: 0,
      completedCycles: 0,
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
      targetCell: { x: 4, y: 4 },
      targetLetterIndex: 3,
      completedCycles: 0,
      score: 2,
      gameOver: false,
    };

    const next = stepGame(state, 6, () => 0);
    expect(next.gameOver).toBe(true);
  });
});
