var config = {
  width: 724,   // �͖��ڍׁF��
  height: 560,  // �͖��ڍׁF��
  x: 471,       // �͖��ڍ�X�I�t�Z�b�g
  y: 145,       // �͖��ڍ�Y�I�t�Z�b�g
  ss_key: ['ss1', 'ss2', 'ss3', 'ss4', 'ss5', 'ss6'],
 
  load : function() {
    chrome.storage.local.get('current_view_type', (res) => {
      if (res.current_view_type == null) {
        res.current_view_type = 1;
      }
      let view_type_key = "view_type_" + res.current_view_type;
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

      //context.mozImageSmoothingEnabled = false; �񐄏�
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
    //console.log("save image");
    //console.log(dataURItoBlob(screenshot.content.toDataURL()));
    downloadImage(screenshot.content.toDataURL());
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
  let num = parseInt(sessionStorage.getItem("num"));
  if (!num) {
    console.log("none capture image");
    return;
  }

  screenshot.image_max_count = num;
  screenshot.init(num);

  chrome.storage.local.get(config.ss_key, (item) => {
    //console.log(item);

    for (let i in item) {
      screenshot.addImage(item[i]);
    }

    clearCache();
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
  let nid = "kfc_" + num;
  browser.notifications.create(nid, {
    "type": "basic",
    "title": "Kancolle fleet capture",
    "message": num + " / 6"
  });
  setTimeout(() => {
    browser.notifications.clear(nid);
  }, 1000);
}

function clearCache() {
  console.log("clear cache");
  chrome.storage.local.remove(config.ss_key, () => { });
  sessionStorage.clear();
}