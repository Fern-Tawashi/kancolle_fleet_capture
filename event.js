function key_input_event(code) {
  //console.log(code);
  if (code === 'KeyS') { // 's'
    chrome.runtime.sendMessage({ type: "capture" });
  }
  if (code === 'KeyX') { // 'x'
    chrome.runtime.sendMessage({ type: "output" });
  }
  if (code === 'KeyA') { // 'a'
    chrome.runtime.sendMessage({ type: "fullscreen" });
  }
  if (code === 'KeyW') { // 'W'
    chrome.runtime.sendMessage({ type: "number" });
  }
  if (code === 'KeyQ') { // 'q'
    chrome.runtime.sendMessage({ type: "quickx6" });
  }
  if (code === 'KeyR') { // 'r'
    chrome.runtime.sendMessage({ type: "layout" });
  }
  if (code === 'BracketRight') { // '['
    chrome.runtime.sendMessage({ type: "modeselect", num: -1 });
  }
  if (code === 'Backslash') { // ']'
    chrome.runtime.sendMessage({ type: "modeselect", num: +1 });
  }
  if (code === 'Digit1') { // '1'
    chrome.runtime.sendMessage({ type: "addition", num: 1 });
  }
  if (code === 'Digit2') { // '2'
    chrome.runtime.sendMessage({ type: "addition", num: 2 });
  }
  if (code === 'Digit3') { // '3'
    chrome.runtime.sendMessage({ type: "addition", num: 3 });
  }
  if (code === 'Digit4') { // '4'
    chrome.runtime.sendMessage({ type: "addition", num: 4 });
  }
  if (code === 'Digit5') { // '5'
    chrome.runtime.sendMessage({ type: "addition", num: 5 });
  }
  if (code === 'Digit6') { // '6'
    chrome.runtime.sendMessage({ type: "addition", num: 6 });
  }
}