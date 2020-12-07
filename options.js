/**
 * 座標登録ボタン
 */
function saveOption(event) {
  const selected_value = document.querySelector("#view_list").value;
  const data_key = "view_type_" + selected_value;
  const view_data = {
    w: parseInt(document.querySelector("#width").value),
    h: parseInt(document.querySelector("#height").value),
    x: parseInt(document.querySelector("#x").value),
    y: parseInt(document.querySelector("#y").value)
  };

  if (view_data.w > 1200 || view_data.h > 720 || view_data.x > 1200 || view_data.y > 720 ||
      view_data.w < 1 || view_data.h < 1 || view_data.x < 0 || view_data.y < 0) {
    alert("座標が 1200x720 を超えています");
    return;
  }

  chrome.storage.local.set({ [data_key]: view_data }, () => {
    console.log("config saved: " + view_data);
  });

  event.preventDefault();
}

function loadOption(type_num) {
  const data_key = "view_type_" + type_num;
  chrome.storage.local.get(data_key, (res) => {
    document.querySelector("#width").value = res[data_key].w;
    document.querySelector("#height").value = res[data_key].h;
    document.querySelector("#x").value = res[data_key].x;
    document.querySelector("#y").value = res[data_key].y;
  });
}

function loadMaskImage(view_type) {
  const key = "mask_file_" + view_type;
  chrome.storage.local.get(key, (res) => {
    const img = document.querySelector("#mask_src");
    if (res[key] != null) {
      img.src = res[key];
    }
    else {
      img.src = "./mask_image/mask_null.png";
    }
  });
}

function loadAdditionalImage() {
  for (let no of [1, 2, 3, 4]) {
    const key = "additional_file_" + no;
    chrome.storage.local.get(key, (res) => {
      const img = document.querySelector("#tagsrc_" + no);
      if (res[key] != null) {
        img.src = res[key];
      }
      else {
        img.src = "./mask_image/mask_null.png";
      }
    });
  }
}

/**
 * 工場出荷時に戻す 
 */
function loadDefault(next_process) {
  chrome.storage.local.clear(() => {
    console.log("cleared all storage");
    chrome.storage.local.set(initial_data, () => {
      console.log("initialized all parameter");
      next_process();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get("current_view_type", (res) => {
    console.log("init current_view_type: " + res.current_view_type);
    let view_type = 1;
    if (res.current_view_type != null) {
      view_type = res.current_view_type;
      loadOption(view_type);
      loadMaskImage(view_type);
      loadAdditionalImage();
    }
    else {
      loadDefault(() => {
        loadOption(view_type);
        loadMaskImage(view_type);
        loadAdditionalImage();
      });
    }
    document.querySelector("#view_list").value = view_type;
  });

  chrome.storage.local.get(["layout"], (res) => {
    if (res["layout"] == null) {
      res["layout"] = 0;
    }
    document.querySelector('input[name="layout"][value="' + res["layout"] + '"]').checked = true;
  });
});

document.querySelector("form").addEventListener("submit", saveOption);

document.querySelector("#view_list").addEventListener('change', (e) => {
  const view_type = parseInt(e.target.value);
  loadOption(view_type);
  loadMaskImage(view_type);
  chrome.storage.local.set({ "current_view_type": view_type }, () => {
    console.log("change current_view_type: " + view_type);
  });
  browser.runtime.sendMessage({ type: "reset" });
});

document.querySelectorAll('input[name="layout"]').forEach(div => {
  div.addEventListener('change', function (e) {
    const layout = e.target.value;
    chrome.storage.local.set({ "layout": layout }, () => {
      console.log("layout: " + layout);
    });
  });
});

/**
 * マスク画像設定
 */
document.querySelector('#input_mask').addEventListener('change', (e) => {
  const current_view_type = document.querySelector("#view_list").value;
  const file = e.target.files[0];
  if (file.size > (1024 * 1024 * 3)) {
    window.alert("ファイルサイズが3MBを超えています");
    return;
  }

  const img = document.querySelector("#mask_src");

  const reader = new FileReader();
  reader.onload = (function (aImg) {
    return function (e) {
      aImg.src = e.target.result;
      const mask_file_key = "mask_file_" + current_view_type;
      chrome.storage.local.set({ [mask_file_key]: e.target.result }, () => {
        console.log("mask file stored: " + mask_file_key);
      });
    };
  })(img);
  reader.readAsDataURL(file);
});

/**
 * マスク画像削除
 */
document.querySelector('#delmask').addEventListener('click', (e) => {
  const current_view_type = document.querySelector("#view_list").value;
  const key = "mask_file_" + current_view_type;
  console.log("delete: " + key);
  chrome.storage.local.remove(key, () => {
    const img = document.querySelector("#mask_src");
    img.src = "./mask_image/mask_null.png";
  });
});

/**
 * 追加イメージ設定
 */
document.querySelectorAll('input[name="input_tag"]').forEach(btn => {
  btn.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file.size > (1024 * 1024 * 3)) {
      window.alert("ファイルサイズが3MBを超えています");
      return;
    }

    const additional_no = e.target.dataset.no;
    const img = document.querySelector("#tagsrc_" + additional_no);
    console.log("additional_no:" + additional_no);

    const reader = new FileReader();
    reader.onload = (function (aImg) {
      return function (e) {
        aImg.src = e.target.result;
        const key = "additional_file_" + additional_no;
        chrome.storage.local.set({ [key]: e.target.result }, () => {
          console.log("additional file stored: " + key);
        });
      };
    })(img);
    reader.readAsDataURL(file);
  });
});

/**
 * 追加イメージ削除
 */
document.querySelectorAll('button[name="deltag"]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const no = e.currentTarget.dataset.no;
    const img = document.querySelector("#tagsrc_" + no);
    const key = "additional_file_" + no;
    console.log("delete: " + key);
    chrome.storage.local.remove(key, () => {
      img.src = "./mask_image/mask_null.png";
    });
  });
});

/**
 * 初期化ボタン
 */
document.querySelector('button[name="setdef"]').addEventListener('click', (e) => {
  if (window.confirm("初期設定に戻しますか？")) {
    loadDefault(() => {
      const current_view_type = document.querySelector("#view_list").value;
      loadOption(current_view_type);
      loadMaskImage(current_view_type);
      loadAdditionalImage();
    });
  }
});