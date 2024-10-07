/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Button, Flex, TextArea } from '@radix-ui/themes';

import { Form, Field, FieldGroup } from './components';
import { FIGMA_TOKEN } from './lib/constants';

interface FormValues {
  token?: string;
}

function SettingForm() {
  const { t } = useTranslation();
  const defaultToken = window.localStorage.getItem(FIGMA_TOKEN) ?? '';
  const onSubmit = React.useCallback(async (data: unknown) => {
    const curData = data as FormValues;
    window.localStorage.setItem('figma_token', curData.token);
  }, []);

  return (
    <Form schema={getSchema()} defaultValues={{ token: defaultToken }} onSubmit={onSubmit}>
      <FormItems />
      <Flex gap="1" className="mt-4">
        <Button type="submit">{t('保存')}</Button>
      </Flex>
    </Form>
  );
}

export default SettingForm;

function getSchema() {
  return yup.object().shape({
    token: yup.string().optional(),
  });
}

function FormItems() {
  const { t } = useTranslation();
  const { control } = useFormContext<FormValues>();

  return (
    <FieldGroup>
      <Field label={t('Figma 令牌')}>
        <Controller
          name="token"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              rows={4}
              placeholder={t('请输入 figma token')}
              className="Textarea"
              style={{ width: '100%', lineHeight: '16px', borderRadius: '4px', zIndex: 2147483647 }}
              onDrag={(e) => {
                e.preventDefault();
              }}
            />
          )}
        />
      </Field>
    </FieldGroup>
  );
}
