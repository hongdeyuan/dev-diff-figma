const viewId = 'view-diff';
// 监听接收信息
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const viewDom = document.getElementById(viewId);
  if (request.updateOpacity && viewDom) {
    viewDom.style.opacity = `${request.opacity}` ?? '0.5';
    sendResponse({ received: true });
    return;
  }
  if (request.done) {
    if (viewDom) {
      viewDom.style.background = `url("${request.figmaImageS3Url}")`;
      viewDom.style.opacity = `${request.opacity}` ?? '0.5';
      const targetDom = document.querySelector(request.selector);

      const targetClientRect = targetDom.getBoundingClientRect();
      const targetTop = targetClientRect.top;
      const targetLeft = targetClientRect.left;
      const targetWidth = targetClientRect.width;
      const targetHeight = targetClientRect.height;

      viewDom.style.top = `${targetTop}px`;
      viewDom.style.left = `${targetLeft}px`;
      viewDom.style.width = `${targetWidth}px`;
      viewDom.style.height = `${targetHeight}px`;
    } else {
      const viewDom = document.createElement('div');
      viewDom.id = viewId;
      viewDom.style.background = `url("${request.figmaImageS3Url}")`;
      viewDom.style.backgroundRepeat = 'no-repeat';
      viewDom.style.opacity = `${request.opacity}` ?? '0.5';
      viewDom.style.zIndex = '2147483647';

      const targetDom = document.querySelector(request.selector);
      const bodyDom = document.querySelector('body');

      const targetClientRect = targetDom.getBoundingClientRect();
      const targetTop = targetClientRect.top;
      const targetLeft = targetClientRect.left;
      const targetWidth = targetClientRect.width;
      const targetHeight = targetClientRect.height;

      viewDom.style.top = `${targetTop}px`;
      viewDom.style.left = `${targetLeft}px`;
      viewDom.style.width = `${targetWidth}px`;
      viewDom.style.height = `${targetHeight}px`;
      viewDom.style.position = 'absolute';
      viewDom.style.border = 'none';

      bodyDom.appendChild(viewDom);
    }
  } else {
    viewDom.parentNode.removeChild(viewDom);
    console.log('== CANCEL ==');
  }
  sendResponse({ received: true });

  console.log('== DONE ==');
});
