// ===== script.js（コード再生＋単音再生対応版） =====

// 定数
const NOTES_SHARP = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
const NOTES_FLAT = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"];
const NOTE_FREQS = {
  C: 261.63,
  "C#": 277.18,
  Db: 277.18,
  D: 293.66,
  "D#": 311.13,
  E: 329.63,
  F: 349.23,
  "F#": 369.99,
  G: 392.0,
  "G#": 415.3,
  Ab: 415.3,
  A: 440.0,
  "A#": 466.16,
  Bb: 466.16,
  B: 493.88,
};

const playSoundTime = 1000;

// ===== ヘルパー =====
function prettyNote(note) {
  return note.replace("b", "♭").replace("#", "♯");
}
function populateKeyOptions(notation) {
  const keySelect = document.getElementById("keySelect");
  keySelect.innerHTML = "";
  const notes = notation === "flat" ? NOTES_FLAT : NOTES_SHARP;
  notes.forEach((n) => {
    const opt = document.createElement("option");
    opt.value = n;
    opt.textContent = prettyNote(n);
    keySelect.appendChild(opt);
  });
}
function computeScale(key, notation) {
  let idx = NOTES_SHARP.indexOf(key);
  if (idx === -1) idx = NOTES_FLAT.indexOf(key);
  if (idx === -1) return [];
  const outNotes = notation === "flat" ? NOTES_FLAT : NOTES_SHARP;
  return MAJOR_SCALE_INTERVALS.map((i) => prettyNote(outNotes[(idx + i) % 12]));
}

// ===== スケール表示 =====
function renderScale() {
  const notation = document.getElementById("notationSelect").value;
  const key = document.getElementById("keySelect").value;
  const scaleDiv = document.getElementById("scaleDisplay");
  scaleDiv.innerHTML = "";

  const scale = computeScale(key, notation);
  const functions = ["T", "SD", "T", "SD", "D", "T", "D"]; // 機能（トニック/サブドミナント/ドミナント）

  for (let i = 0; i < ROMAN_NUMERALS.length; i++) {
    const block = document.createElement("div");
    block.className = "scale-block";

    const roman = document.createElement("div");
    roman.className = "roman";
    roman.textContent = ROMAN_NUMERALS[i];

    const note = document.createElement("div");
    note.className = "note";
    note.textContent = scale[i] || "";

    const func = document.createElement("div");
    func.className = "function";
    func.textContent = functions[i];

    block.appendChild(roman);
    block.appendChild(note);
    block.appendChild(func);

    scaleDiv.appendChild(block);
  }
}

// ===== 小節追加 =====
function addMeasure(container, measureData = null) {
  if (container.children.length > 0) {
    const arrow = document.createElement("div");
    arrow.className = "arrow";
    arrow.textContent = "→";
    container.appendChild(arrow);
  }
  const measure = document.createElement("div");
  measure.className = "measure";

  const romanSelect = document.createElement("select");
  romanSelect.innerHTML = "<option value=''></option>";
  ROMAN_NUMERALS.forEach((r) => {
    const opt = document.createElement("option");
    opt.value = r;
    opt.textContent = r;
    romanSelect.appendChild(opt);
  });

  const romanInput = document.createElement("input");
  romanInput.placeholder = "度数";
  romanInput.className = "roman-input";
  const chordInput = document.createElement("input");
  chordInput.type = "text";
  chordInput.placeholder = "コード (例: G7, B♭, F#m7)";
  chordInput.className = "code-input";

  // 補完
  romanSelect.addEventListener("change", () => {
    const sel = romanSelect.value;
    const idx = ROMAN_NUMERALS.indexOf(sel);
    if (idx === -1) {
      chordInput.value = "";
      return;
    }
    const notation = document.getElementById("notationSelect").value;
    const key = document.getElementById("keySelect").value;
    const scale = computeScale(key, notation);
    chordInput.value = scale[idx] || "";
    romanInput.value = sel;
  });
  romanInput.addEventListener("input", () => {
    const val = romanInput.value.toUpperCase().trim();
    const idx = ROMAN_NUMERALS.indexOf(val);
    if (idx !== -1) {
      const notation = document.getElementById("notationSelect").value;
      const key = document.getElementById("keySelect").value;
      const scale = computeScale(key, notation);
      chordInput.value = scale[idx] || "";
      romanSelect.value = val;
    }
  });
  chordInput.addEventListener("input", () => {
    const val = chordInput.value.trim();
    if (!val) return;
    const notation = document.getElementById("notationSelect").value;
    const key = document.getElementById("keySelect").value;
    const scale = computeScale(key, notation);
    const found = scale.indexOf(val);
    if (found !== -1) {
      romanSelect.value = ROMAN_NUMERALS[found];
      romanInput.value = ROMAN_NUMERALS[found];
    }
  });

  if (measureData) {
    romanSelect.value = measureData.roman || "";
    romanInput.value = measureData.roman || "";
    chordInput.value = measureData.code || "";
  }

  measure.appendChild(romanSelect);
  measure.appendChild(romanInput);
  measure.appendChild(chordInput);
  container.appendChild(measure);
}

