var config = {
  x: 0,
  y: 0,
  width: 1200,
  height: 720,
  horizontal_num: 3, // 編成横アイテム数
  vertical_num: 2,   // 編成縦アイテム数
  view_type: 1,
  ss_key: ['ss1', 'ss2', 'ss3', 'ss4', 'ss5', 'ss6'],

  /**
   * load直後に参照する場合は next_process を使う
   */
  load : function(next_process) {
    chrome.storage.local.get(['layout', 'current_view_type'], (res) => {
      if (res.layout != null) {
        config.horizontal_num = (res.layout == 1) ? 2 : 3
        config.vertical_num = (res.layout == 1) ? 3 : 2
      }

      if (res.current_view_type == null) {
        res.current_view_type = 1;
      }
      config.view_type = parseInt(res.current_view_type);

      const view_type_key = "view_type_" + res.current_view_type;
      chrome.storage.local.get(view_type_key, (res) => {
        if (res[view_type_key] != null) {
          config.width = parseInt(res[view_type_key].w);
          config.height = parseInt(res[view_type_key].h);
          config.x = parseInt(res[view_type_key].x);
          config.y = parseInt(res[view_type_key].y);
        }
        console.log("config: " + config.view_type + ", " + config.horizontal_num + "x" + config.vertical_num + ", " + config.width + "x" + config.height + ", " + config.x + "x" + config.y);
        if (next_process != null) {
          next_process();
        }
      });
    });
  }
};

var screenshot = {
  content: document.createElement("canvas"),
  capture_count: 0,
  image_max_count: 0,
  image_add_count: 0,
  addition_image: 0,
  order_number: false,
  init: function () {
    const num = screenshot.image_max_count;
    const col = (num > config.horizontal_num) ? config.horizontal_num : num;
    const row = Math.floor((num - 1) / config.horizontal_num) + 1;
    screenshot.content.width = config.width * col;
    screenshot.content.height = config.height * row;
    screenshot.image_add_count = 0;
    console.log("canvas: " + screenshot.content.width + "x" + screenshot.content.height + ", " + col + "x" + row);
  },
  addImage: function (img_src, order) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = function() {
        const context = screenshot.content.getContext("2d");
        //context.mozImageSmoothingEnabled = false; 非推奨
        context.webkitImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;

        setImage(() => {
          screenshot.image_add_count++;
          console.log("add|order: " + screenshot.image_add_count + " === " + (order + 1));

          //最大枚数に達したら強制DL
          if (screenshot.image_add_count >= screenshot.image_max_count) {
            drawAddition(screenshot.addition_image, () => {
              downloadImage(screenshot.content.toDataURL());
            });
          }

          resolve();
        });

        /**
         * 画像配置
         */
        function setImage(next_process) {
          const col = order % config.horizontal_num;
          const row = Math.floor(order / config.horizontal_num);
          const dx = config.width * col;
          const dy = config.height * row;
          context.drawImage(img, dx, dy);
          drawNumber(order, dx + img.width, dy + img.height, () => {
            next_process();
          });
        }

        /**
         * 追加画像差し込み（第n艦隊）
         */
        function drawAddition(no, next_process) {
          if (no == 0) {
            next_process();
            return;
          }

          const key = "additional_file_" + no;
          chrome.storage.local.get(key, (res) => {
            if (res[key]) {
              const img = new Image();
              img.onload = () => {
                context.globalCompositeOperation = 'source-over';
                context.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
                next_process();
              };
              img.onerror = () => {
                console.log("additional image load failure");
                next_process();
              };
              img.src = res[key];
            }
            else {
              next_process();
            }
          });
        }

        /**
         * 編成番号差し込み
         */
        function drawNumber(order, right_bottom_x, right_bottom_y, next_process) {
          if (!screenshot.order_number) {
            next_process();
            return;
          }

          const key = "number_file";
          const MARGIN = 3;
          chrome.storage.local.get(key, (res) => {
            if (res[key]) {
              const img = new Image();
              img.onload = () => {
                const w = Math.floor(img.width / 6);
                const x = order * w;
                const dx = right_bottom_x - w - MARGIN;
                const dy = right_bottom_y - img.height - MARGIN;
                context.globalCompositeOperation = 'source-over';
                //console.log(x + ", " + w + ", " + w + ", " + img.height);
                context.drawImage(img, x, 0, w, img.height, dx, dy, w, img.height);
                next_process();
              };
              img.onerror = () => {
                console.log("number image load failure");
                next_process();
              };
              img.src = res[key];
            }
            else {
              next_process();
            }
          });
        }

      };
      img.src = img_src;
    });
  }
};

