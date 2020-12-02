var templates = [
  {},
  { w: 724, h: 560, x: 471, y: 145 }, // 編成詳細
  { w: 318, h: 354, x: 882, y: 145 }, // 編成変更
  { w: 480, h: 456, x: 718, y: 211 }, // 編成展開右列
  { w: 320, h: 480, x: 871, y: 209 }, // 基地航空隊
  { w: 1200, h: 720, x: 0, y: 0 },
  { w: 1200, h: 720, x: 0, y: 0 },
  { w: 1200, h: 720, x: 0, y: 0 },
  { w: 1200, h: 720, x: 0, y: 0 }
];

function restore_init() {
  for (let i = 1; i <= 8; i++) {
    let view_type_key = "view_type_" + i;
    chrome.storage.local.get(view_type_key, (res) => {
      if (res[view_type_key] == null) {
        chrome.storage.local.set({ [view_type_key]: templates[i] }, () => {
          console.log("init option: " + view_type_key);
        });
      }
    });
  }
}

function saveOption(event) {
  let selected_value = document.querySelector("#view_list").value;
  let data_key = "view_type_" + selected_value;
  let view_data = {
    w: parseInt(document.querySelector("#width").value),
    h: parseInt(document.querySelector("#height").value),
    x: parseInt(document.querySelector("#x").value),
    y: parseInt(document.querySelector("#y").value)
  };

  chrome.storage.local.set({ [data_key]: view_data }, () => {
    console.log("config saved: " + view_data);
  });

  event.preventDefault();
}

function loadOption(type_num) {
  let data_key = "view_type_" + type_num;
  chrome.storage.local.get(data_key, (res) => {
    if (res[data_key] == null) {
      res[data_key] = templates[type_num];
      chrome.storage.local.set({ [data_key]: templates[type_num]}, () => { });
    }

    document.querySelector("#width").value = res[data_key].w;
    document.querySelector("#height").value = res[data_key].h;
    document.querySelector("#x").value = res[data_key].x;
    document.querySelector("#y").value = res[data_key].y;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  restore_init();
  chrome.storage.local.get("current_view_type", (res) => {
    console.log("init current_view_type: " + res.current_view_type);
    let init_select = 1;
    if (res.current_view_type != null) {
      init_select = res.current_view_type;
    }
    document.querySelector("#view_list").value = init_select;
    loadOption(init_select);
  });

  chrome.storage.local.get(["layout", "mask"], (res) => {
    if (res["layout"] == null) {
      res["layout"] = 0;
    }
    document.querySelector('input[name="layout"][value="' + res["layout"] + '"]').checked = true;

    if (res["mask"] == null) {
      res["mask"] = false;
    }
    document.querySelector('input[name="mask"]').checked = res["mask"];
  });
});

document.querySelector("form").addEventListener("submit", saveOption);

document.querySelector("#view_list").addEventListener('change', (e) => {
  selected_id = e.target.value;
  loadOption(selected_id);
  chrome.storage.local.set({ "current_view_type": selected_id }, () => {
    console.log("change current_view_type: " + selected_id);
  });
  browser.runtime.sendMessage({ type: "reset" });
});

document.querySelectorAll('input[name="layout"]').forEach(div => {
  div.addEventListener('change', function (e) {
    let layout = e.target.value;
    chrome.storage.local.set({ "layout": layout }, () => {
      console.log("layout: " + layout);
    });
  });
});

document.querySelector('input[name="mask"]').addEventListener('change', (e) => {
  let mask = e.target.checked;
  chrome.storage.local.set({ "mask": mask }, () => {
    console.log("mask: " + mask);
  });
});