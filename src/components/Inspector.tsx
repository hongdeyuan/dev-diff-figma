// import * as htmlToImage from 'html-to-image';
import { Button, Spinner, TextField } from '@radix-ui/themes';
import * as yup from 'yup';
import DomInspector from 'dom-inspector';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Field, FieldGroup, Form } from '.';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { COMPARE_LIST, COMPARE_LIST_BY_TAG } from '../lib/constants';
import getUniqueSelector from '../lib/getUniqueSelector';
import FloatingComponent from './FloatingComponent';
import { getFigmaS3Url } from '../lib/getFigmaS3Url';
import useFigmaToken from '@/lib/useFigmaToken';
import getXPath from '@/lib/getXPath';
import {
  offset as offsetMiddleware,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react';

interface FormValues {
  selector: string;
  figmaUrl: string;
  offset: {
    x: number;
    y: number;
  };
  [key: string]: unknown;
}

export function Inspector({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const inspectorRef = useRef<DomInspector | null>(null);
  const [selector, setSelector] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    inspectorRef.current = new DomInspector({
      root: 'body',
      exclude: ['#dev-diff-shadow'],
      theme: 'inspector-theme',
      // maxZIndex: '', // max z index, if blank, will auto get document.all max z index
    });
  }, []);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      // 判断点击不在 #dev-diff-root 内，在 #dev-diff-root 内则不进行操作
      if (modalOpen) return;
      if (document.querySelector('#dev-diff-shadow')?.contains(e.target as Node)) {
        return;
      }
      e.preventDefault();
      if (inspectorRef.current) {
        const selector = inspectorRef.current.getXPath(e.target as HTMLElement);
        inspectorRef.current.disable();

        setSelector(selector);
        setImageUrl(null);
        setOffset({ x: 0, y: 0 });
        setModalOpen(true);
      }
    },
    [modalOpen]
  );

  // 监听 ESC 关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
  }, [onClose]);

  // 监听点击事件
  useEffect(() => {
    if (open) {
      if (!modalOpen) {
        window.addEventListener('click', handleClick);
        inspectorRef.current?.enable();
      }
    } else {
      setModalOpen(false);
      inspectorRef.current?.disable();
    }

    return () => {
      window.removeEventListener('click', handleClick);
      inspectorRef.current?.disable();
    };
  }, [handleClick, modalOpen, open]);

  // 监听是否存在 data-figma-url 属性
  useEffect(() => {
    const urlList = Array.from(document.querySelectorAll('[data-figma-url]')).map((item) => ({
      figmaUrl: item.getAttribute('data-figma-url'),
      selector: getUniqueSelector(item),
      path: window.location.href,
    }));

    chrome.storage.sync.set({
      [COMPARE_LIST_BY_TAG]: urlList.map((url) => ({
        figmaUrl: url,
        selector: '',
      })),
    });
  }, []);

  const getSchema = () => {
    return yup.object().shape({
      selector: yup.string().required(t('请输入选择器')),
      figmaUrl: yup.string().required(t('请输入 Figma URL')),
      offset: yup.object().shape({
        x: yup.number(),
        y: yup.number(),
      }),
    });
  };

  const defaultValues: FormValues = {
    selector: selector,
    figmaUrl: '',
    offset: { x: 0, y: 0 },
  };

  const onSubmit = (data: FormValues) => {
    const result = {
      selector: data.selector,
      figmaUrl: data.figmaUrl,
      path: window.location.href,
      offset: data.offset,
    };

    // 添加比对
    chrome.storage.sync.get([COMPARE_LIST]).then((res) => {
      chrome.storage.sync.set({
        [COMPARE_LIST]: [...(res[COMPARE_LIST] ?? []), result],
      });
    });

    onClose();
  };

  const { refs, update, floatingStyles, context } = useFloating({
    placement: 'bottom-start',
    open: modalOpen,
    onOpenChange: (open) => {
      if (!open) {
        onClose();
      }
    },
    strategy: 'fixed',
    middleware: [
      offsetMiddleware({
        mainAxis: 8,
      }),
      shift({
        padding: 4,
        crossAxis: true,
      }),
    ],
  });

  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

  return (
    modalOpen && (
      <>
        <FloatingComponent targetXPath={selector} fitTarget>
          <div
            className="fd-absolute fd-top-0 fd-left-0 fd-w-full fd-h-full fd-ring-2 fd-ring-violet-300/50 fd-rounded-md"
            {...getReferenceProps()}
            ref={refs.setReference}
          >
            {imageUrl && (
              <img
                src={imageUrl}
                alt="figma preview"
                className=" fd-rounded-md fd-w-fit fd-h-fit fd-max-w-fit fd-max-h-fit fd-opacity-50"
                style={{
                  transform: `translate(${offset.x ?? 0}px, ${offset.y ?? 0}px)`,
                }}
              />
            )}
          </div>
        </FloatingComponent>
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className="fd-z-[99999] fd-w-[360px] fd-min-w-[360px] fd-bg-white fd-rounded-md fd-p-4 fd-shadow-md"
        >
          <Form schema={getSchema()} defaultValues={defaultValues} onSubmit={onSubmit}>
            <FormItems
              onImageUrlChange={setImageUrl}
              onOffsetChange={setOffset}
              onSelectorChange={(selector) => {
                setSelector(selector);
                setTimeout(() => {
                  update();
                }, 100);
              }}
            />
            <div className="fd-flex fd-justify-end fd-mt-2">
              <Button type="submit">{t('保存')}</Button>
            </div>
          </Form>
        </div>
      </>
    )
  );
}

