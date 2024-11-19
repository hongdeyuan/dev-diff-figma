/* eslint-disable @typescript-eslint/ban-ts-comment */
import { COMPARE_LIST, ENABLE, FIGMA_IMAGE_MAP, LAYER_OPACITY } from '@/lib/constants';
import getCompareId from '@/lib/getCompareId';
import React, { useEffect } from 'react';
import FloatingComponent from './FloatingComponent';
import { getFigmaS3Url } from '../lib/getFigmaS3Url';
import useFigmaToken from '@/lib/useFigmaToken';
import { CompareItem } from '@/type/compareItem';
import { size, useClick, useDismiss, useFloating, useInteractions } from '@floating-ui/react';
import { cn } from '@/lib/cn';

export const GET_FIGMA_IMAGE_API = 'https://api.figma.com/v1/images/';

function Reviewer({ inspectorOpen }: { inspectorOpen: boolean }) {
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [enable, setEnable] = React.useState<boolean>(false);
  const [compareList, setCompareList] = React.useState<CompareItem[]>([]);
  const [figmaImageMap, setFigmaImageMap] = React.useState<Record<string, string>>({});
  const { figmaToken } = useFigmaToken();
  const [opacity, setOpacity] = React.useState<number>(1);

  const [currentPath, setCurrentPath] = React.useState<string>(window.location.href);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.href);
    };

    // 监听 popstate 事件
    window.addEventListener('popstate', handleLocationChange);

    // 创建 MutationObserver 监听 URL 变化
    const observer = new MutationObserver(() => {
      if (window.location.href !== currentPath) {
        handleLocationChange();
      }
    });

    // 监听 document.body 的子节点变化
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      observer.disconnect();
    };
  }, [currentPath]);

  const pathCompareList = compareList.filter((item) => item.path === currentPath);

  // 将 pathCompareList 按照 selector 分组，相同分组需要可以切换
  const groupedPathCompareList = pathCompareList.reduce((acc, item) => {
    acc[item.selector] = acc[item.selector] || [];
    acc[item.selector].push(item);
    return acc;
  }, {} as Record<string, CompareItem[]>);

  // 初始化获取 compareList
  useEffect(() => {
    setIsLoading(true);
    chrome.storage.sync.get([COMPARE_LIST, ENABLE, FIGMA_IMAGE_MAP], (res) => {
      if (res[COMPARE_LIST]) {
        setCompareList(res[COMPARE_LIST]);
      }
      setOpacity(res[LAYER_OPACITY] ?? 0.5);
      setEnable(res[ENABLE]);
      setFigmaImageMap(res[FIGMA_IMAGE_MAP] ?? {});
      setIsLoading(false);
    });
  }, []);

  // 监听 storage 变化，更新 compareList
  useEffect(() => {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes[COMPARE_LIST]) {
        setCompareList(changes[COMPARE_LIST]?.newValue ?? []);
      }

      if (changes[FIGMA_IMAGE_MAP]) {
        setFigmaImageMap(changes[FIGMA_IMAGE_MAP]?.newValue ?? {});
      }
      if (changes[ENABLE]) {
        setEnable(changes[ENABLE]?.newValue ?? false);
      }
      if (changes[LAYER_OPACITY]) {
        setOpacity(changes[LAYER_OPACITY]?.newValue ?? 0.5);
      }
    });
  }, []);

  // 请求 figma 图片
  useEffect(() => {
    // TODO: 获取对比列表，根据路径过滤
    if (isLoading) {
      return;
    }
    compareList.forEach((item) => {
      if (figmaImageMap[getCompareId(item)]) {
        return;
      }

      getFigmaS3Url(figmaToken, item.figmaUrl).then((res) => {
        const url: string = Object.values(res)[0] as string;
        chrome.storage.sync.get([FIGMA_IMAGE_MAP]).then((res) => {
          const figmaImageMap = res[FIGMA_IMAGE_MAP] ?? {};
          const newMap = { ...figmaImageMap, [getCompareId(item)]: url };
          chrome.storage.sync
            .set({
              [FIGMA_IMAGE_MAP]: newMap,
            })
            .catch((e) => {
              console.error(e);
            });
        });
      });
    });
  }, [compareList, figmaImageMap, figmaToken, isLoading]);

  if (!enable || isLoading || inspectorOpen) {
    return null;
  }

  return (
    <div className="floating-container ">
      {Object.entries(groupedPathCompareList).map(([selector, items]) => (
        <CompareItemRender
          key={selector}
          items={items}
          selector={selector}
          figmaImageMap={figmaImageMap}
          opacity={opacity}
        />
      ))}
    </div>
  );
}

