export default function getIsPopup() {
  if (!('getViews' in chrome.extension)) return false;
  const views = chrome.extension.getViews({ type: 'popup' });
  return views.length > 0;
}
