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
   * config値の参照は画像出力時なので基本的に読み込み待ちしなくて良い
   */
  load : function() {
    chrome.storage.local.get(['layout', 'mask', 'current_view_type'], (res) => {
      if (res.layout != null) {
        config.horizontal_num = (res.layout == 1) ? 2 : 3
        config.vertical_num = (res.layout == 1) ? 3 : 2
      }
      console.log("layout: " + config.horizontal_num + " x " + config.vertical_num);

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
        console.log("config loaded: " + config.width + " x " + config.height + " : " + config.x + " x " + config.y);
      });
    });
  }
};

var screenshot = {
  content: document.createElement("canvas"),
  image_max_count: 6,
  image_order: 0,
  image_load_count: 0,
  addition_image: 0,
  init: function (num) {
    const col = (num > config.horizontal_num) ? config.horizontal_num : num;
    const row = parseInt((num - 1) / config.horizontal_num) + 1;
    screenshot.content.width = config.width * col;
    screenshot.content.height = config.height * row;
    console.log("canvas: " + col + ":" + row + " " + screenshot.content.width + " x " + screenshot.content.height);
    screenshot.image_order = 0;
    screenshot.image_load_count = 0;
  },
  addImage: function (img_src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = img_src;
      image.onload = function() {
        const col = screenshot.image_order % config.horizontal_num;
        const row = parseInt(screenshot.image_order / config.horizontal_num);
        const dx = config.width * col;
        const dy = config.height * row;

        let context = screenshot.content.getContext("2d");
        //context.mozImageSmoothingEnabled = false; 非推奨
        context.webkitImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;

        screenshot.image_order++;

        drawImage(() => {
          //最大枚数に達したら強制DL
          if (screenshot.image_load_count >= screenshot.image_max_count) {
            drawAddition(screenshot.addition_image, () => {
              downloadImage(screenshot.content.toDataURL());
            });
          }

          resolve();
        });

        function drawImage(next_process) {
          drawMask(() => {
            context.drawImage(image, config.x, config.y, config.width, config.height, dx, dy, config.width, config.height);

            screenshot.image_load_count++;
            console.log("image_load_count: " + screenshot.image_load_count + " / " + screenshot.image_max_count);

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
                context.drawImage(img, 0, 0, img.width, img.height, dx, dy, img.width, img.height);
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
                context = screenshot.content.getContext("2d");
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
      };
    });
  }
};

//
// download image
//
function downloadImage(image_data) {
  chrome.downloads.download({
    'url': URL.createObjectURL(dataURItoBlob(image_data)),
    'filename': 'myfleet.png',
  });
}

browser.runtime.onMessage.addListener((message) => {
  //console.log("notify: " + message.type);
  if (message.type === "capture") {
    sendMessageTab({ type: "canvas", mode: "add" });
  }
  if (message.type === "fullscreen") {
    sendMessageTab({ type: "canvas", mode: "one" });
  }
  if (message.type === "image_data") {
    if (message.mode === "add") {
      saveLocal(message.data);
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
  }
  if (message.type === "modeselect") {
    clearCache();
    screenshot.addition_image = 0;
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

function saveLocal(image_data) {
  let num = parseInt(sessionStorage.getItem("num"));
  if (!num) {
    num = 0;
    config.load(); // config値を使うのは画像出力時なのでstorageの読込待たなくて良い
  }

  if (num >= 6) {
    createImage();
    return;
  }

  num++;

  const key = "ss" + num;

  console.log("save local: " + key);
  chrome.storage.local.set({ [key]: image_data }, () => {
    notifyCapture(num);
  });
  
  sessionStorage.setItem("num", num);
}

function createImage() {
  const num = parseInt(sessionStorage.getItem("num"));
  if (!num) {
    console.log("none capture image");
    return;
  }

  screenshot.image_max_count = num;
  screenshot.init(num);

  chrome.storage.local.get(config.ss_key, (item) => {
    let funcs = [];
    for (let i in item) {
      funcs.push(screenshot.addImage(item[i]));
    }

    Promise.all(funcs).then(() => {
      clearCache();

      screenshot.addition_image = 0;
    });
  });
}

var sendMessageTab = function (param) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, param);
  });
};

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
 * キャプチャ時の通知
 */
function notifyCapture(num) {
  const nid = "kfc_" + num;
  browser.notifications.create(nid, {
    "type": "basic",
    "title": "Kancolle fleet capture",
    "message": num + " / 6",
  });
  setTimeout(() => {
    browser.notifications.clear(nid);
  }, 1000);
}

/**
 * モード切替時の通知
 */
function notifyChangeMode(num) {
  const nid = "mode_" + num;
  const mode_title = ["編成【詳細】", "編成【変更】", "編成展開【右列】", "基地航空隊"];
  browser.notifications.create(nid, {
    "type": "basic",
    "title": "Kancolle fleet capture",
    "message": mode_title[num - 1],
  });
  setTimeout(() => {
    browser.notifications.clear(nid);
  }, 2000);
}

/**
 * アペンド画像設定時の通知
 */
function notifySpecifyFleetNumber(num, additional_img) {
  const nid = "add_" + num;
  browser.notifications.create(nid, {
    "type": "basic",
    "title": "Kancolle fleet capture",
    "message": "",
    "iconUrl": additional_img
  });
  setTimeout(() => {
    browser.notifications.clear(nid);
  }, 1000);
}

/**
 * クイックキャプチャ操作時
 */
function notifyQuick() {
  const nid = "quick";
  browser.notifications.create(nid, {
    "type": "basic",
    "title": "Kancolle fleet capture",
    "message": "【編成詳細】連続キャプチャ開始",
  });
  setTimeout(() => {
    browser.notifications.clear(nid);
  }, 1000);
}

/**
 * ローカルストレージ削除
 * C:\Users\<user>\AppData\Roaming\Mozilla\Firefox\Profiles\.default\storage\default\moz-extension\idb\
 */
function clearCache() {
  console.log("clear cache");
  chrome.storage.local.remove(config.ss_key, () => { });
  sessionStorage.clear();
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
  console.log("change current_view_type: " + new_view_type);

  chrome.storage.local.set({ "current_view_type": new_view_type }, () => {
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
  });
})();
