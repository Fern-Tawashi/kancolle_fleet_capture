window.addEventListener("keydown", (event) => {
  //console.log(event.keyCode);
  if (event.keyCode == 83) { // 's'
    browser.runtime.sendMessage({ type: "capture" });
  }
  if (event.keyCode == 88) { // 'x'
    browser.runtime.sendMessage({ type: "output" });
  }
  if (event.keyCode == 65) { // 'a'
    browser.runtime.sendMessage({ type: "fullscreen" });
  }
  if (event.keyCode == 219) { // '['
    browser.runtime.sendMessage({ type: "modeselect", num: -1 });
  }
  if (event.keyCode == 221) { // ']'
    browser.runtime.sendMessage({ type: "modeselect", num: +1 });
  }
  if (event.keyCode == 49) { // '1'
    browser.runtime.sendMessage({ type: "addition", num: 1 });
  }
  if (event.keyCode == 50) { // '2'
    browser.runtime.sendMessage({ type: "addition", num: 2 });
  }
  if (event.keyCode == 51) { // '3'
    browser.runtime.sendMessage({ type: "addition", num: 3 });
  }
  if (event.keyCode == 52) { // '4'
    browser.runtime.sendMessage({ type: "addition", num: 4 });
  }
});
