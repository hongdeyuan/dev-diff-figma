import React from 'react';

export interface FieldProps {
  children?: React.ReactElement | React.ReactNode;
  name?: string;
  label?: string | React.ReactElement;
  width?: string;
  titleRight?: string | React.ReactElement;
  helpText?: React.ReactNode;
  className?: string;
}
