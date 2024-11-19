import { COMPARE_LIST, COMPARE_LIST_BY_TAG, FIGMA_IMAGE_MAP } from '@/lib/constants';
import getCompareId from '@/lib/getCompareId';
import { CompareItem } from '@/type/compareItem';
import { Box, Spinner, Tabs, Card, Inset, Badge, Button, TextField } from '@radix-ui/themes';
import { TrashSolid } from 'iconoir-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function CompareList() {
  const { t } = useTranslation();
  const [initializing, setInitializing] = useState(true);
  const [compareList, setCompareList] = useState<CompareItem[]>([]);
  const [figmaImageMap, setFigmaImageMap] = useState<Record<string, string>>({});
  const [currentPath, setCurrentPath] = useState<string>(window.location.href);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.href);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const pathCompareList = compareList.filter((item) => item.path === currentPath);

  useEffect(() => {
    chrome.storage.sync.get([COMPARE_LIST_BY_TAG, COMPARE_LIST, FIGMA_IMAGE_MAP]).then((res) => {
      setCompareList(
        (res[COMPARE_LIST] ?? []).filter((item) => {
          try {
            const currentUrl = new URL(window.location.href);
            const itemUrl = new URL(item.path);
            return currentUrl.hostname === itemUrl.hostname;
          } catch {
            return false;
          }
        })
      );
      setFigmaImageMap(res[FIGMA_IMAGE_MAP] ?? {});
      setInitializing(false);
    });
  }, []);

  useEffect(() => {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes[COMPARE_LIST]) {
        setCompareList(changes[COMPARE_LIST]?.newValue ?? []);
      }
      if (changes[FIGMA_IMAGE_MAP]) {
        setFigmaImageMap(changes[FIGMA_IMAGE_MAP]?.newValue ?? {});
      }
    });
  }, []);

  const handleDelete = (item: CompareItem) => {
    const target = compareList.find(
      (i) => i.path === item.path && i.selector === item.selector && i.figmaUrl === item.figmaUrl
    );
    if (target) {
      chrome.storage.sync.set({
        [COMPARE_LIST]: compareList.filter((i) => i != target),
      });
    }
  };

  const handleOffsetChange = (item: CompareItem, offset: { x: number; y: number }) => {
    chrome.storage.sync.set({
      [COMPARE_LIST]: compareList.map((i) =>
        i.path === item.path && i.selector === item.selector && i.figmaUrl === item.figmaUrl
          ? { ...i, offset }
          : i
      ),
    });
  };

  if (initializing) {
    return (
      <div className="fd-h-[100px] fd-w-[100px] fd-flex fd-items-center fd-justify-center">
        <Spinner />
      </div>
    );
  }

  if (pathCompareList.length === 0) {
    return (
      <div className="fd-h-[100px] fd-w-[100px] fd-flex fd-items-center fd-justify-center">
        {t('暂无数据')}
      </div>
    );
  }

  if (pathCompareList.length > 0) {
    return (
      <div className="fd-p-4 fd-max-h-[500px] fd-overflow-y-auto fd-gap-2 fd-flex fd-flex-col">
        {pathCompareList.map((item, index) => (
          <CompareItemRender
            key={index}
            item={item}
            image={figmaImageMap[getCompareId(item)]}
            onDelete={(item) => handleDelete(item)}
            onOffsetChange={(offset) => handleOffsetChange(item, offset)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="fd-p-4 fd-max-h-[500px] fd-overflow-y-auto">
      <div className="fd-flex fd-flex-col fd-gap-4">
        <Tabs.Root defaultValue="account">
          <Tabs.List>
            <Tabs.Trigger value="manual">{t('手动添加')}</Tabs.Trigger>
          </Tabs.List>
          <Box pt="3">
            <Tabs.Content value="manual">
              <div className="fd-flex fd-flex-col fd-gap-2">
                {pathCompareList.map((item, index) => (
                  <CompareItemRender
                    key={index}
                    item={item}
                    image={figmaImageMap[getCompareId(item)]}
                    onDelete={(item) => handleDelete(item)}
                    onOffsetChange={(offset) => handleOffsetChange(item, offset)}
                  />
                ))}
              </div>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </div>
    </div>
  );
}

function CompareItemRender({
  item,
  onDelete,
  image,
  onOffsetChange,
}: {
  item: CompareItem;
  image: string;
  onDelete: (item: CompareItem) => void;
  onOffsetChange: (offset: { x: number; y: number }) => void;
}) {
  return (
    <Card size="2" className="fd-relative fd-flex-shrink-0">
      <div className="fd-absolute fd-top-1 fd-right-1 fd-z-10">
        <Button variant="soft" color="red" size="2" onClick={() => onDelete(item)}>
          <TrashSolid />
        </Button>
      </div>
      <Inset clip="padding-box" side="top" pb="current">
        {image ? (
          <img
            src={image}
            alt="Bold typography"
            style={{
              display: 'block',
              objectFit: 'contain',
              width: '100%',
              height: 140,
              backgroundColor: 'var(--gray-5)',
            }}
          />
        ) : (
          <div className="fd-h-[140px] fd-w-full fd-bg-gray-5"></div>
        )}
      </Inset>
      <div className="fd-flex fd-flex-col fd-gap-2">
        <Badge
          color="blue"
          className="fd-max-w-full fd-overflow-hidden fd-truncate"
          title={item.path}
        >
          {item.path}
        </Badge>
        <Badge
          color="blue"
          className="fd-max-w-full fd-overflow-hidden fd-truncate"
          title={item.selector}
        >
          {item.selector}
        </Badge>
        <Badge
          color="blue"
          className="fd-max-w-full fd-overflow-hidden fd-truncate"
          title={item.figmaUrl}
        >
          {item.figmaUrl}
        </Badge>
        <div className="fd-flex fd-items-center fd-gap-2">
          <TextField.Root
            value={item.offset?.x ?? 0}
            type="number"
            onChange={(e) => {
              onOffsetChange({ x: parseInt(e.target.value), y: item.offset?.y ?? 0 });
            }}
          />
          <TextField.Root
            value={item.offset?.y ?? 0}
            type="number"
            onChange={(e) => {
              onOffsetChange({ x: item.offset?.x ?? 0, y: parseInt(e.target.value) });
            }}
          />
        </div>
      </div>
    </Card>
  );
}
