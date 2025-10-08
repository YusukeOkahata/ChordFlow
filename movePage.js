let isSaved = false;
let isInternalNavigation = false; // ページ内リンクで移動中かどうか

// 保存状態をマーク（保存ボタンがある場合）
document.addEventListener("DOMContentLoaded", () => {
  const saveButton = document.getElementById("saveButton");
  if (saveButton) {
    saveButton.addEventListener("click", () => {
      isSaved = true;
    });
  }

  // ページ内リンククリック時の確認
  document.querySelectorAll("a").forEach((link) => {
    if (link.target === "_blank" || link.href.startsWith("javascript:")) return;
    link.addEventListener("click", (e) => {
      if (!isSaved) {
        const confirmLeave = confirm(
          "作業内容が保存されませんが、よろしいですか？"
        );
        if (!confirmLeave) {
          e.preventDefault();
          return;
        }
      }
      isInternalNavigation = true; // OKなら内部遷移フラグを立てる
    });
  });
});

// ウィンドウを閉じる／リロードするなどのときのみ警告
window.addEventListener("beforeunload", function (event) {
  if (!isSaved && !isInternalNavigation) {
    event.preventDefault();
    event.returnValue = "作業内容が保存されませんが、よろしいですか？";
  }
});
