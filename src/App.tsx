/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { useTranslation } from 'react-i18next';
import { Button, Flex, Text, Theme } from '@radix-ui/themes';
import { Figma, XmarkCircleSolid } from 'iconoir-react';
import './i18n';

import { THEME_MODE } from './lib/constants';
import ReviewForm from './ReviewForm';
import SettingForm from './SettingForm';
import './App.css';
import { Inspector } from './Inspector';
import getIsPopup from './lib/isPupup';

type ThemeMode = 'light' | 'dark' | 'inherit';

function App() {
  const [initing, setIniting] = React.useState(true);

  const [themeMode, setThemeMode] = React.useState<ThemeMode>('light');

  useEffect(() => {
    chrome.storage.sync.get(THEME_MODE).then((res) => {
      setThemeMode(res[THEME_MODE] ?? 'light');
      setIniting(false);
    });
  }, []);

  useEffect(() => {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes[THEME_MODE]) {
        setThemeMode(changes[THEME_MODE].newValue);
      }
    });
  }, []);

  return <Theme appearance={themeMode}>{initing ? null : <Content />}</Theme>;
}

function Content() {
  const { t, i18n } = useTranslation();
  const [themeMode, setThemeMode] = React.useState<ThemeMode>('light');
  const [position, setPosition] = useState({ x: 0, y: 500 });
  const isDraggingRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  // 当鼠标按下时，记录初始位置
  const handleMouseDown = useCallback(
    (event) => {
      console.log('handleMouseDown', {
        event,
      });
      isDraggingRef.current = true;
      offsetRef.current = {
        x: event.clientX - position.x,
        y: event.clientY - position.y,
      };
      document.body.style.userSelect = 'none';
    },
    [position.x, position.y]
  );

  // 当鼠标移动时，更新位置
  const handleMouseMove = useCallback((event) => {
    if (isDraggingRef.current) {
      console.log('isDragging', isDraggingRef.current, {
        event,
        offsetRef: offsetRef.current,
      });
      setPosition({
        x: event.clientX - offsetRef.current.x,
        y: event.clientY - offsetRef.current.y,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当鼠标松开时，停止拖动
  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 绑定全局事件监听器
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // 在组件卸载时清理事件监听器
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleClick = useCallback(() => {
    console.log('click');
  }, []);

  useEffect(() => {
    chrome.storage.sync.get(THEME_MODE).then((res) => {
      setThemeMode(res[THEME_MODE] ?? 'light');
    });
  }, []);

  const isPopup = useMemo(() => {
    return getIsPopup();
  }, []);

  if (isPopup) {
    return (
      <div className="fd-px-8 fd-pt-4">
        <SettingForm />
      </div>
    );
  }
  // if (!isPopup) {
  //   return <Inspector />;
  // }

  return (
    <div
      className="fd-right-0 fd-flex fd-flex-col gap-2"
      style={{
        position: 'fixed',
        top: position.y,
      }}
    >
      {/* toolbar */}
      {/* <div className="fd-text-xs fd-text-gray-200">
        <XmarkCircleSolid />
      </div> */}
      <div
        className="fd-flex fd-flex-row fd-gap-2 fd-bg-blue-500 fd-text-white fd-px-3 fd-py-2 fd-rounded-l-full fd-cursor-pointer fd-opacity-50"
        onMouseDown={handleMouseDown}
        onClick={handleClick}
      >
        <Figma />
      </div>
    </div>
  );
}
export default App;
