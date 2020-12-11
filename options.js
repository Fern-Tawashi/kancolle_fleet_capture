function loadCoord(type_num) {
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
  const nums = [1, 2, 3, 4];
  const STORAGE_KEY_PREFIX = "additional_file_";
  const keys = nums.map(n => STORAGE_KEY_PREFIX + n);

  chrome.storage.local.get(keys, (res) => {
    for (let i of nums) {
      let key = STORAGE_KEY_PREFIX + i;
      const img = document.querySelector("#tagsrc_" + i);
      if (res[key] != null) {
        img.src = res[key];
      }
      else {
        img.src = "./mask_image/mask_null.png";
      }
    }
  });
}

function loadOther() {
  chrome.storage.local.get(["layout"], (res) => {
    if (res["layout"] == null) {
      res["layout"] = 0;
    }
    document.querySelector('input[name="layout"][value="' + res["layout"] + '"]').checked = true;

    chrome.storage.local.get("quick_delay", (res) => {
      document.querySelector("#delay").value = res.quick_delay;
    });
  });
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
    console.log("load current_view_type: " + res.current_view_type);
    let view_type = 1;
    if (res.current_view_type != null) {
      view_type = res.current_view_type;
      loadCoord(view_type);
      loadMaskImage(view_type);
      loadAdditionalImage();
      loadOther();
    }
    else {
      loadDefault(() => {
        loadCoord(view_type);
        loadMaskImage(view_type);
        loadAdditionalImage();
        loadOther();
      });
    }
    document.querySelector("#view_list").value = view_type;
  });
});

/**
 * 座標登録ボタン
 */
document.querySelector("form[name='coordinate']").addEventListener("submit", (e) => {
  event.preventDefault();

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
  }
  else {
    chrome.storage.local.set({ [data_key]: view_data }, () => {
      console.log("config saved: " + view_data);
    });
  }
});

document.querySelector("#view_list").addEventListener('change', (e) => {
  const view_type = parseInt(e.target.value);
  loadCoord(view_type);
  loadMaskImage(view_type);
  chrome.storage.local.set({ "current_view_type": view_type }, () => {
    console.log("change current_view_type: " + view_type);
  });
  chrome.runtime.sendMessage({ type: "reset" });
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
  if (file.size > (1024 * 1024 * 1)) {
    document.querySelector('#mask_src').src = "./mask_image/regist_err.png";
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
 * クイックキャプチャの遅延保存
 */
document.querySelector("form[name='delaytime']").addEventListener("submit", (e) => {
  event.preventDefault();

  const quick_delay = parseInt(document.querySelector("#delay").value);
  if (quick_delay > 0 && quick_delay <= 1000) {
    chrome.storage.local.set({ "quick_delay": quick_delay }, () => {
      console.log("delay_time stored: " + quick_delay);
    });
  }
});

/**
 * 初期化ボタン
 */
document.querySelector('#setdef').addEventListener('click', (e) => {
  e.target.disabled = true;
  const confirm = document.querySelector('#setdef_confirm');
  confirm.style.visibility = 'visible';
});

document.querySelector('#setdef_confirm').addEventListener('click', (e) => {
  if (e.target.type === 'button' && e.target.value == 1) {
    loadDefault(() => {
      const view_type = document.querySelector("#view_list").value;
      loadCoord(view_type);
      loadMaskImage(view_type);
      loadAdditionalImage();
      loadOther();
    });
  }
  const confirm = document.querySelector('#setdef_confirm');
  confirm.style.visibility = 'hidden'
  document.querySelector('#setdef').disabled = false;
});
