import i18nService from './i18nService';
import translationEN from './locale/en.json';
import translationZH from './locale/zh.json';

const NEXT_HOST_I18N_INSTANCE_NAME = 'pluto_i18n';

i18nService.getOrCreateI18nInstance(NEXT_HOST_I18N_INSTANCE_NAME, {
  resources: {
    en: {
      translation: translationEN,
    },
    zh: {
      translation: translationZH,
    },
  },
});
