let isOpen = false;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
chrome.action.onClicked.addListener(() => {
  // 发信息
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    chrome.tabs.sendMessage(tabs[0].id, { open: isOpen }, (response) => {
      console.log(`background -> content script infos have been received. open: ${response.open}`);
      isOpen = response.open;
    });
  });
});
