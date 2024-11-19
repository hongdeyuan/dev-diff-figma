import { useEffect, useState } from 'react';
import { FIGMA_TOKEN } from './constants';

export default function useFigmaToken() {
  const [figmaToken, setFigmaToken] = useState<string>('');

  useEffect(() => {
    chrome.storage.sync.get([FIGMA_TOKEN], (res) => {
      setFigmaToken(res[FIGMA_TOKEN] ?? '');
    });
  }, []);

  // 监听变化
  useEffect(() => {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes[FIGMA_TOKEN]) {
        setFigmaToken(changes[FIGMA_TOKEN]?.newValue ?? '');
      }
    });
  }, [figmaToken]);

  return { figmaToken, setFigmaToken };
}