function CompareItemRender({
  items,
  selector,
  figmaImageMap,
  opacity,
}: {
  items: CompareItem[];
  selector: string;
  figmaImageMap: Record<string, string>;
  opacity: number;
}) {
  const [currentItem, setCurrentItem] = React.useState<CompareItem>(items[0]);
  const [isSelecting, setIsSelecting] = React.useState<boolean>(false);

  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom-start',
    open: isSelecting,
    onOpenChange: setIsSelecting,
    middleware: [
      size({
        padding: 4,
        apply: ({ availableHeight, availableWidth, elements }) => {
          // Change styles, e.g.
          Object.assign(elements.floating.style, {
            maxWidth: `${Math.max(0, availableWidth)}px`,
            maxHeight: `${Math.max(0, availableHeight)}px`,
          });
        },
      }),
    ],
  });

  const click = useClick(context);

  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  useEffect(() => {
    const item = items.find(
      (item) =>
        item.selector === currentItem.selector &&
        item.figmaUrl === currentItem.figmaUrl &&
        item.path === currentItem.path
    );

    if (item) {
      setCurrentItem(item);
    } else {
      setCurrentItem(items[0]);
    }
  }, [currentItem.figmaUrl, currentItem.path, currentItem.selector, items]);

  return (
    <FloatingComponent targetXPath={selector}>
      {/* hover 预览缩略图，点击切换 */}
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        className="fd-aboslute fd-flex fd-flex-col fd-gap-2 fd-top-0 fd-left-0"
        onClick={() => setIsSelecting(!isSelecting)}
      >
        <div
          className={cn(
            'fd-w-[16px] fd-h-[16px] fd-rounded-full fd-bg-violet-500 fd-z-[9999]',
            'fd-text-white fd-text-xs fd-flex fd-items-center fd-justify-center fd-cursor-pointer'
          )}
        >
          {items.length}
        </div>
        {isSelecting && (
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="fd-flex fd-flex-wrap fd-gap-2 fd-bg-white fd-rounded-md fd-p-4 fd-shadow-md fd-overflow-auto"
          >
            {items.map((item) => (
              <div
                key={item.figmaUrl}
                className="fd-w-fit fd-rounded-md fd-border-solid fd-border-violet-300/50 fd-border-[1px] fd-cursor-pointer"
              >
                <img
                  src={figmaImageMap[getCompareId(item)]}
                  onClick={() => setCurrentItem(item)}
                  alt="figma"
                  className="fd-object-cover fd-w-auto fd-h-auto fd-max-w-fit"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <img
        className="fd-absolute fd-w-fit fd-h-fit fd-max-w-fit fd-max-h-fit fd-rounded-md fd-pointer-events-none fd-top-0 fd-left-0"
        src={figmaImageMap[getCompareId(currentItem)]}
        alt="figma"
        style={{
          display: isSelecting ? 'none' : 'block',
          opacity,
          transform: `translate(${currentItem?.offset?.x ?? 0}px, ${
            currentItem?.offset?.y ?? 0
          }px)`,
        }}
      />
    </FloatingComponent>
  );
}

export default Reviewer;
