import React from 'react';
import { Box, Text } from '@radix-ui/themes';

import { FieldProps } from './type';

const Field = (props: FieldProps) => {
  const { children, label, titleRight, helpText, className, ...rest } = props;

  return (
    <Box className={className} {...rest}>
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {label && <Text className="Label">{label}</Text>}
        <Box style={{ flex: 1 }}>{titleRight}</Box>
      </Box>
      <Box style={{ position: 'relative' }}>{children}</Box>
      {helpText && <Box>{helpText}</Box>}
    </Box>
  );
};

const FieldGroup = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <Box className={className} style={{ display: 'grid', rowGap: '16px' }}>
      {children}
    </Box>
  );
};

export { FieldGroup };
export default Field;