chrome.runtime.onMessage.addListener((message) => {
  //console.log("notify: " + message.type);
  if (message.type === "capture") {
    sendMessageTab({ type: "canvas", mode: "add" });
  }
  if (message.type === "fullscreen") {
    sendMessageTab({ type: "canvas", mode: "one" });
  }
  if (message.type === "image_data") {
    if (message.mode === "add") {
      if (screenshot.capture_count >= 6) {
        createImage();
      }
      else {
        addImageOne(message.data, message.text);
      }
    }
    else {
      downloadImage(message.data);
    }
  }
  if (message.type === "output") {
    createImage();
  }
  if (message.type === "reset") {
    clearCache();
    config.load();
    screenshot.addition_image = 0;
    screenshot.order_number = false;
  }
  if (message.type === "modeselect") {
    clearCache();
    screenshot.addition_image = 0;
    screenshot.order_number = false;
    modeselect(message.num);
  }
  if (message.type === "addition") {
    const key = "additional_file_" + message.num;
    chrome.storage.local.get(key, (res) => {
      if (res[key]) {
        notifySpecifyFleetNumber(message.num, res[key]);
        screenshot.addition_image = message.num;
      }
    });
  }
  if (message.type === "number") {
    const key = "number_file";
    chrome.storage.local.get(key, (res) => {
      if (res[key]) {
        screenshot.order_number = true;
        notifyNumbering(res[key]);
      }
    });
  }
  if (message.type === "clear") {
    clearCache();
  }
  if (message.type === "quickx6") {
    chrome.storage.local.set({ "current_view_type": 1 }, () => {
      clearCache();
      config.load();
      notifyQuick();
      sendMessageTab({ type: "quickx6" });
    });
  }
});

function sendMessageTab(param) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, param);
  });
};

function addImageOne(img_src, edit_text) {
  const canvas = document.createElement("canvas");
  canvas.width = config.width;
  canvas.height = config.height;

  const img = new Image();
  img.src = img_src;
  img.onload = function () {
    const context = canvas.getContext("2d");
    //context.mozImageSmoothingEnabled = false; 非推奨
    context.webkitImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;

    drawImage(() => {
      const img_data = canvas.toDataURL();
      saveLocalOne(img_data);
    });

    function drawImage(next_process) {
      drawMask(() => {
        context.drawImage(img, config.x, config.y, config.width, config.height, 0, 0, config.width, config.height);

        // 基地航空隊名テキストの補填
        if (config.view_type == 4) {
          context.globalCompositeOperation = 'source-over';
          context.fillStyle = 'black';
          context.font = "16pt sans-serif";
          context.fillText(edit_text, 17, 107);
        }

        next_process();
      });
    }

    /**
     * マスク画像処理
     */
    function drawMask(next_process) {
      const img = new Image();
      const key = "mask_file_" + config.view_type;
      chrome.storage.local.get(key, (res) => {
        if (res[key]) {
          img.onload = () => {
            context.globalCompositeOperation = 'xor';
            context.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
            next_process();
          };
          img.onerror = () => {
            console.log("mask image load failure");
            next_process();
          };
          img.src = res[key];
        }
        else {
          next_process();
        }
      });
    }
  };
}

function saveLocalOne(image_data) {
  screenshot.capture_count++;
  const key = "ss" + screenshot.capture_count;
  chrome.storage.local.set({ [key]: image_data }, () => {
    console.log("save local: " + key);
    notifyCapture(screenshot.capture_count, image_data);
  });
}

