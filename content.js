window.addEventListener("keydown", (event) => {
  if (event.keyCode == 83) {
    browser.runtime.sendMessage({ type: "capture" });
  }

  if (event.keyCode == 88) {
    browser.runtime.sendMessage({ type: "output" });
  }
});
