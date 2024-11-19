import React from 'react';

import { FieldProps } from './type';
import { cn } from '@/lib/cn';

const Field = (props: FieldProps) => {
  const { children, label, titleRight, helpText, className, ...rest } = props;

  return (
    <div className={className} {...rest}>
      <div className="fd-flex fd-items-center fd-justify-between fd-font-medium">
        {label && <div className="Label">{label}</div>}
        <div style={{ flex: 1 }}>{titleRight}</div>
      </div>
      <div style={{ position: 'relative' }}>{children}</div>
      {helpText && <div>{helpText}</div>}
    </div>
  );
};

const FieldGroup = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return <div className={cn(className, 'fd-grid fd-grid-rows-auto fd-gap-4')}>{children}</div>;
};

export { FieldGroup };
export default Field;
