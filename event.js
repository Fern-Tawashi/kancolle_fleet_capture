function key_input_event(code) {
  //console.log(code);
  if (code === 'KeyS') { // 's'
    browser.runtime.sendMessage({ type: "capture" });
  }
  if (code === 'KeyX') { // 'x'
    browser.runtime.sendMessage({ type: "output" });
  }
  if (code === 'KeyA') { // 'a'
    browser.runtime.sendMessage({ type: "fullscreen" });
  }
  if (code === 'KeyQ') { // 'q'
    browser.runtime.sendMessage({ type: "quickx6" });
  }
  if (code === 'BracketRight') { // '['
    browser.runtime.sendMessage({ type: "modeselect", num: -1 });
  }
  if (code === 'Backslash') { // ']'
    browser.runtime.sendMessage({ type: "modeselect", num: +1 });
  }
  if (code === 'Digit1') { // '1'
    browser.runtime.sendMessage({ type: "addition", num: 1 });
  }
  if (code === 'Digit2') { // '2'
    browser.runtime.sendMessage({ type: "addition", num: 2 });
  }
  if (code === 'Digit3') { // '3'
    browser.runtime.sendMessage({ type: "addition", num: 3 });
  }
  if (code === 'Digit4') { // '4'
    browser.runtime.sendMessage({ type: "addition", num: 4 });
  }
}