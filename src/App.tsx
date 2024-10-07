/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { useTranslation } from 'react-i18next';
import { Button, Flex, Text, Theme } from '@radix-ui/themes';
import './i18n';

import { THEME_MODE } from './lib/constants';
import ReviewForm from './ReviewForm';
import SettingForm from './SettingForm';
import './App.css';

type ThemeMode = 'light' | 'dark' | 'inherit';

function App() {
  const { t, i18n } = useTranslation();
  const defaultTheme = (window.localStorage.getItem(THEME_MODE) ?? 'light') as ThemeMode;
  const [themeMode, setThemeMode] = React.useState<ThemeMode>(defaultTheme);

  return (
    <Theme appearance={themeMode}>
      <div>
        {/* top bar */}
        <div>
          <div className="flex items-center mx-4">
            <header className="flex-1 font-medium leading-[48px]">
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

        <Tabs.Root className="px-4 pt-2" defaultValue="review">
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
    </Theme>
  );
}

export default App;
