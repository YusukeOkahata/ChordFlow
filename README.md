# ChordFlow 開発者向け README

本ファイルは `script.js` および `movePage.js` に関する開発者向けの仕様・関数・変数の説明書です。

---

## 1. 定数・変数（共通）

### script.js 側

| 変数/定数                    | 説明                           |
| ---------------------------- | ------------------------------ |
| `NOTES_SHARP` / `NOTES_FLAT` | シャープ／フラット表記の全音階 |
| `MAJOR_SCALE_INTERVALS`      | メジャースケールの音程（半音） |
| `ROMAN_NUMERALS`             | I〜VII のローマ数字            |
| `NOTE_FREQS`                 | 音名 → 周波数マッピング        |
| `playSoundTime`              | デフォルト再生時間（ms）       |
| `audioCtx`                   | Web Audio API の AudioContext  |
| `activeOscillators`          | 再生中の Oscillator 配列       |
| `scheduledTimeouts`          | 再生用タイマー ID 管理         |
| `currentPlayingSection`      | 現在再生中のセクション DOM     |

### movePage.js 側

| 変数                   | 説明                               |
| ---------------------- | ---------------------------------- |
| `isSaved`              | 現在の作業が保存済みかどうか       |
| `isInternalNavigation` | ページ内リンク遷移かどうかのフラグ |

---

## 2. script.js 機能概要

### 2-1. スケール計算・表示

- `prettyNote(note: string) → string`
  - 音名を ♯/♭ に変換
- `populateKeyOptions(notation: "sharp"|"flat")`
  - キー選択セレクトの初期化
- `computeScale(key: string, notation: "sharp"|"flat") → string[]`
  - 選択キー・表記からスケール配列を生成
- `renderScale()`
  - スケールブロックを DOM に描画
  - `.roman`：ローマ数字
  - `.note`：音名
  - `.function`：T/SD/D

### 2-2. 小節管理

- `addMeasure(container: HTMLElement, measureData?: {roman: string, code: string})`
  - 小節追加・初期値設定
  - ローマ数字・コード入力の相互補完

### 2-3. セクション管理

- `addSection(name?: string, sectionData?: Array<{roman: string, code: string}>)`
  - セクション追加
  - ヘッダーに:
    - タイトル入力
    - コード再生 / 単音再生ボタン
    - 小節追加ボタン
    - 削除ボタン
  - 小節コンテナ初期化

### 2-4. 音再生

- `getAudioContext() → AudioContext`
  - AudioContext 取得
- `noteToFreq(note: string, oct?: number) → number`
  - 音名 → 周波数
- `parseChordToNotes(code: string) → string[]`
  - コード文字列 → ルート+3 度+5 度
- `playChord(notes: string[], duration?: number) → OscillatorNode[]`
  - 同時再生（和音）
- `playSingleNotes(notes: string[], duration?: number, delay?: number)`
  - アルペジオ再生
- `playSection(sectionDiv: HTMLElement, mode: "chord"|"single", button?: HTMLElement)`
  - セクション再生
- `stopPlayback()`
  - 再生停止・ハイライト解除

### 2-5. 保存・読み込み

- `exportProgression()`
  - TXT/JSON 形式で曲構成を保存
- `downloadFile(blob: Blob, filename: string)`
  - Blob をダウンロード
- `importProgressionJSON(file: File)`
  - JSON ファイル読み込み

### 2-6. 初期化

- `window.addEventListener("load", ...)`
  - キーセレクト初期化、スケール描画
  - ボタンイベント登録
  - デフォルト `"Intro"` セクション追加

---

## 3. movePage.js 機能概要（ページ離脱警告）

### 3-1. 保存状態管理

- `isSaved = false`
  - 保存ボタンが押されると `true` に
- `isInternalNavigation = false`
  - ページ内リンク遷移中は `true`

### 3-2. DOMContentLoaded 内処理

- 保存ボタン登録:
  ```js
  const saveButton = document.getElementById("saveButton");
  saveButton.addEventListener("click", () => {
    isSaved = true;
  });
  ```
