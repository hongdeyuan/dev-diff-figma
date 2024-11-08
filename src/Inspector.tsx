import DomInspector from 'dom-inspector';
import { useCallback, useEffect, useRef, useState } from 'react';

export function Inspector() {
  const [open, setOpen] = useState(false);
  const inspectorRef = useRef<DomInspector | null>(null);

  useEffect(() => {
    inspectorRef.current = new DomInspector({
      root: 'body',
      exclude: ['#dev-diff-root'],
      theme: 'inspector-theme',
      // maxZIndex: '', // max z index, if blank, will auto get document.all max z index
    });
  }, []);

  const handleClick = useCallback((e: MouseEvent) => {
    // 判断点击不在 #dev-diff-root 内，在 #dev-diff-root 内则不进行操作
    if (document.querySelector('#dev-diff-root')?.contains(e.target as Node)) {
      return;
    }

    if (inspectorRef.current) {
      const selector = inspectorRef.current.getSelector(e.target as HTMLElement);
      inspectorRef.current.pause();
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      window.addEventListener('click', handleClick);
    } else {
      window.removeEventListener('click', handleClick);
    }
  }, [handleClick, open]);

  return (
    <div className="fixed top-0 left-0 w-auto h-auto bg-white p-4 z-[9999px]">
      <button
        onClick={() => {
          if (open) {
            if (inspectorRef.current) {
              inspectorRef.current.disable();
              setOpen(false);
            }
          } else {
            if (inspectorRef.current) {
              inspectorRef.current.enable();
            }
            setOpen(true);
          }
        }}
      >
        {open ? 'close' : 'open'}
      </button>
    </div>
  );
}
