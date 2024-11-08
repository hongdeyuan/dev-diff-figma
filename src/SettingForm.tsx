/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Button, Flex, Text, TextArea, useThemeContext } from '@radix-ui/themes';

import { Form, Field, FieldGroup } from './components';
import { FIGMA_TOKEN, THEME_MODE } from './lib/constants';

interface FormValues {
  token?: string;
}

function SettingForm() {
  const { appearance } = useThemeContext();

  const { t, i18n } = useTranslation();
  const [defaultToken, setDefaultToken] = React.useState('');
  const [initing, setIniting] = React.useState(true);

  console.log('defaultToken', defaultToken);

  useEffect(() => {
    setIniting(true);
    chrome.storage.sync.get().then((res) => {
      setDefaultToken(res[FIGMA_TOKEN] ?? '');
      setIniting(false);
    });
  }, []);

  const onSubmit = React.useCallback(async (data: unknown) => {
    const curData = data as FormValues;
    chrome.storage.sync.set({
      [FIGMA_TOKEN]: curData.token ?? '',
    });
  }, []);

  if (initing) return null;

  return (
    <>
      <div className="fd-flex fd-items-center fd-mx-4">
        <header className="fd-flex-1 fd-font-medium fd-leading-[48px]">
          <Text>Dev Diff Figma</Text>
        </header>
        <Flex gap="2">
          <Button
            title={t('切换主题')}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              chrome.storage.sync.set({
                [THEME_MODE]: appearance === 'light' ? 'dark' : 'light',
              });
            }}
          >
            {appearance === 'light' ? '🌙' : '🌞'}
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
      <Form schema={getSchema()} defaultValues={{ token: defaultToken }} onSubmit={onSubmit}>
        <FormItems />
        <Flex gap="1" className="fd-mt-4">
          <Button type="submit">{t('保存')}</Button>
        </Flex>
      </Form>
    </>
  );
}

export default SettingForm;

function getSchema() {
  return yup.object().shape({
    token: yup.string().optional(),
  });
}

function FormItems() {
  const { t } = useTranslation();
  const { control } = useFormContext<FormValues>();

  return (
    <FieldGroup>
      <Field label={t('Figma 令牌')}>
        <Controller
          name="token"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              rows={4}
              placeholder={t('请输入 figma token')}
              className="Textarea"
              style={{ width: '100%', lineHeight: '16px', borderRadius: '4px', zIndex: 2147483647 }}
              onDrag={(e) => {
                e.preventDefault();
              }}
            />
          )}
        />
      </Field>
    </FieldGroup>
  );
}
