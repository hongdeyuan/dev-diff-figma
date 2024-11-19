export default function getUniqueSelector(element: Element) {
  const path: string[] = [];
  while (element) {
    let selector = element.tagName.toLowerCase();

    if (element.id) {
      selector += `#${element.id}`;
      path.unshift(selector);
      break;
    } else {
      // 如果没有 ID，使用类名或索引标记
      const siblingIndex = [...element.parentNode.children].indexOf(element) + 1;
      selector += `:nth-child(${siblingIndex})`;
      path.unshift(selector);
      element = element.parentElement;
    }
  }
  return path.join(' > ');
}
