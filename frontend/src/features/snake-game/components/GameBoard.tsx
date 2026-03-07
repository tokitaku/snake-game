import { useMemo } from 'react';
import type { Point } from '@/features/snake-game/model/snake';

type CellType = 'empty' | 'head' | 'body' | 'food';
type SnakeCellType = 'head' | 'body';

type GameBoardProps = {
  snake: Point[];
  food: Point | null;
  gridSize: number;
};

export function GameBoard({ snake, food, gridSize }: GameBoardProps) {
  const foodKey = food ? `${food.x},${food.y}` : null;

  const snakeCells = useMemo(() => {
    const cellMap = new Map<string, SnakeCellType>();

    snake.forEach((segment, index) => {
      const key = `${segment.x},${segment.y}`;
      cellMap.set(key, index === 0 ? 'head' : 'body');
    });

    return cellMap;
  }, [snake]);

  const cells = useMemo(() => {
    return Array.from({ length: gridSize * gridSize }, (_, index) => {
      const x = index % gridSize;
      const y = Math.floor(index / gridSize);
      const key = `${x},${y}`;

      let type: CellType = 'empty';
      const snakeType = snakeCells.get(key);

      if (foodKey === key) {
        type = 'food';
      }

      if (snakeType) {
        type = snakeType;
      }

      let className = 'h-4 w-4 border border-stone-200 bg-board sm:h-5 sm:w-5';

      if (type === 'food') {
        className = 'h-4 w-4 border border-stone-200 bg-food sm:h-5 sm:w-5';
      }

      if (type === 'body') {
        className = 'h-4 w-4 border border-stone-200 bg-snake sm:h-5 sm:w-5';
      }

      if (type === 'head') {
        className = 'h-4 w-4 border border-stone-200 bg-snake-head sm:h-5 sm:w-5';
      }

      return <div key={key} className={className} />;
    });
  }, [foodKey, gridSize, snakeCells]);

  return (
    <div
      className="grid overflow-hidden rounded border border-stone-300 bg-board"
      style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
    >
      {cells}
    </div>
  );
}
