import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import '@radix-ui/themes/styles.css';

import getIsPopup from './lib/isPupup';

async function insertCSS(parent: ShadowRoot) {
  const e = document.createElement('style');
  e.setAttribute('type', 'text/css');
  await fetch(chrome.runtime.getURL('dist/assets/index.css'))
    .then((response) => response.text())
    .then((css) => {
      e.textContent = css;
      parent.appendChild(e);
    });
}

const shadowDom = document.createElement('div');
shadowDom.id = 'dev-diff-shadow';
const shadowRoot = shadowDom.attachShadow({ mode: 'open' });

const rootDOM = document.createElement('div');
rootDOM.id = 'dev-diff-root';
if (!getIsPopup()) {
  rootDOM.style.zIndex = '9999';
  rootDOM.style.position = 'fixed';
} else {
  rootDOM.style.minWidth = '300px';
  rootDOM.style.minHeight = '400px';
}

insertCSS(shadowRoot).then(() => {
  shadowRoot.appendChild(rootDOM);
  document.documentElement.appendChild(shadowDom);

  ReactDOM.createRoot(rootDOM).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
