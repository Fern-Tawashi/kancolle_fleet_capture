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
  getThumbnail: function (img_src, width, height, num, result) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    const img = new Image();
    img.src = img_src;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      addProgress(num, () => {
        result(canvas.toDataURL());
      });
    }

    function addProgress(num, next_process) {
      if (num == null) {
        next_process();
        return;
      }

      ctx.globalCompositeOperation = 'source-over';
      const img = new Image();
      img.src = `./mask_image/progress_${num}.png`;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        next_process();
      }
    }
  },
  addImage: function (img_src, order) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = img_src;
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
         * 追加画像差し込み
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
              img.src = res[key];
              img.onload = () => {
                context.globalCompositeOperation = 'source-over';
                context.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
                next_process();
              };
              img.onerror = () => {
                console.log("additional image load failure");
                next_process();
              };
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
              img.src = res[key];
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
        notifyPopup({ image: res[key] });
        screenshot.addition_image = message.num;
      }
    });
  }
  if (message.type === "number") {
    const key = "number_file";
    chrome.storage.local.get(key, (res) => {
      if (res[key]) {
        screenshot.order_number = true;
        notifyPopup({ image: "./mask_image/nums_icon.png" });
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
      notifyPopup({ image: "./mask_image/6xcap.png" });
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
          context.fillText(edit_text, 18, 107);
        }

        next_process();
      });
    }

    /**
     * マスク画像処理
     */
    function drawMask(next_process) {
      const key = "mask_file_" + config.view_type;
      chrome.storage.local.get(key, (res) => {
        if (res[key]) {
          const img = new Image();
          img.src = res[key];
          img.onload = () => {
            context.globalCompositeOperation = 'xor';
            context.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
            next_process();
          };
          img.onerror = () => {
            console.log("mask image load failure");
            next_process();
          };
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
    notifyPopup( { image: image_data, num: screenshot.capture_count } );
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
    const img_url = `./mask_image/modeselect_${new_view_type}.png`;
    notifyPopup({ image: img_url });
    config.load();
  });
}

/**
 * 通知
 */
function notifyPopup(option) {
  screenshot.getThumbnail(option.image, 120, 120, option.num, (res) => {
    option.image = res;
    sendMessageTab({ type: "popup", data: option });
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
