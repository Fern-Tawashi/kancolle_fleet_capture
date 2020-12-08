// リピート入力防止
var is_key_down = false;

window.addEventListener("keydown", (event) => {
  if (!is_key_down) {
    is_key_down = true;
    key_input_event(event.code);
  }
});

window.addEventListener("keyup", (event) => {
  is_key_down = false;
});

/**
 * 誤閉じ防止
 */
window.addEventListener('beforeunload', (event) => {
  event.preventDefault();
  event.returnValue = '';
  browser.runtime.sendMessage({ type: "clear" });
});
