function loadCoord(type_num) {
  const data_key = "view_type_" + type_num;
  chrome.storage.local.get(data_key, (res) => {
    document.getElementById("width").value = res[data_key].w;
    document.getElementById("height").value = res[data_key].h;
    document.getElementById("x").value = res[data_key].x;
    document.getElementById("y").value = res[data_key].y;
  });
}

function loadMaskImage(view_type) {
  const key = "mask_file_" + view_type;
  chrome.storage.local.get(key, (res) => {
    const img = document.getElementById("mask_src");
    if (res[key] != null) {
      img.src = res[key];
    }
    else {
      img.src = "/mask_image/mask_null.png";
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
      const img = document.getElementById("tagsrc_" + i);
      if (res[key] != null) {
        img.src = res[key];
      }
      else {
        img.src = "/mask_image/mask_null.png";
      }
    }
  });
}

function loadNumberImage() {
  const key = "number_file";
  chrome.storage.local.get(key, (res) => {
    const img = document.getElementById("num_src");
    if (res[key] != null) {
      img.src = res[key];
    }
    else {
      img.src = "/mask_image/num_null.png";
    }
  });
}

function loadOther() {
  chrome.storage.local.get(["layout"], (res) => {
    const layout = res["layout"] || 0;
    document.querySelector('input[name="layout"][value="' + layout + '"]').checked = true;
  });

  chrome.storage.local.get("quick_delay", (res) => {
    document.getElementById("delay").value = res.quick_delay;
  });

  chrome.storage.local.get("safety_mode", (res) => {
    document.getElementById("safety").checked = (parseInt(res["safety_mode"]) === 1);
  });
}

/**
 * 工場出荷時に戻す 
 */
function loadDefault(next_process) {
  chrome.storage.local.clear(() => {
    console.log("cleared all storage");
    chrome.storage.local.set(INITIAL_DATA, () => {
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
      loadNumberImage();
      loadOther();
    }
    else {
      loadDefault(() => {
        loadCoord(view_type);
        loadMaskImage(view_type);
        loadAdditionalImage();
        loadNumberImage();
        loadOther();
      });
    }
    document.getElementById("view_list").value = view_type;
  });
});

/**
 * 座標登録ボタン
 */
document.querySelector("form[name='coordinate']").addEventListener("submit", (e) => {
  event.preventDefault();

  const selected_value = document.getElementById("view_list").value;
  const data_key = "view_type_" + selected_value;
  const view_data = {
    w: parseInt(document.getElementById("width").value),
    h: parseInt(document.getElementById("height").value),
    x: parseInt(document.getElementById("x").value),
    y: parseInt(document.getElementById("y").value)
  };

  if (view_data.w > 1200 || view_data.h > 720 || view_data.x > 1200 || view_data.y > 720 ||
    view_data.w < 1 || view_data.h < 1 || view_data.x < 0 || view_data.y < 0) {
  }
  else {
    chrome.storage.local.set({ [data_key]: view_data }, () => {
      console.log("save coordinate: " + view_data.x + "x" + view_data.y + ", " + view_data.w + "x" + view_data.h);
      chrome.runtime.sendMessage({ type: "reset" });
    });
  }
});

document.getElementById("view_list").addEventListener('change', (e) => {
  const view_type = parseInt(e.target.value);
  loadCoord(view_type);
  loadMaskImage(view_type);
  chrome.storage.local.set({ "current_view_type": view_type }, () => {
    console.log("save current_view_type: " + view_type);
  });
  chrome.runtime.sendMessage({ type: "reset" });
});

document.querySelectorAll('input[name="layout"]').forEach(div => {
  div.addEventListener('change', function (e) {
    const layout = e.target.value;
    chrome.storage.local.set({ "layout": layout }, () => {
      console.log("save layout: " + layout);
    });
  });
});

/**
 * マスク画像設定
 */