// ===== セクション追加 =====
function addSection(name = "セクション", sectionData = null) {
  const container = document.getElementById("sectionsContainer");
  const section = document.createElement("div");
  section.className = "section";
  const header = document.createElement("div");
  header.className = "section-header";

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.value = name;
  titleInput.className = "section-title";

  // ▶ コード再生
  const playChordBtn = document.createElement("button");
  playChordBtn.textContent = "🎶 コード再生";
  playChordBtn.dataset.type = "chord";
  playChordBtn.dataset.state = "stopped";
  playChordBtn.addEventListener("click", () => {
    if (playChordBtn.dataset.state === "playing") {
      stopPlayback();
    } else {
      playSection(section, "chord", playChordBtn);
    }
  });

  // ▶ 単音再生
  const playSingleBtn = document.createElement("button");
  playSingleBtn.textContent = "🎵 単音再生";
  playSingleBtn.dataset.type = "single";
  playSingleBtn.dataset.state = "stopped";
  playSingleBtn.addEventListener("click", () => {
    if (playSingleBtn.dataset.state === "playing") {
      stopPlayback();
    } else {
      playSection(section, "single", playSingleBtn);
    }
  });

  const addMeasureBtn = document.createElement("button");
  addMeasureBtn.className = "addMeasureBtn";
  addMeasureBtn.textContent = "＋ 小節追加";

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "✖ 削除";
  deleteBtn.style.background = "#ef4444";
  deleteBtn.style.marginLeft = "0.5rem";
  deleteBtn.addEventListener("click", () => {
    if (confirm(`「${titleInput.value}」を削除してよろしいですか？`)) {
      sectionsContainer.removeChild(section);
    }
  });

  header.appendChild(titleInput);
  header.appendChild(playChordBtn);
  header.appendChild(playSingleBtn);
  header.appendChild(addMeasureBtn);
  header.appendChild(deleteBtn);

  const measures = document.createElement("div");
  measures.className = "measures";
  section.appendChild(header);
  section.appendChild(measures);
  container.appendChild(section);

  addMeasureBtn.addEventListener("click", () => addMeasure(measures));
  playChordBtn.addEventListener("click", () => playSection(section, "chord"));
  playSingleBtn.addEventListener("click", () => playSection(section, "single"));

  if (sectionData && sectionData.length) {
    sectionData.forEach((m) => addMeasure(measures, m));
  } else {
    addMeasure(measures);
  }
}

// ===== 音再生 =====
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx)
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function noteToFreq(note, oct = 0) {
  const base = NOTE_FREQS[note];
  if (!base) return null;
  return base * Math.pow(2, oct);
}

// 再生中の音を管理する
let activeOscillators = [];
let scheduledTimeouts = []; // 予約したsetTimeoutを管理
let currentPlayingSection = null; // 再生中のセクションを記録

