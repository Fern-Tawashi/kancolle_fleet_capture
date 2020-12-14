(function () {
  /** リピート入力防止 */
  var is_key_down = false;

  /** キャンセル用 */
  var popup_timer_id = null;

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
    chrome.runtime.sendMessage({ type: "clear" });
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'popup') {
      showPopup(request.data.image);
    }
  });

  function showPopup(img_src) {
    // ※spell
    const eid = "ext-kancorre-fleet-capture-popup";
    const styles = [
      "width: 120px;",
      "height: 120px;",
      "border: 4px solid lightgray;",
      "background: #fff;",
      "padding: 0;",
      "position: fixed;",
      "left: 0;",
      "bottom: 0;",
    ];

    let div = document.getElementById(eid);
    if (div != null) {
      div.remove();
      if (popup_timer_id != null) {
        clearTimeout(popup_timer_id);
      }
    }

    div = document.createElement('div');
    div.setAttribute("id", eid);
    div.setAttribute("style", styles.join(" "));

    const img = document.createElement('img');
    img.src = img_src || null_image;
    div.appendChild(img);

    document.querySelector('body').appendChild(div);

    popup_timer_id = setTimeout(() => {
      div.remove();
    }, 1000);
  }

  /** null対策画像 */
  const null_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACAQMAAABIeJ9nAAAAB3RJTUUH5AwOAigSyU5iigAAABd0RVh0U29mdHdhcmUAR0xEUE5HIHZlciAzLjRxhaThAAAACHRwTkdHTEQzAAAAAEqAKR8AAAAEZ0FNQQAAsY8L/GEFAAAABlBMVEX///8AAABVwtN+AAAAAWJLR0T/pQfyxQAAAAxJREFUeJxjmMFQAAACPAEJggzeRwAAAABJRU5ErkJggg==";
})();
