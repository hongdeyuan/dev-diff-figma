import React, { useEffect } from 'react';

function FloatingComponent({
  targetXPath,
  fitTarget,
  children,
}: {
  targetXPath: string;
  fitTarget?: boolean;
  children: React.ReactNode;
}) {
  const floatingRef = React.useRef(null);

  useEffect(() => {
    if (!targetXPath) return;
    const updatePosition = () => {
      const targetElement = document.evaluate(
        targetXPath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
      if (targetElement && targetElement instanceof HTMLElement) {
        const rect = targetElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        floatingRef.current.style.display = 'block';
        floatingRef.current.style.top = `${rect.top + scrollTop}px`;
        floatingRef.current.style.left = `${rect.left + scrollLeft}px`;
        if (fitTarget) {
          floatingRef.current.style.width = `${rect.width}px`;
          floatingRef.current.style.height = `${rect.height}px`;
        }
      } else {
        floatingRef.current.style.display = 'none';
      }
    };

    // 初始化位置
    updatePosition();

    // 每秒检查一次位置
    const interval = setInterval(updatePosition, 1000);

    // 监听滚动和窗口大小变化
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    // 清除事件监听器
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [fitTarget, targetXPath]);

  return (
    <div
      ref={floatingRef}
      style={{
        position: 'fixed',
        zIndex: 1000,
      }}
    >
      {children}
    </div>
  );
}

export default FloatingComponent;