function createImage() {
  if (screenshot.capture_count === 0) {
    console.log("no capture image");
    return;
  }

  screenshot.image_max_count = screenshot.capture_count;
  screenshot.init();

  chrome.storage.local.get(config.ss_key, (item) => {
    let funcs = [];
    let order = 0;
    for (let i in item) {
      funcs.push(screenshot.addImage(item[i], order++));
    }

    Promise.all(funcs).then(() => {
      clearCache();

      screenshot.addition_image = 0;
      screenshot.order_number = false;
    });
  });
}

function dataURItoBlob(dataURI) {
  let byteString = atob(dataURI.split(',')[1]);
  let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  let ab = new ArrayBuffer(byteString.length);
  let ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  // ArrayBuffer is deprecated. use DataView insted.
  let bb = new Blob([ab], { type: mimeString });
  return bb;
}

/**
 * Download image
 */
function downloadImage(image_data) {
  chrome.downloads.download({
    'url': URL.createObjectURL(dataURItoBlob(image_data)),
    'filename': 'myfleet.png',
  });
}

/**
 * キャプチャ時の通知
 */
function notifyCapture(num, img_url) {
  const nid = "kfc_" + num;
  chrome.notifications.create(nid, {
    "type": "basic",
    "title": "Kancolle fleet capture",
    "message": num + " / 6",
    "iconUrl": img_url
  });
  setTimeout(() => {
    chrome.notifications.clear(nid);
  }, 1000);
}

/**
 * 編成番号付加時の通知
 */
function notifyNumbering(img_url) {
  const nid = "number";
  chrome.notifications.create(nid, {
    "type": "basic",
    "title": "Kancolle fleet capture",
    "message": "番号付き",
    "iconUrl": img_url
  });
  setTimeout(() => {
    chrome.notifications.clear(nid);
  }, 1000);
}

/**
 * モード切替時の通知
 */
function notifyChangeMode(num) {
  const nid = "mode_" + num;
  const mode_title = ["編成【詳細】", "編成【変更】", "編成展開【右列】", "基地航空隊"];
  const img_url = "./mask_image/modeselect_" + num + ".png";
  chrome.notifications.create(nid, {
    "type": "basic",
    "title": "Kancolle fleet capture",
    "message": mode_title[num - 1],
    "iconUrl": img_url
  });
  setTimeout(() => {
    chrome.notifications.clear(nid);
  }, 2000);
}

/**
 * アペンド画像設定時の通知
 */
function notifySpecifyFleetNumber(num, img_url) {
  const nid = "add_" + num;
  chrome.notifications.create(nid, {
    "type": "basic",
    "title": "Kancolle fleet capture",
    "message": "",
    "iconUrl": img_url
  });
  setTimeout(() => {
    chrome.notifications.clear(nid);
  }, 1000);
}

/**
 * クイックキャプチャ操作時
 */
function notifyQuick() {
  const nid = "quick";
  const img_url = "./mask_image/6xcap.png";
  chrome.notifications.create(nid, {
    "type": "basic",
    "title": "Kancolle fleet capture",
    "message": "【編成詳細】連続キャプチャ開始",
    "iconUrl": img_url
  });
  setTimeout(() => {
    chrome.notifications.clear(nid);
  }, 1000);
}

/**
 * ローカルストレージ削除
 * C:\Users\<user>\AppData\Roaming\Mozilla\Firefox\Profiles\.default\storage\default\moz-extension\idb\
 */
function clearCache() {
  console.log("clear cache");
  chrome.storage.local.remove(config.ss_key, () => { });
  screenshot.capture_count = 0;
}

/**
 * モード切替
 */
function modeselect(num) {
  let new_view_type = config.view_type + num;
  if (new_view_type > 4) {
    new_view_type = 1;
  }
  if (new_view_type < 1) {
    new_view_type = 4;
  }

  chrome.storage.local.set({ "current_view_type": new_view_type }, () => {
    console.log("save view_type: " + new_view_type);
    notifyChangeMode(new_view_type);
    config.load();
  });
}

/**
 * パラメータ初期化
 */
(function () {
  chrome.storage.local.get("current_view_type", (res) => {
    console.log("load background: " + res.current_view_type);
    if (res.current_view_type == null) {
      chrome.storage.local.set(initial_data, () => {
        console.log("All parameter initialized");
      });
    }
    config.load();
  });
})();
