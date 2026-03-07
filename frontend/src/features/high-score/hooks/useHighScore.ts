import { useCallback, useEffect, useReducer, type Dispatch } from 'react';
import { fetchHighScore, submitHighScore } from '@/features/high-score/api/highScoreApi';

const CONNECTION_ERROR = 'バックエンドに接続できません。';
const UPDATE_ERROR = 'ハイスコア更新に失敗しました。';

type HighScoreState = {
  highScore: number | null;
  apiError: string | null;
};

type HighScoreAction =
  | { type: 'load_succeeded'; highScore: number }
  | { type: 'load_failed' }
  | { type: 'submit_succeeded'; highScore: number }
  | { type: 'submit_failed' };

type UseHighScoreResult = {
  highScore: number | null;
  apiError: string | null;
  refreshHighScore: () => Promise<number | null>;
  submitScore: (score: number) => Promise<number | null>;
};

const initialState: HighScoreState = {
  highScore: null,
  apiError: null,
};

function highScoreReducer(state: HighScoreState, action: HighScoreAction): HighScoreState {
  switch (action.type) {
    case 'load_succeeded':
    case 'submit_succeeded':
      return {
        highScore: action.highScore,
        apiError: null,
      };
    case 'load_failed':
      return {
        ...state,
        apiError: CONNECTION_ERROR,
      };
    case 'submit_failed':
      return {
        ...state,
        apiError: UPDATE_ERROR,
      };
    default:
      return state;
  }
}

async function loadHighScore(dispatch: Dispatch<HighScoreAction>): Promise<number | null> {
  try {
    const nextHighScore = await fetchHighScore();
    dispatch({ type: 'load_succeeded', highScore: nextHighScore });
    return nextHighScore;
  } catch {
    dispatch({ type: 'load_failed' });
    return null;
  }
}

async function persistHighScore(
  score: number,
  dispatch: Dispatch<HighScoreAction>,
): Promise<number | null> {
  try {
    const nextHighScore = await submitHighScore(score);
    dispatch({ type: 'submit_succeeded', highScore: nextHighScore });
    return nextHighScore;
  } catch {
    dispatch({ type: 'submit_failed' });
    return null;
  }
}

export function useHighScore(): UseHighScoreResult {
  const [{ highScore, apiError }, dispatch] = useReducer(highScoreReducer, initialState);

  const refreshHighScore = useCallback(() => {
    return loadHighScore(dispatch);
  }, [dispatch]);

  const submitScore = useCallback((score: number) => {
    return persistHighScore(score, dispatch);
  }, [dispatch]);

  useEffect(() => {
    void loadHighScore(dispatch);
  }, [dispatch]);

  return {
    highScore,
    apiError,
    refreshHighScore,
    submitScore,
  };
}
