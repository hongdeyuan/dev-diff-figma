/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { Box, Button, Flex, TextArea } from '@radix-ui/themes';
import { useFormContext, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import * as Slider from '@radix-ui/react-slider';

import { Form, Field, FieldGroup } from './components';
import { FIGMA_TOKEN, FIGMA_URL, BROWSER_SELECTOR, LAYER_OPACITY } from './lib/constants';

interface FormValues {
  token?: string;
  figmaUrl?: string;
  selector?: string;
  opacity?: number;
}

function ReviewForm() {
  const { t } = useTranslation();
  const [viewing, setViewing] = React.useState<boolean>(false);
  const [canceling, setCanceling] = React.useState<boolean>(false);

  const defaultToken = window.localStorage.getItem(FIGMA_TOKEN) ?? '';
  const defaultFigmaUrl = window.localStorage.getItem(FIGMA_URL) ?? '';
  const defaultSelector = window.localStorage.getItem(BROWSER_SELECTOR) ?? '';
  const defaultOpacity = +(window.localStorage.getItem(LAYER_OPACITY) ?? '0.5');
  const onSubmit = React.useCallback(async (data: unknown) => {
    const curData = data as FormValues;
    // 存储到 localStorage
    window.localStorage.setItem(FIGMA_URL, curData.figmaUrl ?? '');
    window.localStorage.setItem(BROWSER_SELECTOR, curData.selector ?? '');
    window.localStorage.setItem(LAYER_OPACITY, `${curData.opacity}` ?? '0.5');
    setViewing(true); // 正在审查

    const file_key = getFileKeyFromUrl(curData.figmaUrl);
    const file_ids = getNodeIdFromUrl(curData.figmaUrl);
    const token = curData.token;
    const images = await getFigmaS3Url(token, file_key, file_ids);
    const figmaImageS3Url = images?.[file_ids.replace(/-/g, ':')] ?? '';

    const tab = await getCurrentTab();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // 发送消息给 content script
    await chrome.tabs.sendMessage(
      tab.id,
      {
        done: true,
        selector: curData.selector ?? '',
        figmaImageS3Url: figmaImageS3Url,
        opacity: curData.opacity,
      },
      () => {
        setViewing(false); // 审查成功
        console.log('done: popup -> content script infos have been received.');
      }
    );
  }, []);

  const cancelReView = React.useCallback(async () => {
    setCanceling(true); // 取消中

    const tab = await getCurrentTab();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await chrome.tabs.sendMessage(
      tab.id,
      {
        done: false, // 取消
      },
      () => {
        setCanceling(false); // 取消成功
        console.log('cancel: popup -> content script infos have been received.');
      }
    );
  }, []);

  return (
    <Form
      schema={getSchema()}
      defaultValues={{
        token: defaultToken,
        figmaUrl: defaultFigmaUrl,
        selector: defaultSelector,
        opacity: defaultOpacity,
      }}
      onSubmit={onSubmit}
    >
      <FormItems />
      <Flex gap="2" className="mt-2">
        <Button
          disabled={viewing || canceling}
          style={{
            cursor: viewing || canceling ? 'not-allowed' : 'pointer',
          }}
          type="submit"
        >
          {t('开始审查')}
        </Button>
        <Button
          color="red"
          disabled={viewing || canceling}
          style={{
            cursor: viewing || canceling ? 'not-allowed' : 'pointer',
          }}
          onClick={(e) => {
            e.preventDefault();
            cancelReView();
          }}
        >
          {t('取消审查')}
        </Button>
      </Flex>
    </Form>
  );
}

export default ReviewForm;

function getSchema() {
  return yup.object().shape({
    token: yup
      .string()
      .optional()
      .test({
        test: function (token, context: yup.TestContext) {
          return !token
            ? context.createError({
                message: '请先在「设置」中设置 figma token',
              })
            : true;
        },
      }),
    figmaUrl: yup
      .string()
      .optional()
      .test({
        test: function (figmaUrl, context: yup.TestContext) {
          return !figmaUrl
            ? context.createError({
                message: '请输入 figmaUrl',
              })
            : true;
        },
      }),
    selector: yup
      .string()
      .optional()
      .test({
        test: function (selector, context: yup.TestContext) {
          return !selector
            ? context.createError({
                message: '请输入 selector',
              })
            : true;
        },
      }),
  });
}

function getNodeIdFromUrl(url: string) {
  const regex = new RegExp('[?&]' + 'node-id' + '(=([^&#]*)|&|#|$)');
  const match = url.match(regex);

  if (match && match[1]) {
    return match[1].replace(/=/g, '');
  }

  return '';
}

function getFileKeyFromUrl(url: string) {
  const fileKeyReg = /\/([^?]+)/;
  const matchStrArray = (url.match(fileKeyReg)?.[0] ?? '').split('/');
  const fileKey = matchStrArray?.[matchStrArray.length - 2] ?? '';
  return fileKey;
}

function FormItems() {
  const { t } = useTranslation();
  const {
    control,
    formState: { errors },
  } = useFormContext<FormValues>();

  return (
    <FieldGroup>
      {errors['token'] && (
        <Box style={{ border: '1px solid red', color: 'red' }}>{errors['token'].message ?? ''}</Box>
      )}
      <Field label={t('Figma 图层地址')}>
        <Controller
          name="figmaUrl"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              rows={4}
              className="Textarea"
              style={{
                width: '100%',
                lineHeight: '16px',
                borderRadius: '4px',
                zIndex: 2147483647,
                borderColor: errors['figmaUrl'] ? 'red' : 'inherit',
              }}
              placeholder={t('请输入 figma 图层地址')}
              onBlur={() => {
                window.localStorage.setItem(FIGMA_URL, field.value ?? '');
              }}
              onDrag={(e) => {
                e.preventDefault();
              }}
            />
          )}
        />
      </Field>
      <Field label={t('Dom 选择器')}>
        <Controller
          name="selector"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              rows={4}
              className="Textarea"
              style={{
                width: '100%',
                lineHeight: '16px',
                borderRadius: '4px',
                borderColor: errors['selector'] ? 'red' : 'inherit',
                zIndex: 2147483647,
              }}
              placeholder={t('支持 css selector')}
              onBlur={() => {
                window.localStorage.setItem(BROWSER_SELECTOR, field.value ?? '');
              }}
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
            <div className="flex items-center gap-4">
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-[20px]"
                onValueChange={(v) => {
                  field.onChange(v[0]);
                }}
                onValueCommit={async () => {
                  const tab = await getCurrentTab();
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  // 发送消息给 content script
                  await chrome.tabs.sendMessage(
                    tab.id,
                    {
                      updateOpacity: true,
                      opacity: field.value,
                    },
                    () => {
                      console.log('done: popup -> content script infos have been received.');
                    }
                  );
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
    </FieldGroup>
  );
}

async function getFigmaS3Url(file_token: string, file_key: string, file_ids: string) {
  const rawData = await figmaFetch(
    `https://api.figma.com/v1/images/${file_key}?ids=${file_ids}&use_absolute_bounds=true`,
    {
      method: 'get',
      headers: {
        'X-FIGMA-TOKEN': file_token,
      },
    },
    function (data) {
      return data;
    },
    function nothing() {}
  );

  const figmaS3Images = rawData?.images ?? {};

  return figmaS3Images;
}

// 发起网络请求
function figmaFetch(url, init, cb, onError) {
  return fetch(url, init)
    .then((resp) => resp.json())
    .then((data) => {
      return cb && cb(data);
    })
    .catch((err) => {
      if (onError) {
        return onError(err);
      }
    });
}

async function getCurrentTab() {
  const queryOptions = { active: true, currentWindow: true };
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}