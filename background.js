var config = {
  width  : 720, // 艦娘詳細：幅
  height : 560, // 艦娘詳細：高
  x      : 475, // 艦娘詳細Xオフセット
  y      : 145, // 艦娘詳細Yオフセット
  
  load : function() {
    chrome.storage.local.get(['width', 'height', 'x', 'y'], (res) => {
      if (res.width != null && !isNaN(res.width)) {
        config.width = parseInt(res.width);
      }
      if (res.height != null && !isNaN(res.height)) {
        config.height = parseInt(res.height);
      }
      if (res.x != null && !isNaN(res.x)) {
        config.x = parseInt(res.x);
      }
      if (res.y != null && !isNaN(res.y)) {
        config.y = parseInt(res.y);
      }
      console.log("config loaded: " + config.width + " x " + config.height + " : " + config.x + " x " + config.y);
    });
  }
};
config.load();

var screenshot = {
  content : document.createElement("canvas"),
  image_max_count : 6,
  image_load_count : 0,
  init : function(num) {
    screenshot.content.width = (num > 1) ? config.width * 2 : config.width;
    screenshot.content.height = config.height * parseInt((parseInt(num) + 1) / 2);
    console.log("canvas: " + screenshot.content.width + " x " + screenshot.content.height);

    screenshot.image_load_count = 0;
  },
  addImage : function(img_src) {
    let image = new Image();
    image.src = img_src;
    image.onload = function() {

      let col = screenshot.image_load_count % 2;
      let row = parseInt(screenshot.image_load_count / 2);

      let dx = 0 + (config.width * col);
      let dy = 0 + (config.height * row);

      let context = screenshot.content.getContext("2d");

      //context.mozImageSmoothingEnabled = false; 非推奨
      context.webkitImageSmoothingEnabled = false;
      context.msImageSmoothingEnabled = false;
      context.imageSmoothingEnabled = false;
      context.drawImage(image, config.x, config.y, config.width, config.height, dx, dy, config.width, config.height);

      screenshot.image_load_count++;
      console.log("image_load_count: " + screenshot.image_load_count + " / " + screenshot.image_max_count);
      if (screenshot.image_load_count >= screenshot.image_max_count) {
        screenshot.saveImage();
      }
    };
  },
  saveImage : function() {
    console.log("save image");
    //console.log(dataURItoBlob(screenshot.content.toDataURL()));

    // save the image
    chrome.downloads.download({
      'url': URL.createObjectURL(dataURItoBlob(screenshot.content.toDataURL())),
      'filename': 'myfleet.png',
    });
  }
};

browser.runtime.onMessage.addListener((message) => {
  console.log("notify: " + message.type);
  if (message.type === "capture") {
    sendMessageTab({ type: "canvasin" });
  }
  if (message.type === "image_data") {
    saveLocal(message.data);
  }
  if (message.type === "output") {
    createImage();
  }
});

function saveLocal(image_data) {
  let num = parseInt(sessionStorage.getItem("num"));
  if (!num) {
    num = 0;
    config.load();
  }

  if (num >= 6) {
    createImage();
    return;
  }

  num++;

  let key = "ss" + num;

  console.log("save local: " + key);
  chrome.storage.local.set({ [key]: image_data }, () => {
    notifyCapture(num);
  });
  
  sessionStorage.setItem("num", num);
}

function createImage() {
  const ss_key = ['ss1', 'ss2', 'ss3', 'ss4', 'ss5', 'ss6'];

  let num = parseInt(sessionStorage.getItem("num"));
  if (!num) {
    console.log("none capture image");
    return;
  }

  screenshot.image_max_count = num;
  screenshot.init(num);

  chrome.storage.local.get(ss_key, (item) => {
    //console.log(item);

    for (let i in item) {
      screenshot.addImage(item[i]);
    }

    chrome.storage.local.remove(ss_key);
    sessionStorage.clear();
  });
}

var sendMessageTab = function (param) {
  chrome.tabs.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }, function (tab) {
    for (var i = 0; i < tab.length; i++) {
      chrome.tabs.sendMessage(tab[i].id, param, function () { });
    };
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

function notifyCapture(num) {
  let nid = "kfc";
  browser.notifications.create(nid, {
    "type": "basic",
    "title": "Kancolle fleet capture",
    "message": num + " / 6"
  });
  setTimeout(() => {
    browser.notifications.clear(nid);
  }, 1000);
}
