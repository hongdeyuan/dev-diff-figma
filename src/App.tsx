/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useMemo } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { useTranslation } from 'react-i18next';
import { Button, Flex, Text, Theme } from '@radix-ui/themes';
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

  useEffect(() => {
    chrome.storage.sync.get(THEME_MODE).then((res) => {
      setThemeMode(res[THEME_MODE] ?? 'light');
    });
  }, []);

  const isPopup = useMemo(() => {
    return getIsPopup();
  }, []);

  if (!isPopup) {
    console.log('当前代码不在插件的 popup 页面中执行');
    return <Inspector />;
  }

  if (isPopup) {
    return (
      <div className="fd-px-8 fd-pt-4">
        <SettingForm />
      </div>
    );
  }

  return (
    <div>
      {/* top bar */}
      <div>
        <div className="fd-flex fd-items-center fd-mx-4">
          <header className="fd-flex-1 fd-font-medium fd-leading-[48px]">
            <Text>Dev Diff Figma</Text>
          </header>
          <Flex gap="2">
            <Button
              title={t('切换主题')}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setThemeMode(themeMode === 'light' ? 'dark' : 'light');
                window.localStorage.setItem(THEME_MODE, themeMode === 'light' ? 'dark' : 'light');
              }}
            >
              {themeMode === 'light' ? '🌙' : '🌞'}
            </Button>
            <Button
              title={t('切换语言')}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh');
              }}
            >
              {i18n.language === 'en' ? '中' : 'EN'}
            </Button>
          </Flex>
        </div>
        <hr />
      </div>

      <Tabs.Root className="fd-px-4 fd-pt-2" defaultValue="review">
        <Tabs.List aria-label="Manage your figma file" className="TabsList">
          <Tabs.Trigger className="TabsTrigger" value="review">
            <Text>{t('审查')}</Text>
          </Tabs.Trigger>
          <Tabs.Trigger className="TabsTrigger" value="setting">
            <Text>{t('设置')}</Text>
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="review" className="TabsContent">
          <ReviewForm />
        </Tabs.Content>
        <Tabs.Content value="setting" className="TabsContent">
          <SettingForm />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
export default App;
