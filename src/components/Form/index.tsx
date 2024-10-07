import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { useForm, FormProvider, UseFormReturn } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import type { FormProps } from './type';

const Form = forwardRef((props: FormProps, ref) => {
  const {
    defaultValues,
    schema,
    mode = 'onChange',
    reValidateMode = 'onChange',
    onSubmit,
    onSubmitError,
    children,
    className,
    context,
  } = props;

  const methods: UseFormReturn = useForm({
    mode: mode,
    reValidateMode: reValidateMode,
    defaultValues,
    resolver: schema && yupResolver(schema),
    context,
  });

  const handleSubmit = useMemo(() => {
    if (onSubmit) {
      return methods.handleSubmit(onSubmit, onSubmitError);
    }
  }, [methods, onSubmit, onSubmitError]);

  const errors = methods.formState.errors;

  useImperativeHandle(ref, () => ({
    submit: () => {
      if (Object.keys(errors).length === 0) {
        if (typeof handleSubmit === 'function') {
          return handleSubmit();
        } else {
          throw new Error('handleSubmit is not a function');
        }
      }
    },
  }));

  return (
    <FormProvider {...methods}>
      <form
        className={className}
        onSubmit={(e) => {
          if (typeof handleSubmit === 'function') handleSubmit();
          e.preventDefault();
        }}
        style={{ width: '100%' }}
      >
        {children}
      </form>
    </FormProvider>
  );
});

export default Form;