// playChord（返り値でOscillatorを保持）
function playChord(notes, duration = 2) {
  const ctx = getAudioContext();
  const oscs = [];

  notes.forEach((note) => {
    const freq = noteToFreq(note);
    if (!freq) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);

    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(gain).connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);

    oscs.push(osc);
  });

  // 今回鳴らしたOscillatorを管理リストに保存
  activeOscillators.push(...oscs);

  return oscs;
}
//アルペジオ再生
function playSingleNotes(notes, duration = 0.5, delay = 0.5) {
  const ctx = getAudioContext();
  notes.forEach((n, i) => {
    const freq = noteToFreq(n);
    if (!freq) return;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime + i * delay);
    osc.connect(gain).connect(ctx.destination);
    osc.frequency.value = freq;
    osc.start(ctx.currentTime + i * delay);
    osc.stop(ctx.currentTime + i * delay + duration);
  });
}
function parseChordToNotes(code) {
  if (!code) return [];
  const root = code.match(/[A-G](#|b)?/);
  if (!root) return [];
  const rootNote = root[0];
  const scale = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const idx = scale.findIndex(
    (n) =>
      n === rootNote ||
      n.replace("#", "♯") === rootNote ||
      n.replace("b", "♭") === rootNote
  );
  if (idx === -1) return [rootNote];
  const third = scale[(idx + 4) % 12];
  const fifth = scale[(idx + 7) % 12];
  return [rootNote, third, fifth];
}

// セクションを再生する（setTimeout版、構造は変えない）
const PLAY_INTERVAL = 1000; // ← 再生間隔（ms）

function playSection(sectionDiv, mode = "chord", button) {
  const measures = sectionDiv.querySelectorAll(".measure");
  let time = 0;

  // 再生前に既存を停止
  stopPlayback();

  currentPlayingSection = sectionDiv;

  measures.forEach((measure) => {
    const code = measure.querySelector(".code-input").value;
    const notes = parseChordToNotes(code);

    const timeoutId = setTimeout(() => {
      // 前の小節のハイライト解除
      sectionDiv
        .querySelectorAll(".measure")
        .forEach((m) => m.classList.remove("playing"));

      // 今の小節をハイライト
      measure.classList.add("playing");

      // 前の音を止める
      activeOscillators.forEach((osc) => {
        try {
          osc.stop();
        } catch (e) {}
      });
      activeOscillators = [];

      // 再生
      if (mode === "chord") {
        playChord(notes, PLAY_INTERVAL / 1000);
      } else if (mode === "Arpeggio") {
        //アルペジオ再生（今は無効化）
        // playSingleNotes(notes, 0.5, 0.6);
      } else {
        playChord([notes[0]], PLAY_INTERVAL / 1000);
      }
    }, time * PLAY_INTERVAL);

    scheduledTimeouts.push(timeoutId);
    time++;
  });

  // 再生完了後に停止状態へ戻す
  const finalTimeout = setTimeout(() => {
    stopPlayback();
  }, measures.length * PLAY_INTERVAL);
  scheduledTimeouts.push(finalTimeout);

  // ボタンを「停止」に切り替え
  if (button) {
    button.textContent = "⏹ 停止";
    button.dataset.mode = mode;
    button.dataset.state = "playing";
  }
}

//再生停止
function stopPlayback() {
  // タイマーを全停止
  scheduledTimeouts.forEach((id) => clearTimeout(id));
  scheduledTimeouts = [];

  // 音を止める
  activeOscillators.forEach((osc) => {
    try {
      osc.stop();
    } catch (e) {}
  });
  activeOscillators = [];

  // ハイライト解除
  document
    .querySelectorAll(".measure.playing")
    .forEach((m) => m.classList.remove("playing"));

  // ボタンを再生に戻す
  if (currentPlayingSection) {
    const playChordBtn = currentPlayingSection.querySelector(
      "button[data-type='chord']"
    );
    const playSingleBtn = currentPlayingSection.querySelector(
      "button[data-type='single']"
    );

    if (playChordBtn) {
      playChordBtn.textContent = "🎶 コード再生";
      playChordBtn.dataset.state = "stopped";
    }
    if (playSingleBtn) {
      playSingleBtn.textContent = "🎵 単音再生";
      playSingleBtn.dataset.state = "stopped";
    }
  }

  currentPlayingSection = null;
}

// ===== 保存処理（TXT/JSON対応） =====
function exportProgression() {
  const sections = document.querySelectorAll(".section");
  const data = [];
  sections.forEach((section) => {
    const sectionName = section.querySelector(".section-title").value;
    const measures = [];
    section.querySelectorAll(".measure").forEach((m) => {
      measures.push({
        roman: m.querySelector(".roman-input")?.value || "",
        code: m.querySelector(".code-input")?.value || "",
      });
    });
    data.push({ sectionName, measures });
  });

  const format = document.getElementById("saveFormat")?.value || "json";

  if (format === "json") {
    // JSONとして保存
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    downloadFile(blob, "chord_progression.json");
  } else {
    // TXTとして保存（読みやすく整形）
    let txtContent = "";
    data.forEach((s) => {
      txtContent += `■ ${s.sectionName}\n`;

      const measureTexts = s.measures.map(
        (m) => `${m.roman || ""}：${m.code || ""}`
      );

      // コード進行を「→」でつなぐ
      txtContent += measureTexts.join(" → ") + "\n\n";
    });

    const blob = new Blob([txtContent], { type: "text/plain" });
    downloadFile(blob, "chord_progression.txt");
  }
}

function downloadFile(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ===== JSONインポート =====
function importProgressionJSON(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      const container = document.getElementById("sectionsContainer");
      data.forEach((s) => addSection(s.sectionName, s.measures));
    } catch (err) {
      alert("JSON読み込み失敗");
      console.error(err);
    }
  };
  reader.readAsText(file);
}

// ===== 初期化 =====
window.addEventListener("load", () => {
  const notationSelect = document.getElementById("notationSelect");
  const keySelect = document.getElementById("keySelect");
  const addSectionBtn = document.getElementById("addSectionBtn");
  const exportBtn = document.getElementById("exportBtn");
  const importInput = document.getElementById("importFile");
  const importBtn = document.getElementById("importBtn");

  populateKeyOptions(notationSelect.value || "sharp");
  renderScale();
  notationSelect.addEventListener("change", () => {
    populateKeyOptions(notationSelect.value);
    renderScale();
  });
  keySelect.addEventListener("change", renderScale);
  if (addSectionBtn)
    addSectionBtn.addEventListener("click", () => addSection());
  if (exportBtn) exportBtn.addEventListener("click", exportProgression);
  if (importBtn && importInput) {
    importBtn.addEventListener("click", () => importInput.click());
    importInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) importProgressionJSON(e.target.files[0]);
    });
  }
  addSection("Intro");
});
