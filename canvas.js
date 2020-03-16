//
// NOTE:
// You need to call requestAnimationFrame before calling toDataURL
// to prevent from clearing frame buffer.
//
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type == 'canvas') {
    window.requestAnimationFrame(function () {
      let canvas = document.getElementsByTagName('canvas');
      let image_data = canvas[0].toDataURL('image/png');
      chrome.runtime.sendMessage({ type: "image_data", data: image_data, mode: request.mode });
      /*
      canvas[0].toBlob((blob) => {
        console.log(blob);
        chrome.runtime.sendMessage({ type: "image_data", data: blob });
      }, 'image/png');
      */
    });
  }
});