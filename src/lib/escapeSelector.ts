/**
 * 转义 querySelector 所需的特殊字符
 * @param {string} selector - 要转义的选择器字符串
 * @returns {string} - 已转义的选择器字符串
 */
function escapeSelector(selector) {
  return selector.replace(/([!"$%&'()/:;<=?@[\\\]^`{|}~])/g, '\\$1');
}

export default escapeSelector;
