import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import '@radix-ui/themes/styles.css';
import getIsPopup from './lib/isPupup';

const rootDOM = document.createElement('div');
rootDOM.id = 'dev-diff-root';
rootDOM.style.minWidth = '300px';
rootDOM.style.minHeight = '400px';
if (!getIsPopup()) {
  rootDOM.style.zIndex = '9999';
  rootDOM.style.position = 'fixed';
}

document.body.append(rootDOM);

ReactDOM.createRoot(document.getElementById('dev-diff-root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
