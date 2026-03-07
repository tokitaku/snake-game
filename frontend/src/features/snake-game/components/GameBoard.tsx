import { useMemo } from 'react';
import type { FoodItem, Point } from '@/features/snake-game/model/snake';

type CellType = 'empty' | 'head' | 'body' | 'food';
type SnakeCellType = 'head' | 'body';

type GameBoardProps = {
  snake: Point[];
  foods: FoodItem[];
  gridSize: number;
};

export function GameBoard({ snake, foods, gridSize }: GameBoardProps) {
  const snakeCells = useMemo(() => {
    const cellMap = new Map<string, SnakeCellType>();

    snake.forEach((segment, index) => {
      const key = `${segment.x},${segment.y}`;
      cellMap.set(key, index === 0 ? 'head' : 'body');
    });

    return cellMap;
  }, [snake]);

  const foodCells = useMemo(() => {
    const cellMap = new Map<string, FoodItem>();

    foods.forEach((food) => {
      const key = `${food.cell.x},${food.cell.y}`;
      cellMap.set(key, food);
    });

    return cellMap;
  }, [foods]);

  const cells = useMemo(() => {
    return Array.from({ length: gridSize * gridSize }, (_, index) => {
      const x = index % gridSize;
      const y = Math.floor(index / gridSize);
      const key = `${x},${y}`;

      let type: CellType = 'empty';
      const snakeType = snakeCells.get(key);
      const food = foodCells.get(key);

      if (food) {
        type = 'food';
      }

      if (snakeType) {
        type = snakeType;
      }

      let className = 'h-4 w-4 border border-stone-200 bg-board sm:h-5 sm:w-5';
      let content: string | null = null;

      if (type === 'food') {
        className =
          'grid h-4 w-4 place-items-center border border-stone-200 bg-amber-300 text-[10px] font-bold text-stone-900 sm:h-5 sm:w-5 sm:text-xs';
        content = food?.letter ?? null;
      }

      if (type === 'body') {
        className = 'h-4 w-4 border border-stone-200 bg-snake sm:h-5 sm:w-5';
      }

      if (type === 'head') {
        className = 'h-4 w-4 border border-stone-200 bg-snake-head sm:h-5 sm:w-5';
      }

      return (
        <div key={key} className={className}>
          {content}
        </div>
      );
    });
  }, [foodCells, gridSize, snakeCells]);

  return (
    <div
      className="grid overflow-hidden rounded border border-stone-300 bg-board"
      style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
    >
      {cells}
    </div>
  );
}
