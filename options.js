function saveOptions(e) {
  let w = parseInt(document.querySelector("#width").value);
  let h = parseInt(document.querySelector("#height").value);
  let x = parseInt(document.querySelector("#x").value);
  let y = parseInt(document.querySelector("#y").value);

  chrome.storage.local.set({
    width: w,
    height: h,
    x: x,
    y: y
  }, () => {
    console.log("config saved: " + w + ", " + h + ", " + x + ", " + y);
  });
  e.preventDefault();
}

function restoreOptions() {
  chrome.storage.local.get(['width', 'height', 'x', 'y'], (res) => {
    if (res.width != null) {
      document.querySelector("#width").value = res.width;
    }
    if (res.height != null) {
      document.querySelector("#height").value = res.height;
    }
    if (res.x != null) {
      document.querySelector("#x").value = res.x;
    }
    if (res.y != null) {
      document.querySelector("#y").value = res.y;
    }
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
