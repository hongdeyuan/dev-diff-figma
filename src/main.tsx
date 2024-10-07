import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import '@radix-ui/themes/styles.css';

const rootDOM = document.createElement('div');
rootDOM.id = 'dev-diff-root';
rootDOM.style.minWidth = '300px';
rootDOM.style.minHeight = '400px';

document.body.append(rootDOM);

ReactDOM.createRoot(document.getElementById('dev-diff-root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
