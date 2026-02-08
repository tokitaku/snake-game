import type { GameSettings, GameSpeed, QuestionFormat } from './lib/settings';
import { QUESTION_FORMAT_LABELS, SPEED_LABELS } from './lib/settings';

type SettingsProps = {
  isOpen: boolean;
  settings: GameSettings;
  onClose: () => void;
  onSave: (settings: GameSettings) => void;
};

export function Settings({ isOpen, settings, onClose, onSave }: SettingsProps) {
  if (!isOpen) {
    return null;
  }

  const handleSpeedChange = (speed: GameSpeed) => {
    onSave({ ...settings, speed });
  };

  const handleQuestionFormatChange = (questionFormat: QuestionFormat) => {
    onSave({ ...settings, questionFormat });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-stone-300 bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">設定 (Settings)</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-stone-500 hover:bg-stone-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-medium text-stone-700">移動速度 (Speed)</h3>
            <div className="space-y-2">
              {(Object.keys(SPEED_LABELS) as GameSpeed[]).map((speed) => (
                <label key={speed} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="speed"
                    value={speed}
                    checked={settings.speed === speed}
                    onChange={() => handleSpeedChange(speed)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{SPEED_LABELS[speed]}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-stone-700">出題形式 (Question Format)</h3>
            <div className="space-y-2">
              {(Object.keys(QUESTION_FORMAT_LABELS) as QuestionFormat[]).map((format) => (
                <label key={format} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="questionFormat"
                    value={format}
                    checked={settings.questionFormat === format}
                    onChange={() => handleQuestionFormatChange(format)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{QUESTION_FORMAT_LABELS[format]}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-stone-300 bg-stone-100 px-4 py-2 text-sm hover:bg-stone-200"
          >
            閉じる (Close)
          </button>
        </div>
      </div>
    </div>
  );
}