document.getElementById('input_mask').addEventListener('change', (e) => {
  const current_view_type = document.querySelector("#view_list").value;
  const file = e.target.files[0];
  if (file.size > (1024 * 1024 * 1)) {
    document.getElementById('mask_src').src = "/mask_image/regist_err.png";
    return;
  }

  const img = document.getElementById("mask_src");

  const reader = new FileReader();
  reader.onload = (function (aImg) {
    return function (e) {
      aImg.src = e.target.result;
      const mask_file_key = "mask_file_" + current_view_type;
      chrome.storage.local.set({ [mask_file_key]: e.target.result }, () => {
        console.log("file stored: " + mask_file_key);
      });
    };
  })(img);
  reader.readAsDataURL(file);
});

/**
 * マスク画像削除
 */
document.getElementById('delmask').addEventListener('click', (e) => {
  const current_view_type = document.getElementById("view_list").value;
  const key = "mask_file_" + current_view_type;
  chrome.storage.local.remove(key, () => {
    console.log("delete: " + key);
    const img = document.getElementById("mask_src");
    img.src = "/mask_image/mask_null.png";
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
    const img = document.getElementById("tagsrc_" + additional_no);
    console.log("additional_no:" + additional_no);

    const reader = new FileReader();
    reader.onload = (function (aImg) {
      return function (e) {
        aImg.src = e.target.result;
        const key = "additional_file_" + additional_no;
        chrome.storage.local.set({ [key]: e.target.result }, () => {
          console.log("file stored: " + key);
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
    const img = document.getElementById("tagsrc_" + no);
    const key = "additional_file_" + no;
    chrome.storage.local.remove(key, () => {
      console.log("delete: " + key);
      img.src = "/mask_image/mask_null.png";
    });
  });
});

/**
 * ナンバリング画像設定
 */
document.getElementById('input_num').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file.size > (1024 * 1024 * 1)) {
    document.querySelector('#num_src').src = "/mask_image/num_err.png";
    return;
  }

  const img = document.getElementById("num_src");

  const reader = new FileReader();
  reader.onload = (function (aImg) {
    return function (e) {
      aImg.src = e.target.result;
      const key = "number_file";
      chrome.storage.local.set({ [key]: e.target.result }, () => {
        console.log("file stored: " + key);
      });
    };
  })(img);
  reader.readAsDataURL(file);
});

/**
 * ナンバリング画像削除
 */
document.getElementById('delnum').addEventListener('click', (e) => {
  const key = "number_file";
  chrome.storage.local.remove(key, () => {
    console.log("delete: " + key);
    const img = document.getElementById("num_src");
    img.src = "/mask_image/num_null.png";
  });
});

/**
 * クイックキャプチャの遅延保存
 */
document.querySelector("form[name='delaytime']").addEventListener("submit", (e) => {
  event.preventDefault();

  const quick_delay = parseInt(document.getElementById("delay").value);
  if (quick_delay > 0 && quick_delay <= 1000) {
    chrome.storage.local.set({ "quick_delay": quick_delay }, () => {
      console.log("delay_time stored: " + quick_delay);
    });
  }
});

/**
 * 安全モード
 */
document.getElementById("safety").addEventListener('change', (e) => {
  const val = e.target.checked ? 1 : 0;
  chrome.storage.local.set({ "safety_mode": val }, () => {
    console.log("change safety_mode: " + val);
  });
});

/**
 * 初期化ボタン
 */
document.getElementById('setdef').addEventListener('click', (e) => {
  e.target.disabled = true;
  const confirm = document.getElementById('setdef_confirm');
  confirm.style.visibility = 'visible';
});

document.getElementById('setdef_confirm').addEventListener('click', (e) => {
  if (e.target.type === 'button' && e.target.value == 1) {
    loadDefault(() => {
      const view_type = 1
      document.getElementById("view_list").value = view_type;
      loadCoord(view_type);
      loadMaskImage(view_type);
      loadAdditionalImage();
      loadNumberImage();
      loadOther();

      chrome.runtime.sendMessage({ type: "reset" });
    });
  }
  const confirm = document.getElementById('setdef_confirm');
  confirm.style.visibility = 'hidden'
  document.getElementById('setdef').disabled = false;
});
