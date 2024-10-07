import React from 'react';
import { Mode } from 'react-hook-form';
import { AnyObjectSchema } from 'yup';

export interface FormProps {
  defaultValues: {
    [key: string]: unknown;
  };
  children: React.ReactElement | React.ReactNode;
  onSubmit?: (data: unknown, e?: React.BaseSyntheticEvent) => void | Promise<unknown>;
  onSubmitError?: (error: unknown, e?: React.BaseSyntheticEvent) => void;
  mode?: Mode;
  reValidateMode?: Exclude<Mode, 'onTouched' | 'all'>;
  schema?: AnyObjectSchema;
  className?: string;
  context?: unknown;
}
