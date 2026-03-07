# アルファベット順収集版 Snake ゲーム設計

## 1. 目的
- 既存の「餌を取って伸びる Snake」を、`A -> B -> C ... -> Z` の順に文字を取得するルールへ変更する。
- 既存の操作感（移動、壁衝突、自己衝突、ポーズ、リスタート、ハイスコア投稿）は維持する。

## 2. スコープ
- 対象: フロントエンドのゲームロジックと表示 (`frontend/src/lib/snake.ts`, `frontend/src/App.tsx`)
- 非対象: バックエンドAPI仕様変更（ハイスコアAPIは既存のまま利用）

## 3. ゲームルール
- 盤面上のターゲットは常に1文字のみ表示する。
- 初期ターゲット文字は `A`。
- ヘビの頭がターゲット文字セルに到達した場合:
  - ヘビは1マス伸びる。
  - スコアを `+1` する。
  - 次のターゲット文字へ進める（`A` 取得後は `B`）。
  - 次ターゲット文字の座標を再配置する（蛇と重ならないセル）。
- ターゲット未取得時は既存同様に通常移動（末尾を1つ削る）。
- 壁衝突・自己衝突でゲームオーバー。
- `Z` 取得後は `A` に戻して継続する（ループ仕様）。

## 4. 状態モデル
`GameState` を以下へ変更する。

- 維持:
  - `snake: Point[]`
  - `direction: Direction`
  - `pendingDirection: Direction`
  - `score: number`
  - `gameOver: boolean`
- 変更:
  - `food: Point | null` を削除し、以下を追加
    - `targetCell: Point | null`
    - `targetLetterIndex: number` (`0=A` ... `25=Z`)
    - `completedCycles: number`（任意。`Z -> A` へ戻るたびに +1）

補助定数:
- `ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'`

補助関数:
- `getTargetLetter(index: number): string`
- `placeTargetCell(snake, gridSize, rng): Point | null`

## 5. ロジック設計 (`snake.ts`)
### 5.1 初期化
- `createInitialState` で以下を設定:
  - `targetLetterIndex = 0`
  - `targetCell = placeTargetCell(snake, gridSize, rng)`
  - `completedCycles = 0`（採用時）

### 5.2 1tick更新 (`stepGame`)
処理順:
1. `gameOver` ならそのまま返す。
2. 次ヘッド座標を計算。
3. 壁衝突判定。
4. ターゲット取得判定:
   - `ateTarget = targetCell != null && nextHead === targetCell`
5. 自己衝突判定:
   - `ateTarget` のときは現在の全身を判定対象
   - 未取得時は末尾を除外（既存仕様維持）
6. 次蛇配列生成:
   - 先頭に `nextHead` を追加
   - 未取得時は `pop()`
7. 取得時のみターゲット更新:
   - `nextIndex = (targetLetterIndex + 1) % 26`
   - `nextCell = placeTargetCell(nextSnake, gridSize, rng)`
   - `score + 1`
   - `targetLetterIndex` 更新
   - `targetCell` 更新
   - ループ時（`targetLetterIndex === 25`）に `completedCycles + 1`（採用時）
8. 非取得時は `targetCell`, `targetLetterIndex` を維持。
9. `targetCell === null` のときは終了（盤面が埋まった状態）。

## 6. 表示設計 (`App.tsx`)
### 6.1 ヘッダー情報
- 既存の `Score` / `High Score` に加えて以下を表示:
  - `Next Letter: {現在のターゲット文字}`
  - 任意: `Cycles: {completedCycles}`

### 6.2 盤面セル描画
- `CellType` を以下に変更:
  - `empty | head | body | target`
- `targetCell` に一致するセルに:
  - ターゲット専用背景色（例: `bg-amber-300` 相当）
  - 中央にターゲット文字 (`A` など) を表示
- 蛇セルの描画優先度は現行同様に高く維持する（同座標時は `head/body` が優先）。

### 6.3 ステータス文言
- 初期・停止・ゲームオーバー表示は既存踏襲。
- ルール説明文を更新:
  - 例: `AからZまで順番に集める`

## 7. API互換性
- スコアは整数のままなので、`fetchHighScore` / `submitHighScore` に変更は不要。
- バックエンドは非変更で互換。

## 8. テスト観点
最低限のユニットテスト対象（`snake.ts`）:
- 初期状態でターゲット文字が `A`。
- ターゲット取得で:
  - 蛇長が +1
  - スコア +1
  - 文字が1つ進む
- `Z` 取得で `A` に戻る。
- ターゲット未取得時は蛇長不変。
- ターゲット再配置が蛇と重ならない。
- 壁衝突・自己衝突の既存仕様が維持される。

## 9. 実装順序
1. `snake.ts` の状態モデルと `stepGame` を先行更新。
2. `App.tsx` の表示（`Next Letter` とターゲットセル描画）を更新。
3. `snake.ts` のユニットテストを追加・更新。
4. 手動確認（開始・移動・取得・衝突・リスタート・ハイスコア送信）。
