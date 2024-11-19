import packageJson from '../../package.json';
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect } from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Button, Flex, Switch, Text, TextArea } from '@radix-ui/themes';

import { Form, Field, FieldGroup } from '.';
import {
  COMPARE_LIST,
  ENABLE,
  FIGMA_IMAGE_MAP,
  FIGMA_TOKEN,
  LAYER_OPACITY,
  SUSPEND,
} from '../lib/constants';
import * as Slider from '@radix-ui/react-slider';
import { throttle } from 'es-toolkit';

interface FormValues {
  token?: string;
  suspend?: boolean;
  enable?: boolean;
  opacity?: number;
  [key: string]: unknown;
}

function SettingForm({ showSuspend = true }: { showSuspend?: boolean }) {
  // const { appearance } = useThemeContext();

  const { t, i18n } = useTranslation();

  const [defaultValues, setDefaultValues] = React.useState<FormValues>({});

  const [initing, setIniting] = React.useState(true);

  useEffect(() => {
    setIniting(true);
    chrome.storage.sync.get().then((res) => {
      setDefaultValues({
        token: res[FIGMA_TOKEN] ?? '',
        suspend: res[SUSPEND] ?? false,
        enable: res[ENABLE] ?? false,
      });
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
    <div className="fd-flex fd-flex-col h-full fd-justify-between">
      <div className="fd-flex-1">
        <header className="fd-flex fd-items-center fd-justify-between">
          <Text weight="bold">Figma Diff</Text>
          <Flex gap="2">
            {/* <Button
            className="rounded-full"
            variant="outline"
            size="1"
            title={t('切换主题')}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              chrome.storage.sync.set({
                [THEME_MODE]: appearance === 'light' ? 'dark' : 'light',
              });
            }}
          >
            {appearance === 'light' ? '🌙' : '🌞'}
          </Button> */}
            <Button
              variant="outline"
              size="1"
              title={t('切换语言')}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh');
              }}
            >
              {i18n.language === 'en' ? '中' : 'EN'}
            </Button>
          </Flex>
        </header>
        <div className="fd-mt-8">
          <Form schema={getSchema()} defaultValues={defaultValues} onSubmit={onSubmit}>
            <FormItems showSuspend={showSuspend} />
          </Form>
        </div>
      </div>
      <div className="fd-py-3 fd-bg-gray-100 fd-w-full fd-flex fd-items-center fd-justify-center fd-absolute fd-bottom-0 fd-left-0">
        {/* version */}
        <Text size="1" color="gray">
          {packageJson.version}
        </Text>
      </div>
    </div>
  );
}

export default SettingForm;

function getSchema() {
  return yup.object().shape({
    suspend: yup.boolean().optional(),
    enable: yup.boolean().optional(),
    token: yup.string().optional(),
    opacity: yup.number().optional(),
  });
}

const debounceUpdateStorage = throttle((data: FormValues) => {
  chrome.storage.sync.set(data);
}, 200);

function FormItems({ showSuspend = true }: { showSuspend?: boolean }) {
  const { t } = useTranslation();
  const { control } = useFormContext<FormValues>();
  const value = useWatch();

  useEffect(() => {
    const curData = value as FormValues;
    debounceUpdateStorage({
      [FIGMA_TOKEN]: curData.token ?? '',
      [SUSPEND]: curData.suspend ?? false,
      [ENABLE]: curData.enable ?? false,
      [LAYER_OPACITY]: curData.opacity ?? 0.5,
    });
  }, [value]);

  return (
    <FieldGroup>
      {showSuspend && (
        <Field label={t('开启悬浮球')} className="fd-flex fd-items-center fd-justify-between">
          <Controller
            name="suspend"
            control={control}
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </Field>
      )}
      <Field label={t('开启比对')} className="fd-flex fd-items-center fd-justify-between">
        <Controller
          name="enable"
          control={control}
          render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
        />
      </Field>
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
      <Field label={t('图层不透明度')}>
        <Controller
          name="opacity"
          control={control}
          render={({ field }) => (
            <div className="fd-flex fd-items-center fd-gap-4">
              <Slider.Root
                className="fd-relative fd-flex fd-items-center fd-select-none fd-touch-none fd-w-full fd-h-[20px]"
                onValueChange={(v) => {
                  field.onChange(v[0]);
                }}
                defaultValue={[field.value ?? 0.5]}
                min={0}
                max={1}
                step={0.01}
              >
                <Slider.Track className="SliderTrack">
                  <Slider.Range className="SliderRange" />
                </Slider.Track>
                <Slider.Thumb className="SliderThumb" />
              </Slider.Root>
              <label>{field.value}</label>
            </div>
          )}
        />
      </Field>
      <Field label={t('清除图片缓存')}>
        <Button
          variant="outline"
          size="1"
          onClick={() => {
            chrome.storage.sync.remove([FIGMA_IMAGE_MAP]);
          }}
        >
          {t('清除')}
        </Button>
      </Field>
      <Field label={t('清除比对列表')}>
        <Button
          variant="outline"
          size="1"
          onClick={() => chrome.storage.sync.remove([COMPARE_LIST])}
        >
          {t('清除')}
        </Button>
      </Field>
    </FieldGroup>
  );
}
