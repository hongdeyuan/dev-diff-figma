/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Popover, Theme, Tooltip } from '@radix-ui/themes';
import { CheckCircleSolid, Figma, List, Plus, Settings } from 'iconoir-react';

import './i18n';

import { ENABLE, FIGMA_TOKEN, SUSPEND, THEME_MODE } from './lib/constants';
import SettingForm from './components/SettingForm';
import './App.css';
import getIsPopup from './lib/isPupup';
import { cn } from './lib/cn';
import { useTranslation } from 'react-i18next';
import { Inspector } from './components/Inspector';
import Reviewer from './components/Reviewer';
import CompareList from './components/CompareList';

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

  const listener = useCallback((changes) => {
    if (changes[THEME_MODE]) {
      setThemeMode(changes[THEME_MODE].newValue);
    }
  }, []);

  useEffect(() => {
    chrome.storage.onChanged.addListener(listener);
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, [listener]);

  return (
    <Theme accentColor="violet" appearance={themeMode}>
      {initing ? null : <Content />}
    </Theme>
  );
}

function Content() {
  const [initing, setIniting] = useState(true);
  const [enable, setEnable] = useState(false);
  const [suspend, setSuspend] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get().then((res) => {
      setSuspend(res[SUSPEND] ?? false);
      setEnable(res[ENABLE] ?? false);
      setIniting(false);
    });
  }, []);

  const listener = useCallback((changes) => {
    if (changes[SUSPEND]) {
      setSuspend(changes[SUSPEND].newValue);
    }
  }, []);

  useEffect(() => {
    chrome.storage.onChanged.addListener(listener);
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, [listener]);

  const isPopup = useMemo(() => {
    return getIsPopup();
  }, []);

  if (initing) {
    return null;
  }

  if (isPopup) {
    return (
      <div className="fd-px-4 fd-pt-4 fd-pb-[48px]">
        <SettingForm />
      </div>
    );
  }
  return <div id="dev-diff-content">{suspend && <Suspend defaultEnable={enable} />}</div>;
}

function Suspend({ defaultEnable = false }: { defaultEnable?: boolean }) {
  const [position, setPosition] = useState({ x: 0, y: 500 });
  const isDraggingRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });
  const [isHover, setIsHover] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [compareListOpen, setCompareListOpen] = useState(false);
  const [enable, setEnable] = useState(defaultEnable);
  const [figmaToken, setFigmaToken] = useState('');

  const { t } = useTranslation();

  const root = document
    .querySelector('#dev-diff-shadow')
    ?.shadowRoot?.querySelector('#dev-diff-content');

  useEffect(() => {
    chrome.storage.sync.get(FIGMA_TOKEN).then((res) => {
      setFigmaToken(res[FIGMA_TOKEN] ?? '');
    });
  }, []);

  useEffect(() => {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes[ENABLE]) {
        setEnable(changes[ENABLE].newValue);
      }
      if (changes[FIGMA_TOKEN]) {
        setFigmaToken(changes[FIGMA_TOKEN].newValue);
      }
    });
  }, []);

  // 当鼠标按下时，记录初始位置
  const handleMouseDown = useCallback(
    (event) => {
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
    chrome.storage.sync.set({
      [ENABLE]: !enable,
    });
  }, [enable]);

  const handleMouseOver = useCallback(() => {
    if (popoverOpen) {
      return;
    }
    setIsHover(true);
  }, [popoverOpen]);

  const handleMouseLeave = useCallback(() => {
    setIsHover(false);
  }, []);

  return (
    <>
      <div
        className={cn('fd-right-0 fd-flex fd-flex-col fd-gap-2 fd-z-[9999]')}
        style={{
          position: 'fixed',
          top: position.y,
        }}
        onMouseLeave={handleMouseLeave}
      >
        <div
          title={t('启用')}
          className={cn(
            'fd-flex fd-flex-row fd-gap-2 fd-bg-violet-500 fd-text-white fd-px-3 fd-py-2 fd-rounded-l-full fd-cursor-pointer fd-opacity-50 fd-transition-all fd-pr-4',
            'fd-translate-x-[16px] fd-w-[56px]',
            {
              'fd-opacity-100 !fd-translate-x-0': isHover || popoverOpen || compareListOpen,
            }
          )}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
          onMouseOver={handleMouseOver}
        >
          <div className="fd-relative">
            <Figma />
            {enable && (
              <CheckCircleSolid className="fd-absolute fd-bottom-0 fd-right-0 fd-translate-x-[4px] fd-translate-y-[4px] fd-text-xs fd-text-green-300" />
            )}
          </div>
        </div>
        <div
          className={cn(
            'fd-flex fd-flex-col fd-gap-3 fd-bg-white fd-rounded-full fd-p-3 fd-shadow-md fd-translate-x-[56px] fd-text-sm fd-transition-all fd-w-[40px]',
            'fd-items-center fd-cursor-pointer',
            {
              'fd-translate-x-0': isHover || popoverOpen || compareListOpen,
            }
          )}
        >
          <Tooltip
            content={figmaToken ? t('新增') : t('请先设置 Figma Token')}
            side="left"
            container={root}
          >
            <Plus
              className={cn({
                'fd-cursor-not-allowed fd-opacity-50': !figmaToken,
              })}
              onClick={() => {
                if (figmaToken) {
                  setInspectorOpen(true);
                }
              }}
            />
          </Tooltip>
          <Popover.Root open={compareListOpen} onOpenChange={setCompareListOpen}>
            <Tooltip content={t('列表')} side="left" container={root}>
              <Popover.Trigger>
                <List />
              </Popover.Trigger>
            </Tooltip>
            <Popover.Content
              side="left"
              container={root}
              sideOffset={20}
              className="!fd-rounded-2xl "
            >
              <CompareList />
            </Popover.Content>
          </Popover.Root>
          <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
            <Tooltip content={t('设置')} side="left" container={root}>
              <Popover.Trigger>
                <Settings onClick={() => setPopoverOpen(true)} />
              </Popover.Trigger>
            </Tooltip>
            <Popover.Content
              side="left"
              container={root}
              sideOffset={20}
              className="!fd-rounded-2xl"
            >
              <div className="fd-w-[300px]  fd-p-4 fd-min-h-[400px]">
                <SettingForm showSuspend={false} />
              </div>
            </Popover.Content>
          </Popover.Root>
        </div>
      </div>
      <Inspector
        open={inspectorOpen}
        onClose={() => {
          setInspectorOpen(false);
        }}
      />
      <Reviewer inspectorOpen={inspectorOpen} />
    </>
  );
}
export default App;
