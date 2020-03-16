window.addEventListener("keydown", (event) => {
  //console.log(event.keyCode);
  if (event.keyCode == 83) {
    browser.runtime.sendMessage({ type: "capture" });
  }

  if (event.keyCode == 88) {
    browser.runtime.sendMessage({ type: "output" });
  }

  if (event.keyCode == 65) {
    browser.runtime.sendMessage({ type: "fullscreen" });
  }
});
