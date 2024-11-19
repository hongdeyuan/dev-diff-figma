function findIndex(ele: Element, currentTag: string) {
  let nth = 0;
  while (ele) {
    if (ele.nodeName.toLowerCase() === currentTag) nth += 1;
    ele = ele.previousElementSibling;
  }
  return nth;
}

function getXPath(ele: Element) {
  if (!ele) return '';

  if (ele.hasAttribute('id')) {
    return `//${ele.tagName.toLowerCase()}[@id="${ele.id}"]`;
  }

  if (ele.hasAttribute('class')) {
    return `//${ele.tagName.toLowerCase()}[@class="${ele.getAttribute('class')}"]`;
  }

  const path = [];
  while (ele.nodeType === Node.ELEMENT_NODE) {
    const currentTag = ele.nodeName.toLowerCase();
    const nth = findIndex(ele, currentTag);
    path.push(`${ele.tagName.toLowerCase()}${nth === 1 ? '' : `[${nth}]`}`);
    ele = ele.parentNode as Element;
  }
  return `/${path.reverse().join('/')}`;
}

export default getXPath;
