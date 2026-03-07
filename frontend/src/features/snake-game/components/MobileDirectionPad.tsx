import type { Direction } from '@/features/snake-game/model/snake';

type MobileDirectionPadProps = {
  onDirection: (direction: Direction) => void;
};

export function MobileDirectionPad({ onDirection }: MobileDirectionPadProps) {
  return (
    <section className="mt-4 grid gap-2 md:hidden">
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => onDirection('up')}
          className="rounded-md border border-stone-300 bg-stone-100 px-4 py-2 text-sm"
        >
          Up
        </button>
      </div>
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => onDirection('left')}
          className="rounded-md border border-stone-300 bg-stone-100 px-4 py-2 text-sm"
        >
          Left
        </button>
        <button
          type="button"
          onClick={() => onDirection('down')}
          className="rounded-md border border-stone-300 bg-stone-100 px-4 py-2 text-sm"
        >
          Down
        </button>
        <button
          type="button"
          onClick={() => onDirection('right')}
          className="rounded-md border border-stone-300 bg-stone-100 px-4 py-2 text-sm"
        >
          Right
        </button>
      </div>
    </section>
  );
}