function FormItems({
  onImageUrlChange,
  onOffsetChange,
  onSelectorChange,
}: {
  onImageUrlChange: (url: string) => void;
  onOffsetChange: (offset: { x: number; y: number }) => void;
  onSelectorChange: (selector: string) => void;
}) {
  const { t } = useTranslation();
  const { control } = useFormContext<FormValues>();

  const selector = useWatch({ control, name: 'selector' });
  const [fetching, setFetching] = useState(false);
  // const [preview, setPreview] = useState<string | null>(null);
  // const [creatingPreview, setCreatingPreview] = useState(false);

  const figmaUrl = useWatch({ control, name: 'figmaUrl' });
  const { figmaToken } = useFigmaToken();

  useEffect(() => {
    if (!figmaToken || !figmaUrl) return;
    setFetching(true);
    getFigmaS3Url(figmaToken, figmaUrl).then((res) => {
      const url: string = Object.values(res)[0] as string;
      onImageUrlChange(url);
      setFetching(false);
    });
  }, [figmaToken, figmaUrl, onImageUrlChange]);

  return (
    <>
      <FieldGroup>
        {/* 预览 */}
        {/* <Field label={t('预览')}>
        <div className="fd-flex fd-items-center fd-justify-between">
          {creatingPreview ? (
            <div className="fd-flex fd-min-h-10 w-full">
              <Spinner />
            </div>
          ) : (
            <img src={preview} alt="preview" className="fd-w-full fd-rounded-md" />
          )}
        </div>
      </Field> */}
        <Field label={t('选择器')}>
          <Controller
            name="selector"
            control={control}
            render={({ field }) => {
              return (
                <div className="fd-flex fd-flex-col fd-gap-2">
                  {/* 获取选择器 */}
                  <TextField.Root
                    {...field}
                    placeholder={t('请输入选择器')}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                  />
                  {/* 获取上层选择器 */}
                  <Button
                    variant="soft"
                    color="gray"
                    onClick={() => {
                      const parentSelector = getParentSelector(selector);
                      field.onChange(parentSelector);
                      onSelectorChange(parentSelector);
                    }}
                  >
                    {t('上层')}
                  </Button>
                </div>
              );
            }}
          />
        </Field>
        <Field
          label={
            <div className="fd-flex fd-items-center fd-gap-2">
              {t('Figma URL')}
              {fetching && <Spinner size="1" />}
            </div>
          }
        >
          <Controller
            name="figmaUrl"
            control={control}
            render={({ field }) => (
              <TextField.Root {...field} placeholder={t('请输入 Figma URL')} />
            )}
          />
        </Field>
        <Field label={t('偏移量')}>
          <div className="fd-flex fd-items-center fd-gap-2">
            <Controller
              name="offset"
              control={control}
              render={({ field }) => (
                <div className="fd-flex fd-items-center fd-gap-2">
                  <TextField.Root
                    {...field}
                    type="number"
                    value={field.value.x}
                    placeholder={t('X')}
                    onChange={(e) => {
                      field.onChange({
                        ...field.value,
                        x: parseInt(e.target.value),
                      });
                      onOffsetChange({ x: parseInt(e.target.value), y: field.value.y });
                    }}
                  />
                </div>
              )}
            />
            <Controller
              name="offset"
              control={control}
              render={({ field }) => (
                <TextField.Root
                  {...field}
                  type="number"
                  value={field.value.y}
                  placeholder={t('Y')}
                  onChange={(e) => {
                    field.onChange({
                      ...field.value,
                      y: parseInt(e.target.value),
                    });
                    onOffsetChange({ x: field.value.x, y: parseInt(e.target.value) });
                  }}
                />
              )}
            />
          </div>
        </Field>
      </FieldGroup>
    </>
  );
}

function getParentSelector(selector: string) {
  const parent = document.evaluate(
    selector,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue?.parentElement;

  return getXPath(parent);
}
