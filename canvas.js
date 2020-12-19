(function () {
  const button_width = 105; // 編成詳細ボタン幅
  const button_height = 43; // 編成詳細ボタン高さ
  const button_lefttop = [ // 編成詳細ボタン位置
    { x: 431, y: 301 },
    { x: 431, y: 469 },
    { x: 431, y: 637 },
    { x: 944, y: 301 },
    { x: 944, y: 469 },
    { x: 944, y: 637 },
  ];

  const max_quick_capture = 6;

  let capture_count = 0;
  let invalid_click_count = 0; // キャプチャ無効クリック数
  let delay_time = 0;
  let is_quickcapture = false;

  window.addEventListener('click', (event) => {
    if (event.button === 0 && is_quickcapture) {
      if (invalid_click_count === 0 && checkButtonPoint(event.offsetX, event.offsetY)) {
        setTimeout(() => {
          chrome.runtime.sendMessage({ type: "capture" });
          capture_count++;
          invalid_click_count = 1;
          if (capture_count >= max_quick_capture) {
            is_quickcapture = false;
          };
        }, delay_time);
      }
      else {
        // 編成詳細閉じるクリックは無視する
        if (invalid_click_count > 0) {
          invalid_click_count--;
        }
      }
    }
  });

  window.addEventListener('blur', (event) => {
    if (capture_count > 0) {
      //chrome.runtime.sendMessage({ type: "output" });
      is_quickcapture = false;
    }
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'canvas') {
      // キャプチャする前にフレームバッファが削除されないようにする為の処理
      window.requestAnimationFrame(function () {
        const canvas = document.querySelectorAll('canvas');
        const image_data = canvas[0].toDataURL('image/png');

        const edit = document.querySelector('#r_editbox');
        const edit_text = edit ? edit.value : "";
        console.log("r_editbox:" + edit.value);

        chrome.runtime.sendMessage({ type: "image_data", data: image_data, mode: request.mode, text: edit_text });
      });
    }
    if (request.type === 'quickx6') {
      capture_count = 0;
      invalid_click_count = 0;
      getDelay((val) => {
        delay_time = val;
        is_quickcapture = true;
      });
    }
    if (request.type === 'quickx6_cancel') {
      is_quickcapture = false;
    }
  });

  function getDelay(next_process) {
    chrome.storage.local.get("quick_delay", (res) => {
      if (!res.quick_delay) {
        res.quick_delay = 200;
      }
      next_process(res.quick_delay);
    });
  }

  /**
   * 編成詳細ボタンの位置確認
   */
  function checkButtonPoint(x, y) {
    for (point of button_lefttop) {
      if (
        x >= point.x && x <= (point.x + button_width) &&
        y >= point.y && y <= (point.y + button_height)) {
        return true;
      }
    }
    return false;
  }
})();
