// ===== ダークモード切り替え =====
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("themeToggle");
  const body = document.body;

  // 初期状態の読み込み
  const savedTheme = localStorage.getItem("theme") || "light";
  body.classList.add(`${savedTheme}-mode`);
  toggleBtn.textContent =
    savedTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";

  // トグル操作
  toggleBtn.addEventListener("click", () => {
    const currentTheme = body.classList.contains("dark-mode")
      ? "dark"
      : "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    body.classList.remove(`${currentTheme}-mode`);
    body.classList.add(`${newTheme}-mode`);
    toggleBtn.textContent =
      newTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";

    // 保存
    localStorage.setItem("theme", newTheme);
  });
});
