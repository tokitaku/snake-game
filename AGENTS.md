# Codex cli の設定

## 基本ルール
- すべての出力は日本語で行う。
- 結論→理由→次ステップの構成を守る。

## コード関連
- コード例には必ずインラインコメントを入れる。
- リファクタリング時はテストを先に実行し、失敗がないことを確認する。

## ブランチ戦略
- デフォルトブランチは `main` とし、直接コミットしない。変更は必ず作業ブランチで行う。
- Codex が作成するブランチは `codex/` を先頭に付ける。
- 機能追加は `codex/feature/<topic>`、バグ修正は `codex/fix/<topic>`、保守作業は `codex/chore/<topic>` を使う。
- `<topic>` は短い英小文字のケバブケースにする。例: `codex/feature/high-score-api`
- 緊急修正が必要で、かつ本番反映済みの `main` を起点にする場合のみ `codex/hotfix/<topic>` を使う。
- 通常の作業ブランチは最新の `main` から作成する。
- 1 ブランチ 1 目的を守り、無関係な変更を混在させない。
- プルリクエストのマージ先は原則 `main` に統一する。
- ブランチを push する前に、影響範囲のテストと lint を実行して結果を確認する。

## プルリクエスト運用
- プルリクエストのタイトルは変更内容が分かる簡潔な日本語、または Conventional Commits 形式のどちらかで統一する。
- プルリクエスト本文には目的、主な変更点、確認手順、必要ならスクリーンショットを含める。
- レビュー指摘への対応は同一ブランチで行い、別目的の修正は新しいブランチに分ける。

## Skills
A skill is a set of local instructions to follow that is stored in a `SKILL.md` file. Below is the list of skills that can be used. Each entry includes a name, description, and file path so you can open the source for full instructions when using a specific skill.
### Available skills
- gh-address-comments: Help address review/issue comments on the open GitHub PR for the current branch using gh CLI; verify gh auth first and prompt the user to authenticate if not logged in. (file: /Users/tokimasatakuya/.codex/skills/gh-address-comments/SKILL.md)
- skill-creator: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Codex's capabilities with specialized knowledge, workflows, or tool integrations. (file: /Users/tokimasatakuya/.codex/skills/.system/skill-creator/SKILL.md)
- skill-installer: Install Codex skills into $CODEX_HOME/skills from a curated list or a GitHub repo path. Use when a user asks to list installable skills, install a curated skill, or install a skill from another repo (including private repos). (file: /Users/tokimasatakuya/.codex/skills/.system/skill-installer/SKILL.md)
### How to use skills
- Discovery: The list above is the skills available in this session (name + description + file path). Skill bodies live on disk at the listed paths.
- Trigger rules: If the user names a skill (with `$SkillName` or plain text) OR the task clearly matches a skill's description shown above, you must use that skill for that turn. Multiple mentions mean use them all. Do not carry skills across turns unless re-mentioned.
- Missing/blocked: If a named skill isn't in the list or the path can't be read, say so briefly and continue with the best fallback.
- How to use a skill (progressive disclosure):
  1) After deciding to use a skill, open its `SKILL.md`. Read only enough to follow the workflow.
  2) When `SKILL.md` references relative paths (e.g., `scripts/foo.py`), resolve them relative to the skill directory listed above first, and only consider other paths if needed.
  3) If `SKILL.md` points to extra folders such as `references/`, load only the specific files needed for the request; don't bulk-load everything.
  4) If `scripts/` exist, prefer running or patching them instead of retyping large code blocks.
  5) If `assets/` or templates exist, reuse them instead of recreating from scratch.
- Coordination and sequencing:
  - If multiple skills apply, choose the minimal set that covers the request and state the order you'll use them.
  - Announce which skill(s) you're using and why (one short line). If you skip an obvious skill, say why.
- Context hygiene:
  - Keep context small: summarize long sections instead of pasting them; only load extra files when needed.
  - Avoid deep reference-chasing: prefer opening only files directly linked from `SKILL.md` unless you're blocked.
  - When variants exist (frameworks, providers, domains), pick only the relevant reference file(s) and note that choice.
- Safety and fallback: If a skill can't be applied cleanly (missing files, unclear instructions), state the issue, pick the next-best approach, and continue.
